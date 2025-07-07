import { HiroWalletContext } from '@/components/HiroWalletProvider';
import { useContext } from 'react';

export function useCurrentAddress(): string | null {
  const { network, testnetAddress, mainnetAddress } = useContext(HiroWalletContext);

  switch (network) {
    case 'testnet':
      return testnetAddress;
    case 'mainnet':
      return mainnetAddress;
    default:
      return testnetAddress; // Default to testnet
  }
}
