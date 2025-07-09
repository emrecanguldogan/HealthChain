"use client";

import React, { useState, FormEvent, useContext } from "react";
import { mintAccessToken, hasAccessToken, getAccessToken } from "@/lib/healthchain/operations";
import { useNetwork } from "@/lib/use-network";
import { HiroWalletContext } from "@/components/HiroWalletProvider";

export default function MintAccessToken() {
  const { testnetAddress, mainnetAddress, network, isWalletConnected } = useContext(HiroWalletContext);
  const currentNetwork = useNetwork();
  const [status, setStatus] = useState<null | string>(null);
  const [loading, setLoading] = useState(false);
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  const [tokenId, setTokenId] = useState<number | null>(null);

  const currentAddress = currentNetwork === 'testnet' ? testnetAddress : mainnetAddress;

  // Kullanıcının token'ı olup olmadığını kontrol et
  const checkTokenStatus = async () => {
    if (!network || !currentAddress) return;
    
    try {
      const userHasToken = await hasAccessToken(currentAddress, network);
      setHasToken(userHasToken);
      
      if (userHasToken) {
        const token = await getAccessToken(currentAddress, network);
        if (token) {
          setTokenId(token.tokenId);
        }
      }
    } catch (error) {
      console.error('Error checking token status:', error);
    }
  };

  // Component mount olduğunda token durumunu kontrol et
  React.useEffect(() => {
    checkTokenStatus();
  }, [currentAddress, network]);

  const handleMintToken = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    
    if (!isWalletConnected || !currentAddress || !network) {
      setStatus("Lütfen Hiro Wallet'ı bağlayın.");
      setLoading(false);
      return;
    }

    try {
      setStatus("Hiro Wallet ile NFT oluşturun...");
      
      await mintAccessToken(currentAddress, network);
      
      // İşlem başarılı olduktan sonra token durumunu kontrol et
      setTimeout(async () => {
        await checkTokenStatus();
        setStatus("✅ NFT oluşturuldu! İşlem blockchain'e gönderildi.");
      }, 2000);
      
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
      <h2 className="text-xl font-bold mb-2 text-blue-600">�� Erişim Token'ı Oluştur (NFT)</h2>
      
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
          <strong>🔗 Blockchain İşlemi:</strong> Hiro Wallet ile gerçek NFT oluşturulacak.
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