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
    contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    contractName: 'healthchain-v2',
    network: network
  };
};
