import { isTestnetEnvironment } from '@/lib/use-network';
import { Network } from '@/lib/network';

export const getHealthchainContractAddress = (network: Network) => {
  if (isTestnetEnvironment(network)) {
    return (
      process.env.NEXT_PUBLIC_DEPLOYER_ACCOUNT_ADDRESS ||
      'ST1M2X1WBC60W09W91W4ESDRHM94H75VGXGDNCQE8'
    );
  }
  // Mainnet address
  return 'SP30VANCWST2Y0RY3EYGJ4ZK6D22GJQRR7H5YD8J8';
};

export const getHealthchainContract = (network: Network) => {
  return {
    contractAddress: getHealthchainContractAddress(network),
    contractName: 'healthchain_v4',
  } as const;
};
