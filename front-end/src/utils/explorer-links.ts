import { Network } from '@/lib/network';

export const getExplorerLink = (txId: string, network: Network | null): string => {
  const baseUrl = 'https://explorer.hiro.so/txid';
  const cleanTxId = txId.replace('0x', '');

  return `${baseUrl}/${cleanTxId}?chain=${network}`;
};
