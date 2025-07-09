import { openContractCall } from '@/lib/contract-utils';
import { getHealthchainContract } from '@/constants/contracts';
import { Network } from '@/lib/network';
import { ClarityValue, stringAsciiCV, stringUtf8CV, uintCV, principalCV } from '@stacks/transactions';
import { fetchCallReadOnlyFunction } from '@stacks/transactions';
import { getApi } from '@/lib/stacks-api';

export interface AccessToken {
  tokenId: number;
  owner: string;
  uri: string;
}

export interface AccessControl {
  patient: string;
  doctor: string;
  tokenId: number;
  uri: string;
}

// Assign role to user (patient, doctor, or dev)
export const assignRole = async (role: string, network: Network) => {
  const contract = getHealthchainContract(network);
  
  try {
    await openContractCall({
      contractAddress: contract.contractAddress,
      contractName: contract.contractName,
      functionName: 'assign-role',
      functionArgs: [stringAsciiCV(role)],
      network,
    });
    return true;
  } catch (error) {
    console.error('Error assigning role:', error);
    throw error;
  }
};

// Mint access token (NFT) for patient
export const mintAccessToken = async (uri: string, network: Network) => {
  const contract = getHealthchainContract(network);
  
  try {
    await openContractCall({
      contractAddress: contract.contractAddress,
      contractName: contract.contractName,
      functionName: 'mint-access-token',
      functionArgs: [stringUtf8CV(uri)],
      network,
    });
    return true;
  } catch (error) {
    console.error('Error minting access token:', error);
    throw error;
  }
};

// Grant access to doctor
export const grantAccess = async (doctorAddress: string, tokenId: number, network: Network) => {
  const contract = getHealthchainContract(network);
  
  try {
    await openContractCall({
      contractAddress: contract.contractAddress,
      contractName: contract.contractName,
      functionName: 'grant-access',
      functionArgs: [principalCV(doctorAddress), uintCV(tokenId)],
      network,
    });
    return true;
  } catch (error) {
    console.error('Error granting access:', error);
    throw error;
  }
};

// Revoke access from doctor
export const revokeAccess = async (doctorAddress: string, network: Network) => {
  const contract = getHealthchainContract(network);
  
  try {
    await openContractCall({
      contractAddress: contract.contractAddress,
      contractName: contract.contractName,
      functionName: 'revoke-access',
      functionArgs: [principalCV(doctorAddress)],
      network,
    });
    return true;
  } catch (error) {
    console.error('Error revoking access:', error);
    throw error;
  }
};

// Check if user has access (read-only)
export const checkHasAccess = async (patientAddress: string, doctorAddress: string, network: Network): Promise<string | null> => {
  const contract = getHealthchainContract(network);
  
  try {
    const result = await fetchCallReadOnlyFunction({
      network: network === 'testnet' ? 'testnet' : 'mainnet',
      contractAddress: contract.contractAddress,
      contractName: contract.contractName,
      functionName: 'has-access',
      functionArgs: [principalCV(patientAddress), principalCV(doctorAddress)],
      senderAddress: patientAddress,
    });
    
    if (result && typeof result === 'object' && 'value' in result) {
      return result.value as string;
    }
    return null;
  } catch (error) {
    console.error('Error checking access:', error);
    return null;
  }
};

// Get user role (read-only)
export const getUserRole = async (userAddress: string, network: Network): Promise<string | null> => {
  const contract = getHealthchainContract(network);
  
  try {
    const result = await fetchCallReadOnlyFunction({
      network: network === 'testnet' ? 'testnet' : 'mainnet',
      contractAddress: contract.contractAddress,
      contractName: contract.contractName,
      functionName: 'dev-view-role',
      functionArgs: [principalCV(userAddress)],
      senderAddress: userAddress,
    });
    
    if (result && typeof result === 'string') {
      return result;
    }
    return null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

// Get access token for user
export const getAccessToken = async (userAddress: string, network: Network): Promise<AccessToken | null> => {
  const contract = getHealthchainContract(network);
  
  try {
    // This would need to be implemented based on the contract's data structure
    // For now, we'll return null as the contract doesn't have a direct getter for user tokens
    return null;
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};

// Check if user has minted an access token
export const hasAccessToken = async (userAddress: string, network: Network): Promise<boolean> => {
  try {
    const token = await getAccessToken(userAddress, network);
    return token !== null;
  } catch (error) {
    console.error('Error checking access token:', error);
    return false;
  }
};

// Get authorized doctors for a patient (read-only)
export const getAuthorizedDoctors = async (patientAddress: string, network: Network): Promise<string[]> => {
  // This would need to be implemented by querying the access-control map
  // For now, return empty array as the contract doesn't have a direct getter
  return [];
};

// Get patients for a doctor (read-only)
export const getDoctorPatients = async (doctorAddress: string, network: Network): Promise<string[]> => {
  // This would need to be implemented by querying the access-control map
  // For now, return empty array as the contract doesn't have a direct getter
  return [];
};

// Verify NFT ownership
export const verifyNFTOwnership = async (userAddress: string, tokenId: number, network: Network): Promise<boolean> => {
  const contract = getHealthchainContract(network);
  
  try {
    // This would need to be implemented using the NFT trait functions
    // For now, return false as we need to implement NFT ownership checking
    return false;
  } catch (error) {
    console.error('Error verifying NFT ownership:', error);
    return false;
  }
};

// Helper function to convert Clarity values
export const bufferToString = (buffer: any): string => {
  if (typeof buffer === 'string') return buffer;
  if (buffer && typeof buffer === 'object' && 'value' in buffer) {
    return buffer.value;
  }
  return '';
};

// Helper function to convert string to Clarity value
export const stringToClarityValue = (value: string): ClarityValue => {
  return stringUtf8CV(value);
}; 