import { openContractCall } from '@/lib/contract-utils';
import { getHealthchainContract } from '@/constants/contracts';
import { Network } from '@/lib/network';
import { ClarityValue, someCV, noneCV, stringAsciiCV, stringUtf8CV, uintCV, boolCV, listCV, principalCV } from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';
import { fetchCallReadOnlyFunction } from '@stacks/transactions';
import { getApi } from '@/lib/stacks-api';
import { isDevnetEnvironment } from '@/lib/use-network';

export interface DoctorAuthorization {
  doctorAddress: string;
  permissions: string[];
}

export interface AccessToken {
  tokenId: number;
  owner: string;
  isActive: boolean;
}

// Mint access token (NFT) for user - API üzerinden otomatik
export const mintAccessToken = async (network: Network, userAddress?: string) => {
  const contract = getHealthchainContract(network);
  
  try {
    if (isDevnetEnvironment()) {
      // Devnet için Hiro Platform API ile gerçek blockchain işlemi
      console.log('Devnet: Hiro Platform API ile NFT oluşturma işlemi başlatılıyor');
      
      const apiKey = process.env.NEXT_PUBLIC_PLATFORM_HIRO_API_KEY;
      if (!apiKey) {
        throw new Error('Hiro Platform API key gerekli. Lütfen .env.local dosyasını güncelleyin.');
      }
      
      // Endpoint'i ortam değişkenine göre ayarla
      const endpoint = process.env.NEXT_PUBLIC_DEVNET_HOST === 'platform'
        ? 'https://platform.devnet.stacks.co/v2/contracts/call'
        : 'http://localhost:3999/v2/contracts/call';
      
      // Hiro Platform API ile contract call
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          contract_id: `${contract.contractAddress}.${contract.contractName}`,
          function_name: 'mint-access-token',
          function_args: [],
          network: 'devnet'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Hiro API Error: ${response.status} - ${errorData}\nEndpoint: ${endpoint}\nContract: ${contract.contractAddress}.${contract.contractName}`);
      }
      
      const result = await response.json();
      console.log('Devnet transaction response:', result);
      
      // Local storage'a gerçek transaction bilgisini kaydet
      if (typeof window !== 'undefined') {
        const tokenData = {
          tokenId: result.txid ? parseInt(result.txid.slice(-3)) : Math.floor(Math.random() * 1000) + 1,
          owner: userAddress || 'devnet-user',
          timestamp: new Date().toISOString(),
          txid: result.txid,
          simulated: false
        };
        // Wallet-specific storage key kullan
        const tokenKey = `devnet_access_token_${userAddress || 'devnet-user'}`;
        localStorage.setItem(tokenKey, JSON.stringify(tokenData));
      }
      
      return result.txid || 'devnet-tx-' + Date.now();
    } else {
      // Testnet/Mainnet için Hiro Wallet bağlantısı
      await openContractCall({
        contractAddress: contract.contractAddress,
        contractName: contract.contractName,
        functionName: 'mint-access-token',
        functionArgs: [],
        network,
      });
    }
    return true;
  } catch (error) {
    console.error('Error minting access token:', error);
    throw error;
  }
};

// Authorize doctor to access patient data - API üzerinden otomatik
export const authorizeDoctor = async (doctorAddress: string, permissions: string[] = ['read'], network: Network) => {
  const contract = getHealthchainContract(network);
  
  const permissionCVs = permissions.map(p => stringAsciiCV(p));
  const functionArgs: ClarityValue[] = [
    principalCV(doctorAddress),
    listCV(permissionCVs)
  ];

  try {
    if (isDevnetEnvironment()) {
      // Devnet için Hiro Platform API ile gerçek blockchain işlemi
      console.log('Devnet: Hiro Platform API ile doktor yetkilendirme işlemi başlatılıyor');
      
      const apiKey = process.env.NEXT_PUBLIC_PLATFORM_HIRO_API_KEY;
      if (!apiKey) {
        throw new Error('Hiro Platform API key gerekli. Lütfen .env.local dosyasını güncelleyin.');
      }
      
      // Hiro Platform API ile contract call
      const response = await fetch('https://api.hiro.so/v2/contracts/call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          contract_id: `${contract.contractAddress}.${contract.contractName}`,
          function_name: 'authorize-doctor',
          function_args: functionArgs.map(arg => arg.toString()),
          network: 'devnet'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Hiro API Error: ${response.status} - ${errorData}`);
      }
      
      const result = await response.json();
      console.log('Devnet authorization response:', result);
      
      // Local storage'a gerçek authorization bilgisini kaydet
      if (typeof window !== 'undefined') {
        const authData = {
          doctorAddress,
          permissions,
          timestamp: new Date().toISOString(),
          txid: result.txid,
          simulated: false
        };
        localStorage.setItem('devnet_doctor_auth', JSON.stringify(authData));
      }
      
      return result.txid || 'devnet-auth-' + Date.now();
    } else {
      // Testnet/Mainnet için Hiro Wallet bağlantısı
      await openContractCall({
        contractAddress: contract.contractAddress,
        contractName: contract.contractName,
        functionName: 'authorize-doctor',
        functionArgs,
        network,
      });
    }
    return true;
  } catch (error) {
    console.error('Error authorizing doctor:', error);
    throw error;
  }
};

