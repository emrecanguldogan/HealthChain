'use client';

import { ReactNode, useState } from 'react';
import { DevnetWalletContext, DevnetWallet, devnetWallets } from '@/lib/devnet-wallet-context';

interface DevnetWalletProviderProps {
  children: ReactNode;
}

export function DevnetWalletProvider({ children }: DevnetWalletProviderProps) {
  const [currentWallet, setCurrentWallet] = useState<DevnetWallet | null>(() => {
    // Sayfa yüklendiğinde localStorage'dan wallet seçimini al
    if (typeof window !== 'undefined') {
      const savedWalletAddress = localStorage.getItem('selected_wallet_address');
      if (savedWalletAddress) {
        return devnetWallets.find(wallet => wallet.stxAddress === savedWalletAddress) || null;
      }
    }
    return null;
  });

  const handleSetCurrentWallet = (wallet: DevnetWallet) => {
    setCurrentWallet(wallet);
    // Wallet seçimini localStorage'a kaydet
    localStorage.setItem('selected_wallet_address', wallet.stxAddress);
  };

  return (
    <DevnetWalletContext.Provider
      value={{
        currentWallet,
        wallets: devnetWallets,
        setCurrentWallet: handleSetCurrentWallet,
      }}
    >
      {children}
    </DevnetWalletContext.Provider>
  );
}
