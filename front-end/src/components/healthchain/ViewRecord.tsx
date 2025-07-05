"use client";

import React, { useState, FormEvent } from "react";
import { useDevnetWallet } from "@/lib/devnet-wallet-context";
import { getHealthchainContract } from "@/constants/contracts";
import { useNetwork } from "@/lib/use-network";
import { getApi } from '@/lib/stacks-api';
import { bufferToString, checkUserAccess } from '@/lib/healthchain/operations';
import { devnetWallets } from "@/lib/devnet-wallet-context";

export default function ViewRecord() {
  const { currentWallet } = useDevnetWallet();
  const network = useNetwork();
  const [patient, setPatient] = useState("");
  const [record, setRecord] = useState<null | string>(null);
  const [status, setStatus] = useState<null | string>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus(null);
    setRecord(null);
    setLoading(true);
    
    if (!patient.trim()) {
      setStatus("Hasta adresi giriniz.");
      setLoading(false);
      return;
    }

    if (!currentWallet) {
      setStatus("Lütfen bir cüzdan seçin.");
      setLoading(false);
      return;
    }

    try {
      // 0. Erişim kontrolü - sadece hasta kendisi veya yetkili doktorlar görebilir
      if (patient === currentWallet.stxAddress) {
        // Hasta kendisi görüntülüyor - izin ver
        console.log("Hasta kendi verilerini görüntülüyor");
      } else {
        // Başka birinin verilerini görüntülemeye çalışıyor - yetki kontrolü yap
        const hasAccess = await checkUserAccess(patient, currentWallet.stxAddress, network);
        if (!hasAccess) {
          setStatus("❌ Bu hasta verilerine erişim yetkiniz yok. Önce hasta tarafından yetkilendirilmeniz gerekiyor.");
          setLoading(false);
          return;
        }
        console.log("Yetkili kullanıcı hasta verilerini görüntülüyor");
      }

      // 1. Önce önceden tanımlanmış profilleri kontrol et
      const predefinedWallet = devnetWallets.find(w => w.stxAddress === patient);
      if (predefinedWallet && predefinedWallet.profileData) {
        const profileData = {
          ...predefinedWallet.profileData,
          walletAddress: predefinedWallet.stxAddress,
          role: predefinedWallet.role,
          timestamp: new Date().toISOString(),
          accessGrantedBy: currentWallet.stxAddress
        };
        setRecord(JSON.stringify(profileData, null, 2));
        setStatus("✅ Önceden tanımlanmış profil verisi bulundu! (Erişim kontrolü geçildi)");
        setLoading(false);
        return;
      }

      // 2. Local storage'dan profil verilerini kontrol et
      const profileKey = `patient_profile_${patient}`;
      const savedProfile = localStorage.getItem(profileKey);
      
      if (savedProfile) {
        const profileData = JSON.parse(savedProfile);
        setRecord(JSON.stringify(profileData, null, 2));
        setStatus("Local storage'dan profil verisi bulundu!");
        setLoading(false);
        return;
      }

      // 3. Test erişim kayıtlarını kontrol et
      if (currentWallet) {
        const accessKey = `access_${patient}_${currentWallet.stxAddress}`;
        const savedAccess = localStorage.getItem(accessKey);
        if (savedAccess) {
          const accessData = JSON.parse(savedAccess);
          setRecord(JSON.stringify(accessData, null, 2));
          setStatus("Test erişim kaydı bulundu!");
          setLoading(false);
          return;
        }
      }

      // 4. Gerçek API çağrısı yap
      if (!network) {
        setStatus("Ağ bağlantısı gerekli.");
        setLoading(false);
        return;
      }

      const api = getApi(network);
      
      // Cüzdan bakiyesini kontrol et
      try {
        const balanceResult = await api.accountsApi.getAccountBalance({
          principal: patient
        });
        
        console.log('Patient wallet balance:', balanceResult);
        
        // Test cüzdanı kontrolü
        const isTestWallet = devnetWallets.some(w => w.stxAddress === patient);
        if (isTestWallet) {
          setStatus("Test cüzdanı - Gerçek API çağrısı yapıldı. Blockchain verisi simüle ediliyor...");
          
          // Simüle edilmiş blockchain verisi
          const simulatedData = {
            patient: patient,
            balance: balanceResult.stx?.balance || '0',
            lastTransaction: new Date().toISOString(),
            testMode: true,
            message: "Bu test cüzdanı için blockchain verisi simüle edildi"
          };
          
          setTimeout(() => {
            setRecord(JSON.stringify(simulatedData, null, 2));
            setStatus("Test cüzdanı - Gerçek API + Simülasyon tamamlandı!");
            setLoading(false);
          }, 2000);
          
          return;
        }
      } catch (error) {
        console.error('API error:', error);
        setStatus("API çağrısı başarısız: " + (error as Error).message);
        setLoading(false);
        return;
      }

      // 5. Gerçek cüzdan için blockchain'den dene
      if (!currentWallet) {
        setStatus("Cüzdan bağlantısı gerekli.");
        setLoading(false);
        return;
      }

      const contract = getHealthchainContract(network);

      try {
        // Önce profil verilerini blockchain'den al
        const profileResult = await api.smartContractsApi.callReadOnlyFunction({
          contractAddress: contract.contractAddress,
          contractName: contract.contractName,
          functionName: "get-profile",
          readOnlyFunctionArgs: {
            sender: currentWallet.stxAddress,
            arguments: [patient],
          },
        });

        if (profileResult && profileResult.result) {
          // Profil verilerini decode et
          const profileData = JSON.parse(bufferToString(profileResult.result));
          setRecord(JSON.stringify(profileData, null, 2));
          setStatus("Blockchain'den profil verisi alındı!");
          setLoading(false);
          return;
        }

        // Profil yoksa kayıtları dene
        const recordResult = await api.smartContractsApi.callReadOnlyFunction({
          contractAddress: contract.contractAddress,
          contractName: contract.contractName,
          functionName: "get-record",
          readOnlyFunctionArgs: {
            sender: currentWallet.stxAddress,
            arguments: [patient, "0"], // İlk kayıt
          },
        });

        if (recordResult && recordResult.result) {
          const recordData = JSON.parse(bufferToString(recordResult.result));
          setRecord(JSON.stringify(recordData, null, 2));
          setStatus("Blockchain'den kayıt verisi alındı!");
        } else {
          setStatus("Blockchain'de veri bulunamadı veya erişim reddedildi.");
        }
      } catch (error) {
        console.error('Blockchain error:', error);
        setStatus("Blockchain'den veri alınırken hata oluştu: " + (error as Error).message);
      }
    } catch (err) {
      console.error("Hata:", err);
      setStatus("Veri alınırken hata oluştu: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Test hastaları için öneriler
  const testPatients = devnetWallets
    .filter(w => w.role === 'patient')
    .map(w => w.stxAddress);

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded p-6 shadow mb-6">
      <h2 className="text-xl font-bold mb-2 text-emerald-600">Hasta Kaydını Görüntüle</h2>
      
      {currentWallet && devnetWallets.some(w => w.stxAddress === currentWallet.stxAddress) && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-700">
            <strong>Test Modu:</strong> Gerçek API çağrıları yapılacak, blockchain simüle edilecek.
          </p>
        </div>
      )}
      
      {testPatients.length > 0 && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
          <p className="text-sm text-green-700 mb-2">
            <strong>Test Hastaları:</strong>
          </p>
          {testPatients.map((address, index) => (
            <div key={index} className="text-xs text-green-600 font-mono mb-1">
              {address}
            </div>
          ))}
        </div>
      )}
      
      <input
        className="w-full border rounded p-2 mb-2"
        type="text"
        placeholder="Hastanın Stacks adresi"
        value={patient}
        onChange={e => setPatient(e.target.value)}
        required
        disabled={loading}
      />
      <button
        type="submit"
        className={`bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={loading}
      >
        {loading ? 'Aranıyor...' : 'Kaydı Görüntüle'}
      </button>
      {status && <div className="mt-2 text-sm">{status}</div>}
      {record && (
        <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded">
          <strong>Kayıt:</strong>
          <pre className="whitespace-pre-wrap">{record}</pre>
        </div>
      )}
    </form>
  );
} 