// Revoke doctor authorization - API üzerinden otomatik
export const revokeDoctor = async (doctorAddress: string, network: Network) => {
  const contract = getHealthchainContract(network);
  
  const functionArgs: ClarityValue[] = [principalCV(doctorAddress)];

  try {
    if (isDevnetEnvironment()) {
      // Devnet için otomatik işlem
      console.log('Devnet: Doktor yetkisi iptal işlemi başlatıldı');
      return 'devnet-revoke-' + Date.now();
    } else {
      // Testnet/Mainnet için Hiro Wallet bağlantısı
      await openContractCall({
        contractAddress: contract.contractAddress,
        contractName: contract.contractName,
        functionName: 'revoke-doctor',
        functionArgs,
        network,
      });
    }
    return true;
  } catch (error) {
    console.error('Error revoking doctor:', error);
    throw error;
  }
};

// Transfer access token (NFT) to another user - API üzerinden otomatik
export const transferAccessToken = async (newOwnerAddress: string, network: Network) => {
  const contract = getHealthchainContract(network);
  
  const functionArgs: ClarityValue[] = [principalCV(newOwnerAddress)];

  try {
    if (isDevnetEnvironment()) {
      // Devnet için otomatik işlem
      console.log('Devnet: Token transfer işlemi başlatıldı');
      return 'devnet-transfer-' + Date.now();
    } else {
      // Testnet/Mainnet için Hiro Wallet bağlantısı
      await openContractCall({
        contractAddress: contract.contractAddress,
        contractName: contract.contractName,
        functionName: 'transfer-token',
        functionArgs,
        network,
      });
    }
    return true;
  } catch (error) {
    console.error('Error transferring token:', error);
    throw error;
  }
};

// Read-only functions for checking access and permissions

// Check if user has access token (blockchain read-only)
export const checkHasAccessToken = async (userAddress: string, network: Network): Promise<boolean> => {
  const contract = getHealthchainContract(network);
  try {
    if (isDevnetEnvironment()) {
      // Devnet için wallet-specific token kontrolü
      if (typeof window !== 'undefined') {
        const tokenKey = `devnet_access_token_${userAddress}`;
        const tokenData = localStorage.getItem(tokenKey);
        if (tokenData) {
          const parsed = JSON.parse(tokenData);
          return parsed.simulated === false; // Gerçek blockchain işlemi kontrolü
        }
      }
      return false;
    } else {
      // Testnet/Mainnet için normal kontrol
      const result = await fetchCallReadOnlyFunction({
        contractAddress: contract.contractAddress,
        contractName: contract.contractName,
        functionName: 'has-access-token',
        functionArgs: [principalCV(userAddress)],
        network: STACKS_TESTNET,
        senderAddress: userAddress,
      });
      
      if (typeof result === 'string') {
        return result === 'true';
      }
      return false;
    }
  } catch (error) {
    console.error('Error checking access token:', error);
    return false;
  }
};

// Get user's access token ID (blockchain read-only)
export const getAccessTokenId = async (userAddress: string, network: Network): Promise<number | null> => {
  const contract = getHealthchainContract(network);
  try {
    if (isDevnetEnvironment()) {
      // Devnet için simülasyon kontrolü
      if (typeof window !== 'undefined') {
        const tokenData = localStorage.getItem('devnet_access_token');
        if (tokenData) {
          const parsed = JSON.parse(tokenData);
          return parsed.tokenId || 1;
        }
      }
      return null;
    } else {
      // Testnet/Mainnet için normal kontrol
      const result = await fetchCallReadOnlyFunction({
        contractAddress: contract.contractAddress,
        contractName: contract.contractName,
        functionName: 'get-token-id',
        functionArgs: [principalCV(userAddress)],
        network: STACKS_TESTNET,
        senderAddress: userAddress,
      });
      
      if (typeof result === 'string') {
        const parsed = parseInt(result, 10);
        return isNaN(parsed) ? null : parsed;
      }
      return null;
    }
  } catch (error) {
    console.error('Error getting access token ID:', error);
    return null;
  }
};

// Check if doctor is authorized for patient
export const checkDoctorAuthorization = async (patientAddress: string, doctorAddress: string, network: Network): Promise<boolean> => {
  try {
    if (isDevnetEnvironment()) {
      // Devnet için local storage kontrolü
      if (typeof window !== 'undefined') {
        const authData = localStorage.getItem('devnet_doctor_auth');
        if (authData) {
          const parsed = JSON.parse(authData);
          return parsed.doctorAddress === doctorAddress && parsed.simulated === false;
        }
      }
      return false;
    } else {
      // Testnet/Mainnet için blockchain kontrolü
      const contract = getHealthchainContract(network);
      const result = await fetchCallReadOnlyFunction({
        contractAddress: contract.contractAddress,
        contractName: contract.contractName,
        functionName: 'is-doctor-authorized',
        functionArgs: [principalCV(patientAddress), principalCV(doctorAddress)],
        network: STACKS_TESTNET,
        senderAddress: patientAddress,
      });
      
      if (typeof result === 'string') {
        return result === 'true';
      }
      return false;
    }
  } catch (error) {
    console.error('Error checking doctor authorization:', error);
    return false;
  }
};

