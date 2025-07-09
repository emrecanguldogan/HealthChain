import { deserialize, prettyPrint } from '@stacks/transactions/dist/cl';
import { Network } from './network';

export function formatValue(hex: string) {
  const value = deserialize(hex);
  const formattedString = prettyPrint(value, 2);
  return formattedString;
}

export const getHealthchainContract = (network: Network) => {
  // Sadece testnet ve mainnet desteklenir
  return {
    contractAddress: 'ST1M2X1WBC60W09W91W4ESDRHM94H75VGXGDNCQE8',
    contractName: 'healthchain_v4',
    network: network
  };
};
