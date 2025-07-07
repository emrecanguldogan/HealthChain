import { openDB, DBSchema } from 'idb';
import { Network } from '@/lib/network';
import { callReadOnlyFunction, callPublicFunction } from '@/lib/contract-utils';

// Contract name for v2
const CONTRACT_NAME = 'healthchain-v2';

// Database schema
interface HealthChainDB extends DBSchema {
  patients: {
    key: string; // wallet hash
    value: {
      walletHash: string;
      name: string;
      age: number;
      bloodType: string;
      allergies: string;
      medicalHistory: string;
      emergencyContact: string;
      role: 'patient';
      createdAt: Date;
    };
  };
  doctors: {
    key: string; // wallet hash
    value: {
      walletHash: string;
      name: string;
      specialization: string;
      licenseNumber: string;
      experience: number;
      role: 'doctor';
      createdAt: Date;
    };
  };
  healthRecords: {
    key: string; // `${patientHash}_${recordId}`
    value: {
      id: string;
      patientHash: string;
      recordType: string;
      description: string;
      data: string;
      createdBy: string;
      createdAt: Date;
    };
    indexes: {
      'by-patient': string;
    };
  };
  doctorAuthorizations: {
    key: string; // `${patientHash}_${doctorHash}`
    value: {
      id: string;
      patientHash: string;
      doctorHash: string;
      authorized: boolean;
      permissions: string[];
      createdAt: Date;
    };
    indexes: {
      'by-patient': string;
      'by-doctor': string;
    };
  };
}

// Initialize database
const initDB = async () => {
  return openDB<HealthChainDB>('healthchain-db', 1, {
    upgrade(db) {
      // Patients table
      if (!db.objectStoreNames.contains('patients')) {
        db.createObjectStore('patients', { keyPath: 'walletHash' });
      }
      
      // Doctors table
      if (!db.objectStoreNames.contains('doctors')) {
        db.createObjectStore('doctors', { keyPath: 'walletHash' });
      }
      
      // Health records table
      if (!db.objectStoreNames.contains('healthRecords')) {
        const recordsStore = db.createObjectStore('healthRecords', { keyPath: 'id' });
        recordsStore.createIndex('by-patient', 'patientHash', { unique: false });
      }
      
      // Doctor authorizations table
      if (!db.objectStoreNames.contains('doctorAuthorizations')) {
        const authStore = db.createObjectStore('doctorAuthorizations', { keyPath: 'id' });
        authStore.createIndex('by-patient', 'patientHash', { unique: false });
        authStore.createIndex('by-doctor', 'doctorHash', { unique: false });
      }
    },
  });
};