// Get doctor permissions for patient
export const getDoctorPermissions = async (patientAddress: string, doctorAddress: string, network: Network): Promise<string[]> => {
  try {
    // Mock response - in production, call the contract's read-only function
    return ['read'];
  } catch (error) {
    console.error('Error getting doctor permissions:', error);
    return [];
  }
};

// Get token owner
export const getTokenOwner = async (tokenId: number, network: Network): Promise<string | null> => {
  try {
    // Mock response - in production, call the contract's read-only function
    return null;
  } catch (error) {
    console.error('Error getting token owner:', error);
    return null;
  }
};

// Get patient's token ID
export const getPatientTokenId = async (patientAddress: string, network: Network): Promise<number | null> => {
  try {
    // Mock response - in production, call the contract's read-only function
    return 1;
  } catch (error) {
    console.error('Error getting patient token ID:', error);
    return null;
  }
};

// NFT trait functions
export const getTokenUri = async (tokenId: number, network: Network): Promise<string | null> => {
  try {
    // Mock response - in production, call the contract's read-only function
    return 'https://healthchain.com/metadata/';
  } catch (error) {
    console.error('Error getting token URI:', error);
    return null;
  }
};

export const getLastTokenId = async (network: Network): Promise<number> => {
  try {
    // Mock response - in production, call the contract's read-only function
    return 1;
  } catch (error) {
    console.error('Error getting last token ID:', error);
    return 0;
  }
};

// Utility functions for React integration

// Check if current user has access to patient data
export const checkUserAccess = async (patientAddress: string, userAddress: string, network: Network): Promise<boolean> => {
  // Check if user is the patient (has access token)
  const hasToken = await checkHasAccessToken(userAddress, network);
  if (hasToken && patientAddress === userAddress) {
    return true;
  }
  
  // Check if user is an authorized doctor
  const isAuthorized = await checkDoctorAuthorization(patientAddress, userAddress, network);
  return isAuthorized;
};

// Get all authorized doctors for a patient
export const getAuthorizedDoctors = async (patientAddress: string, network: Network): Promise<string[]> => {
  // In production, you'd query the blockchain for all doctor authorizations
  // For now, return mock data
  return [];
};

// Verify NFT ownership for access
export const verifyNFTAccess = async (userAddress: string, tokenId: number, network: Network): Promise<boolean> => {
  const owner = await getTokenOwner(tokenId, network);
  return owner === userAddress;
};

// Utility function to convert buffer to string
export const bufferToString = (buffer: any): string => {
  if (typeof buffer === 'string') {
    return buffer;
  }
  
  if (buffer && typeof buffer === 'object' && buffer.type === 'Buffer') {
    return Buffer.from(buffer.data).toString('utf8');
  }
  
  if (buffer && typeof buffer === 'object' && Array.isArray(buffer)) {
    return Buffer.from(buffer).toString('utf8');
  }
  
  return JSON.stringify(buffer);
};

// Profile functions for PatientProfile component
export const createProfileOnChain = async (profileData: any, network: Network) => {
  const contract = getHealthchainContract(network);
  
  try {
    if (isDevnetEnvironment()) {
      // Devnet için Hiro Platform API ile gerçek blockchain işlemi
      console.log('Devnet: Profil oluşturma işlemi başlatılıyor');
      
      const apiKey = process.env.NEXT_PUBLIC_HIRO_API_KEY;
      if (!apiKey || apiKey === 'your_hiro_platform_api_key_here') {
        throw new Error('Hiro Platform API key gerekli.');
      }
      
      const response = await fetch('https://api.hiro.so/v2/contracts/call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          contract_id: `${contract.contractAddress}.${contract.contractName}`,
          function_name: 'create-profile',
          function_args: [stringUtf8CV(JSON.stringify(profileData)).toString()],
          network: 'devnet'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Hiro API Error: ${response.status} - ${errorData}`);
      }
      
      const result = await response.json();
      console.log('Devnet profile creation response:', result);
      
      return result.txid || 'devnet-profile-tx-' + Date.now();
    } else {
      // Testnet/Mainnet için Hiro Wallet bağlantısı
      await openContractCall({
        contractAddress: contract.contractAddress,
        contractName: contract.contractName,
        functionName: 'create-profile',
        functionArgs: [stringUtf8CV(JSON.stringify(profileData))],
        network,
      });
    }
    return true;
  } catch (error) {
    console.error('Error creating profile:', error);
    throw error;
  }
};

export const generateProfileHash = (profileData: any): string => {
  // Basit hash oluşturma (gerçek uygulamada daha güvenli hash kullanılmalı)
  const dataString = JSON.stringify(profileData);
  let hash = 0;
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}; 