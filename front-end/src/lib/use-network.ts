'use client';
import { useState, useEffect, useContext } from 'react';
import { HiroWalletContext } from '@/components/HiroWalletProvider';
import { Network } from '@/lib/network';

export const useNetwork = (): Network => {
  const [network, setNetwork] = useState<Network>('testnet');
  const { network: contextNetwork } = useContext(HiroWalletContext);

  useEffect(() => {
    if (contextNetwork) {
      setNetwork(contextNetwork);
    }
  }, [contextNetwork]);

  return network;
};

export const isTestnetEnvironment = (network?: Network | null) => {
  return network === 'testnet' || process.env.NEXT_PUBLIC_STACKS_NETWORK === 'testnet';
};

export const isMainnetEnvironment = (network: Network | null) => {
  return network === 'mainnet';
};