// Hash wallet address using SHA-256
const hashWalletAddress = async (address: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(address);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Database operations
export const savePatientProfile = async (walletAddress: string, profileData: any) => {
  const db = await initDB();
  const walletHash = await hashWalletAddress(walletAddress);
  
  await db.put('patients', {
    walletHash,
    ...profileData,
    role: 'patient',
    createdAt: new Date()
  });
  
  return walletHash;
};

export const saveDoctorProfile = async (walletAddress: string, profileData: any) => {
  const db = await initDB();
  const walletHash = await hashWalletAddress(walletAddress);
  
  await db.put('doctors', {
    walletHash,
    ...profileData,
    role: 'doctor',
    createdAt: new Date()
  });
  
  return walletHash;
};

export const getPatientProfileByWallet = async (walletAddress: string) => {
  const db = await initDB();
  const walletHash = await hashWalletAddress(walletAddress);
  return await db.get('patients', walletHash);
};

export const getDoctorProfileByWallet = async (walletAddress: string) => {
  const db = await initDB();
  const walletHash = await hashWalletAddress(walletAddress);
  return await db.get('doctors', walletHash);
};

export const checkUserHasPatientProfile = async (walletAddress: string) => {
  const db = await initDB();
  const walletHash = await hashWalletAddress(walletAddress);
  const profile = await db.get('patients', walletHash);
  return !!profile;
};

export const checkUserHasDoctorProfile = async (walletAddress: string) => {
  const db = await initDB();
  const walletHash = await hashWalletAddress(walletAddress);
  const profile = await db.get('doctors', walletHash);
  return !!profile;
};

export const saveHealthRecord = async (patientAddress: string, recordData: any) => {
  const db = await initDB();
  const patientHash = await hashWalletAddress(patientAddress);
  const recordId = `${patientHash}_${Date.now()}`;
  
  await db.put('healthRecords', {
    id: recordId,
    patientHash,
    ...recordData,
    createdAt: new Date()
  });
  
  return recordId;
};

export const getPatientRecordsFromDatabase = async (patientAddress: string) => {
  const db = await initDB();
  const patientHash = await hashWalletAddress(patientAddress);
  return await db.getAllFromIndex('healthRecords', 'by-patient', patientHash);
};

export const saveDoctorAuthorization = async (patientAddress: string, doctorAddress: string, permissions: string[]) => {
  const db = await initDB();
  const patientHash = await hashWalletAddress(patientAddress);
  const doctorHash = await hashWalletAddress(doctorAddress);
  const authId = `${patientHash}_${doctorHash}`;
  
  await db.put('doctorAuthorizations', {
    id: authId,
    patientHash,
    doctorHash,
    authorized: true,
    permissions,
    createdAt: new Date()
  });
};

export const checkDoctorAuthorizationInDatabase = async (patientAddress: string, doctorAddress: string) => {
  const db = await initDB();
  const patientHash = await hashWalletAddress(patientAddress);
  const doctorHash = await hashWalletAddress(doctorAddress);
  const authId = `${patientHash}_${doctorHash}`;
  
  const auth = await db.get('doctorAuthorizations', authId);
  return auth?.authorized || false;
};

// Real blockchain operations - No simulation

export const mintAccessToken = async (network: Network, userAddress: string) => {
  try {
    console.log('🔗 Minting real NFT token on blockchain...');
    console.log('📍 Network:', network);
    console.log('📍 User Address:', userAddress);
    
    // Check if user already has a token first
    const hasToken = await checkHasAccessToken(network, userAddress);
    if (hasToken) {
      console.log('⚠️ User already has an access token');
      throw new Error('User already has an access token');
    }
    
    console.log('🚀 Sending mint transaction...');
    const result = await callPublicFunction(
      network,
      'mint-access-token',
      [userAddress, userAddress, 1000], // patient, doctor, expires-at
      userAddress
    );
    
    console.log('📤 Transaction sent successfully:', result);
    console.log('⏳ Transaction is now in mempool, waiting for confirmation...');
    
    // Return transaction result immediately - don't wait for confirmation
    // The frontend should poll for token status separately
    return {
      success: true,
      transactionId: result.txid,
      message: 'Transaction sent to mempool successfully'
    };
  } catch (error) {
    console.error('❌ NFT token minting failed:', error);
    throw error;
  }
};

export const checkHasAccessToken = async (network: Network, userAddress: string) => {
  try {
    console.log('🔍 Checking NFT token ownership on blockchain...');
    
    const result = await callReadOnlyFunction(
      network,
      'has-access-token',
      [userAddress, userAddress], // patient, doctor
      userAddress
    );
    
    console.log('📊 NFT ownership check result:', result);
    return result;
  } catch (error) {
    console.error('❌ NFT ownership check failed:', error);
    return false;
  }
};

export const getTokenId = async (network: Network, userAddress: string) => {
  try {
    console.log('🔍 Getting NFT token ID from blockchain...');
    
    const result = await callReadOnlyFunction(
      network,
      'get-access-token-id',
      [userAddress, userAddress], // patient, doctor
      userAddress
    );
    
    console.log('📊 Token ID result:', result);
    return result;
  } catch (error) {
    console.error('❌ Token ID retrieval failed:', error);
    return null;
  }
};

export const authorizeDoctor = async (network: Network, doctorAddress: string, permissions: string[], userAddress: string) => {
  try {
    console.log('🔗 Authorizing doctor on blockchain...');
    
    const result = await callPublicFunction(
      network,
      'mint-access-token',
      [userAddress, doctorAddress, 1000], // patient, doctor, expires-at
      userAddress
    );
    
    console.log('✅ Doctor authorization successful:', result);
    return result;
  } catch (error) {
    console.error('❌ Doctor authorization failed:', error);
    throw error;
  }
};

export const revokeDoctor = async (network: Network, doctorAddress: string, userAddress: string) => {
  try {
    console.log('🔗 Revoking doctor authorization on blockchain...');
    
    // First get the token ID
    const tokenId = await getAccessTokenId(network, userAddress);
    if (!tokenId) {
      throw new Error('No access token found to burn');
    }
    
    const result = await callPublicFunction(
      network,
      'burn-access-token',
      [tokenId],
      userAddress
    );
    
    console.log('✅ Doctor revocation successful:', result);
    return result;
  } catch (error) {
    console.error('❌ Doctor revocation failed:', error);
    throw error;
  }
};

export const checkUserAccess = async (patientAddress: string, doctorAddress: string, network: Network) => {
  try {
    console.log('🔍 Checking access permissions on blockchain...');
    
    const result = await callReadOnlyFunction(
      network,
      'check-access',
      [patientAddress, doctorAddress],
      doctorAddress
    );
    
    console.log('📊 Access check result:', result);
    return result;
  } catch (error) {
    console.error('❌ Access check failed:', error);
    return false;
  }
};

export const getUserAccessTokens = async (network: Network, userAddress: string) => {
  try {
    console.log('🔍 Getting user access tokens from blockchain...');
    
    const hasToken = await checkHasAccessToken(network, userAddress);
    const tokenId = hasToken ? await getTokenId(network, userAddress) : null;
    
    // Return array format that frontend expects
    if (hasToken && tokenId !== null) {
      // Convert tokenId to number if it's a ClarityValue
      const numericTokenId = typeof tokenId === 'object' && tokenId !== null ? 
        (tokenId as any).value || 0 : 
        Number(tokenId) || 0;
      
      return [{
        tokenId: numericTokenId,
        owner: userAddress,
        isActive: true,
        createdAt: new Date().toISOString(),
        network: network
      }];
    }
    
    return [];
  } catch (error) {
    console.error('❌ Getting access tokens failed:', error);
    return [];
  }
};

export const deleteAccessToken = async (network: Network, userAddress: string) => {
  try {
    console.log('🔗 Burning NFT token on blockchain...');
    
    // First get the token ID
    const tokenId = await getAccessTokenId(network, userAddress);
    if (!tokenId) {
      throw new Error('No access token found to burn');
    }
    
    const result = await callPublicFunction(
      network,
      'burn-access-token',
      [tokenId],
      userAddress
    );
    
    console.log('✅ NFT token burned successfully:', result);
    return result;
  } catch (error) {
    console.error('❌ NFT token burning failed:', error);
    throw error;
  }
};

export const addHealthRecord = async (network: Network, patientAddress: string, recordType: string, description: string, data: string, doctorAddress: string) => {
  try {
    console.log('🔗 Adding health record on blockchain...');
    
    const recordData = `${recordType}: ${description} - ${data}`;
    
    const result = await callPublicFunction(
      network,
      'add-health-record',
      [recordData],
      patientAddress
    );
    
    console.log('✅ Health record added successfully:', result);
    return result;
  } catch (error) {
    console.error('❌ Health record addition failed:', error);
    throw error;
  }
};

export const getPatientRecords = async (network: Network, patientAddress: string) => {
  try {
    console.log('🔍 Getting patient records from blockchain...');
    
    const result = await callReadOnlyFunction(
      network,
      'get-patient-records',
      [patientAddress],
      patientAddress
    );
    
    console.log('📊 Patient records result:', result);
    return result;
  } catch (error) {
    console.error('❌ Getting patient records failed:', error);
    return [];
  }
};

// Add missing database functions that are being imported
export const createPatientProfile = async (walletAddress: string, profileData: any) => {
  return await savePatientProfile(walletAddress, profileData);
};

export const createDoctorProfile = async (walletAddress: string, profileData: any) => {
  return await saveDoctorProfile(walletAddress, profileData);
};

export const getProfileByWalletAddress = async (walletAddress: string) => {
  // Try patient profile first, then doctor profile
  const patientProfile = await getPatientProfileByWallet(walletAddress);
  if (patientProfile) return patientProfile;
  const doctorProfile = await getDoctorProfileByWallet(walletAddress);
  return doctorProfile;
};

export const saveHealthRecordToDatabase = async (patientAddress: string, recordData: any) => {
  return await saveHealthRecord(patientAddress, recordData);
};

export const saveDoctorAuthorizationToDatabase = async (patientAddress: string, doctorAddress: string, permissions: string[]) => {
  return await saveDoctorAuthorization(patientAddress, doctorAddress, permissions);
};

export const getAccessTokenId = async (network: Network, userAddress: string) => {
  // This should call the correct read-only function
  try {
    const result = await callReadOnlyFunction(
      network,
      'get-access-token-id',
      [userAddress, userAddress],
      userAddress
    );
    return result;
  } catch (error) {
    return null;
  }
}; 