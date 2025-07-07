"use client";

import React from "react";
import { useCurrentAddress } from "@/hooks/useCurrentAddress";
import { ConnectWalletButton } from "@/components/ConnectWallet";

export default function WalletSelect() {
  const stxAddress = useCurrentAddress();

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <svg className="w-16 h-16 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold text-emerald-600 mb-2">HealthChain</h1>
          <p className="text-lg text-slate-200 font-medium">
            Wallet Bağlantısı
          </p>
          <p className="text-sm text-slate-400 mt-2">
            Hiro Wallet ile bağlanın ve testnet'te işlem yapın.
          </p>
        </div>

        {!stxAddress ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-blue-600 mb-4">
              🔗 Hiro Wallet Bağlantısı
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              HealthChain uygulamasını kullanmak için Hiro Wallet ile bağlanmanız gerekiyor.
            </p>
            <ConnectWalletButton />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-green-600 mb-4">
              ✅ Wallet Bağlandı!
            </h2>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Testnet Adresi:</p>
              <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                {stxAddress.substring(0, 8)}...{stxAddress.substring(stxAddress.length - 8)}
              </p>
            </div>
            <button 
              onClick={() => window.location.href = '/'}
              className="w-full bg-emerald-500 text-white px-4 py-2 rounded hover:bg-emerald-600"
            >
              Ana Sayfaya Git
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400">
            💡 İpucu: Hiro Wallet'ı testnet modunda kullanın ve test STX tokenları ile işlem yapın.
          </p>
        </div>
      </div>
    </div>
  );
} 