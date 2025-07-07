import { isTestnetEnvironment } from '@/lib/use-network';
import { Network } from '@/lib/network';

export const getHealthchainContractAddress = (network: Network) => {
  if (isTestnetEnvironment(network)) {
    return (
      process.env.NEXT_PUBLIC_DEPLOYER_ACCOUNT_ADDRESS ||
      'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
    );
  }
  if (isTestnetEnvironment(network)) {
    return 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  }
  // Mainnet address
  return 'SP30VANCWST2Y0RY3EYGJ4ZK6D22GJQRR7H5YD8J8';
};

export const getHealthchainContract = (network: Network) => {
  return {
    contractAddress: getHealthchainContractAddress(network),
    contractName: 'healthchain-v2',
  } as const;
};
