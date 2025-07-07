import { Network } from '@/lib/network';
import { isTestnetEnvironment } from '@/lib/use-network';

export const getExplorerLink = (txId: string, network: Network | null): string => {
  const baseUrl = 'https://explorer.hiro.so/txid';
  const cleanTxId = txId.replace('0x', '');

  if (isTestnetEnvironment(network)) {
    return `${baseUrl}/${cleanTxId}?chain=testnet`;
  }

  return `${baseUrl}/${cleanTxId}?chain=${network}`;
};
