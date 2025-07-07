"use client";

import React, { useState, FormEvent } from "react";
import { mintAccessToken, checkHasAccessToken, getAccessTokenId, deleteAccessToken } from "@/lib/healthchain/operations";
import { useNetwork } from "@/lib/use-network";
import { useCurrentAddress } from "@/hooks/useCurrentAddress";

export default function MintAccessToken() {
  const stxAddress = useCurrentAddress();
  const network = useNetwork();
  const [status, setStatus] = useState<null | string>(null);
  const [loading, setLoading] = useState(false);
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  const [tokenId, setTokenId] = useState<number | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");

  // Kullanıcının token'ı olup olmadığını kontrol et (sadece blockchain)
  const checkTokenStatus = async () => {
    if (!stxAddress) return;
    
    setLoading(true);
    try {
      console.log('Token durumu kontrol ediliyor...');
      console.log('Kullanıcı adresi:', stxAddress);
      console.log('Network:', network);
      
      // Blockchain'den gerçek token durumunu kontrol et
      const hasTokenResult = await checkHasAccessToken(network, stxAddress);
      console.log('Has token result:', hasTokenResult);
      
      // Token ID'yi kontrol et
      let tokenIdResult = null;
      if (hasTokenResult) {
        tokenIdResult = await getAccessTokenId(network, stxAddress);
        console.log('Token ID result:', tokenIdResult);
      }
      
      // hasToken sadece geçerli bir token ID varsa true olmalı
      const finalHasToken = hasTokenResult && tokenIdResult !== null && tokenIdResult !== undefined;
      
      setHasToken(finalHasToken);
      setTokenId(tokenIdResult ? Number(tokenIdResult) : null);
      
      if (finalHasToken) {
        setDebugInfo(`Token ID: ${tokenIdResult}, Has Token: ${finalHasToken}, Address: ${stxAddress}`);
      } else {
        setDebugInfo(`Has Token: ${finalHasToken}, Token ID: ${tokenIdResult}, Address: ${stxAddress}`);
      }
    } catch (error) {
      console.error('Token durumu kontrol edilirken hata:', error);
      setHasToken(false);
      setTokenId(null);
      setDebugInfo(`Hata: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // Token oluştur
  const handleMintToken = async (e: FormEvent) => {
    e.preventDefault();
    if (!stxAddress) return;

    setLoading(true);
    setStatus("Token durumu kontrol ediliyor...");

    try {
      // Önce mevcut token'ı kontrol et
      const existingToken = await checkHasAccessToken(network, stxAddress);
      if (existingToken) {
        const existingTokenId = await getAccessTokenId(network, stxAddress);
        if (existingTokenId !== null && existingTokenId !== undefined) {
          setStatus("Zaten bir erişim token'ınız var! Token oluşturulamaz.");
          setHasToken(true);
          setTokenId(Number(existingTokenId));
          return;
        }
      }

      setStatus("Token oluşturuluyor...");
      const result = await mintAccessToken(network, stxAddress);
      
      if (result.success) {
        setStatus(`✅ Transaction gönderildi! TX ID: ${result.transactionId}. İşlem mempool'da bekliyor, lütfen cüzdanınızda onaylayın.`);
        
        // Poll for token status every 10 seconds for 2 minutes
        let attempts = 0;
        const maxAttempts = 12; // 2 minutes total
        
        const pollInterval = setInterval(async () => {
          attempts++;
          console.log(`🔄 Polling attempt ${attempts}/${maxAttempts} for token status...`);
          
          try {
            await checkTokenStatus();
            
            // If we have a token now, stop polling
            if (hasToken && tokenId !== null) {
              clearInterval(pollInterval);
              setStatus(`🎉 Token başarıyla oluşturuldu! Token ID: ${tokenId}`);
              return;
            }
            
            // If max attempts reached, stop polling
            if (attempts >= maxAttempts) {
              clearInterval(pollInterval);
              setStatus(`⏰ 2 dakika geçti, işlem hala pending. Lütfen manuel olarak "Durumu Yenile" butonuna tıklayın.`);
              return;
            }
            
            setStatus(`⏳ İşlem mempool'da bekliyor... (${attempts}/${maxAttempts})`);
          } catch (error) {
            console.error('Polling error:', error);
          }
        }, 10000); // 10 seconds
        
      } else {
        setStatus("❌ Token oluşturma işlemi başarısız!");
      }
    } catch (error) {
      console.error('Token oluşturma hatası:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('err u1')) {
        setStatus("Hata: Zaten bir erişim token'ınız var. Lütfen 'Durumu Yenile' butonuna tıklayın.");
      } else {
        setStatus(`Hata: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Token sil
  const handleDeleteToken = async () => {
    if (!stxAddress) return;

    setLoading(true);
    setStatus("Token siliniyor...");

    try {
      const result = await deleteAccessToken(network, stxAddress);
      if (result) {
        setStatus("Token silme işlemi başlatıldı! Lütfen cüzdanınızda işlemi onaylayın.");
        setHasToken(false);
        setTokenId(null);
        
        // Token durumunu yenile
        setTimeout(() => {
          checkTokenStatus();
        }, 5000);
      } else {
        setStatus("Token silme işlemi başarısız!");
      }
    } catch (error) {
      console.error('Token silme hatası:', error);
      setStatus(`Hata: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // Sayfa yüklendiğinde token durumunu kontrol et
  React.useEffect(() => {
    if (stxAddress) {
      checkTokenStatus();
    }
  }, [stxAddress, network]);

  if (!stxAddress) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Erişim Tokenı Yönetimi</h2>
        <p className="text-gray-600">Lütfen önce cüzdanınızı bağlayın.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Erişim Tokenı Yönetimi</h2>
      
      {/* Debug Bilgisi */}
      <div className="mb-4 p-3 bg-gray-100 rounded text-sm">
        <strong>Debug Bilgisi:</strong>
        <div>Adres: {stxAddress}</div>
        <div>Network: {network}</div>
        <div>Token Durumu: {hasToken ? 'Var' : 'Yok'}</div>
        <div>Token ID: {tokenId !== null ? tokenId : 'Bulunamadı'}</div>
        <div className="mt-2 text-xs text-gray-600">{debugInfo}</div>
        <div className="mt-2 text-xs text-blue-600">
          {hasToken && tokenId !== null ? '✅ Geçerli token mevcut' : '❌ Geçerli token yok'}
        </div>
      </div>

      {/* Token Durumu */}
      {hasToken && tokenId !== null ? (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            ✅ Erişim Token'ınız Mevcut
          </h3>
          <div className="space-y-2 text-green-700">
            <div><strong>Token ID:</strong> #{tokenId}</div>
            <div><strong>Durum:</strong> Aktif</div>
            <div><strong>Mod:</strong> Blockchain</div>
            <div><strong>Adres:</strong> {stxAddress}</div>
          </div>
          <p className="mt-3 text-sm text-green-600">
            Bu token ile doktorlara erişim yetkisi verebilir ve sağlık verilerinizi yönetebilirsiniz.
          </p>
          
          <div className="mt-4 space-x-2">
            <button
              onClick={checkTokenStatus}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "Yükleniyor..." : "Durumu Yenile"}
            </button>
            
            <button
              onClick={handleDeleteToken}
              disabled={loading}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              {loading ? "Siliniyor..." : "Token'ı Sil"}
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            ⚠️ Erişim Token'ınız Yok
          </h3>
          <p className="text-yellow-700 mb-4">
            Sağlık verilerinizi yönetmek ve doktorlara erişim yetkisi vermek için bir erişim tokenı oluşturmanız gerekiyor.
          </p>
          
          <form onSubmit={handleMintToken} className="space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "Oluşturuluyor..." : "Erişim Tokenı Oluştur"}
            </button>
          </form>
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-700">
              <strong>Bilgi:</strong> Eğer "err u1" hatası alırsanız, bu zaten bir token'ınız olduğu anlamına gelir. 
              Lütfen "Durumu Yenile" butonuna tıklayarak token durumunuzu kontrol edin.
            </p>
          </div>
        </div>
      )}

      {/* Durum Mesajı */}
      {status && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-blue-800">
          {status}
        </div>
      )}

      {/* Debug Butonları */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Debug İşlemleri:</h4>
        <div className="space-x-2">
          <button
            onClick={checkTokenStatus}
            className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Token Durumunu Kontrol Et
          </button>
        </div>
      </div>
    </div>
  );
} 