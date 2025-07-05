"use client";

import React, { useState, FormEvent } from "react";
import { useDevnetWallet } from "@/lib/devnet-wallet-context";
import { openContractCall } from "@/lib/contract-utils";
import { getHealthchainContract } from "@/constants/contracts";
import { useNetwork } from "@/lib/use-network";
import { devnetWallets } from "@/lib/devnet-wallet-context";
import { getApi } from '@/lib/stacks-api';

export default function RecordUploadForm() {
  const { currentWallet } = useDevnetWallet();
  const network = useNetwork();
  const [recordData, setRecordData] = useState("");
  const [recordType, setRecordType] = useState("lab");
  const [status, setStatus] = useState<null | string>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    
    if (!recordData.trim()) {
      setStatus("Kayıt verilerini giriniz.");
      setLoading(false);
      return;
    }

    if (!currentWallet) {
      setStatus("Lütfen cüzdanınızı bağlayın.");
      setLoading(false);
      return;
    }

    try {
      // Test cüzdanı kontrolü
      const isTestWallet = devnetWallets.some(w => w.stxAddress === currentWallet.stxAddress);
      
      if (isTestWallet) {
        // Test cüzdanları için simülasyon modu
        setStatus("Test cüzdanı - Simülasyon modu...");
        
        // Gerçek API çağrısı yap (bakiye kontrolü)
        const api = getApi(network);
        const balanceResult = await api.accountsApi.getAccountBalance({
          principal: currentWallet.stxAddress
        });

        console.log('Test wallet balance:', balanceResult);
        
        // Simüle edilmiş işlem
        setTimeout(() => {
          // Local storage'a test kayıt ekle
          const recordKey = `record_${currentWallet.stxAddress}_${Date.now()}`;
          localStorage.setItem(recordKey, JSON.stringify({
            patient: currentWallet.stxAddress,
            type: recordType,
            data: recordData,
            uploadedAt: new Date().toISOString(),
            testMode: true,
            balance: balanceResult.stx?.balance || '0',
            simulated: true
          }));
          
          setStatus("✅ Test modunda kayıt yüklendi! (Simülasyon)");
          setRecordData(""); // Formu temizle
          setLoading(false);
        }, 2000);
        
        return;
      }

      // Gerçek cüzdan için blockchain işlemi
      setStatus("Gerçek cüzdan - Hiro Wallet ile onaylayın...");
      
      const contract = getHealthchainContract(network);
      await openContractCall({
        contractAddress: contract.contractAddress,
        contractName: contract.contractName,
        functionName: "upload-record",
        functionArgs: [recordType, recordData],
        network: network,
        onFinish: () => {
          setStatus("✅ Kayıt yüklendi! İşlem blockchain'e gönderildi.");
          setRecordData(""); // Formu temizle
        },
        onCancel: () => setStatus("❌ İşlem iptal edildi."),
      });
    } catch (err) {
      console.error('Error:', err);
      setStatus("❌ Kayıt yüklenirken hata oluştu: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Test cüzdanı kontrolü
  const isTestWallet = currentWallet && devnetWallets.some(w => w.stxAddress === currentWallet.stxAddress);

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded p-6 shadow mb-6">
      <h2 className="text-xl font-bold mb-2 text-blue-600">Sağlık Kaydı Yükle</h2>
      
      {isTestWallet && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-700">
            <strong>🧪 Test Modu:</strong> Simülasyon ile çalışır. Hiro Wallet gerekmez.
          </p>
        </div>
      )}
      
      {!isTestWallet && currentWallet && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
          <p className="text-sm text-green-700">
            <strong>🔗 Gerçek Cüzdan:</strong> Hiro Wallet ile blockchain işlemi yapılacak.
          </p>
        </div>
      )}
      
      <select
        className="w-full border rounded p-2 mb-2"
        value={recordType}
        onChange={e => setRecordType(e.target.value)}
        disabled={loading}
      >
        <option value="lab">Laboratuvar Sonucu</option>
        <option value="radiology">Radyoloji</option>
        <option value="prescription">Reçete</option>
        <option value="note">Doktor Notu</option>
      </select>
      
      <textarea
        className="w-full border rounded p-2 mb-2"
        placeholder="Kayıt verilerini giriniz..."
        value={recordData}
        onChange={e => setRecordData(e.target.value)}
        rows={4}
        required
        disabled={loading}
      />
      
      <button
        type="submit"
        className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={loading}
      >
        {loading ? 'İşleniyor...' : (isTestWallet ? 'Test Kaydı Yükle' : 'Kayıt Yükle')}
      </button>
      {status && <div className="mt-2 text-sm">{status}</div>}
    </form>
  );
} 