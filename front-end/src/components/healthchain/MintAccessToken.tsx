"use client";

import React, { useState, FormEvent } from "react";
import { useDevnetWallet } from "@/lib/devnet-wallet-context";
import { mintAccessToken, checkHasAccessToken, getAccessTokenId } from "@/lib/healthchain/operations";
import { useNetwork, isDevnetEnvironment } from "@/lib/use-network";

export default function MintAccessToken() {
  const { currentWallet } = useDevnetWallet();
  const network = useNetwork();
  const [status, setStatus] = useState<null | string>(null);
  const [loading, setLoading] = useState(false);
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  const [tokenId, setTokenId] = useState<number | null>(null);

  // Kullanıcının token'ı olup olmadığını kontrol et
  const checkTokenStatus = async () => {
    if (!network) return;
    
    // Devnet modunda wallet olmadan da çalış
    const userAddress = currentWallet?.stxAddress || 'devnet-user';
    
    try {
      const hasAccessToken = await checkHasAccessToken(userAddress, network);
      setHasToken(hasAccessToken);
      
      if (hasAccessToken) {
        const id = await getAccessTokenId(userAddress, network);
        setTokenId(id);
      }
    } catch (error) {
      console.error('Error checking token status:', error);
    }
  };

  // Wallet-specific token key oluştur
  const getWalletSpecificKey = (walletAddress: string) => {
    return `devnet_access_token_${walletAddress}`;
  };

  // Component mount olduğunda token durumunu kontrol et
  React.useEffect(() => {
    checkTokenStatus();
  }, [currentWallet, network, isDevnetEnvironment()]);

  const handleMintToken = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    
    if (!currentWallet && !isDevnetEnvironment()) {
      setStatus("Lütfen bir cüzdan seçin.");
      setLoading(false);
      return;
    }

    try {
      const userAddress = currentWallet?.stxAddress || 'devnet-user';
      
      if (isDevnetEnvironment()) {
        // Devnet için otomatik işlem
        setStatus("Devnet: Otomatik NFT oluşturuluyor...");
        
        await mintAccessToken(network, userAddress);
        
        // İşlem başarılı olduktan sonra token durumunu kontrol et
        setTimeout(async () => {
          await checkTokenStatus();
          setStatus("✅ NFT oluşturuldu! Devnet'te otomatik işlem tamamlandı.");
        }, 2000);
      } else {
        // Testnet/Mainnet için Hiro Wallet bağlantısı
        setStatus("Hiro Wallet ile NFT oluşturun...");
        
        await mintAccessToken(network, userAddress);
        
        // İşlem başarılı olduktan sonra token durumunu kontrol et
        setTimeout(async () => {
          await checkTokenStatus();
          setStatus("✅ NFT oluşturuldu! İşlem blockchain'e gönderildi.");
        }, 2000);
      }
      
    } catch (err) {
      console.error('Error:', err);
      setStatus("❌ NFT oluşturulurken hata oluştu: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (hasToken) {
    return (
      <div className="bg-green-50 border border-green-200 rounded p-6 shadow mb-6">
        <h2 className="text-xl font-bold mb-2 text-green-600">✅ Erişim Token'ınız Mevcut</h2>
        <div className="space-y-2">
          <p className="text-green-700">
            <strong>Token ID:</strong> #{tokenId}
          </p>
          <p className="text-green-700">
            <strong>Durum:</strong> Aktif
          </p>
          <p className="text-green-700">
            <strong>Mod:</strong> Blockchain
          </p>
        </div>
        <button
          onClick={checkTokenStatus}
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Durumu Yenile
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleMintToken} className="bg-white rounded p-6 shadow mb-6">
      <h2 className="text-xl font-bold mb-2 text-blue-600">🔑 Erişim Token'ı Oluştur (NFT)</h2>
      
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-700 mb-2">
          <strong>NFT Erişim Token'ı Nedir?</strong>
        </p>
        <ul className="text-xs text-blue-600 space-y-1">
          <li>• Benzersiz bir NFT (Non-Fungible Token)</li>
          <li>• Sağlık verilerinize erişim anahtarı</li>
          <li>• Doktorlara yetki vermek için gerekli</li>
          <li>• Cüzdanınızda güvenle saklanır</li>
        </ul>
      </div>
      
      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
        <p className="text-sm text-green-700">
          <strong>🔗 Blockchain İşlemi:</strong> {isDevnetEnvironment() ? 'Devnet API ile otomatik NFT oluşturulacak.' : 'Hiro Wallet ile gerçek NFT oluşturulacak.'}
        </p>
      </div>
      
      <button
        type="submit"
        className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={loading}
      >
        {loading ? 'NFT Oluşturuluyor...' : 'NFT Oluştur'}
      </button>
      {status && <div className="mt-2 text-sm">{status}</div>}
    </form>
  );
} 