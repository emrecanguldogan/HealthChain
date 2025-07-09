import { deserialize, prettyPrint } from '@stacks/transactions/dist/cl';
import { Network } from './network';

export function formatValue(hex: string) {
  const value = deserialize(hex);
  const formattedString = prettyPrint(value, 2);
  return formattedString;
}

export const getHealthchainContract = (network: Network) => {
  // Contract details - update these with your actual deployed contract
  return {
    contractAddress: 'ST1M2X1WBC60W09W91W4ESDRHM94H75VGXGDNCQE8',
    contractName: 'healthchainv3',
    network: network
  };
};
