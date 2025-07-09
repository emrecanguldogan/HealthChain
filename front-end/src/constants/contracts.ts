import { Network } from '@/lib/network';

export const getHealthchainContractAddress = (network: Network) => {
  if (network === 'testnet') {
    return 'ST1M2X1WBC60W09W91W4ESDRHM94H75VGXGDNCQE8';
  }
  if (network === 'mainnet') {
    return 'SP30VANCWST2Y0RY3EYGJ4ZK6D22GJQRR7H5YD8J8';
  }
  // Default to testnet
  return 'ST1M2X1WBC60W09W91W4ESDRHM94H75VGXGDNCQE8';
};

export const getHealthchainContract = (network: Network) => {
  return {
    contractAddress: getHealthchainContractAddress(network),
    contractName: 'healthchain_v5',
  } as const;
};
