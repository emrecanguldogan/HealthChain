import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Database schema definition
interface HealthChainDB extends DBSchema {
  patients: {
    key: string; // wallet hash
    value: {
      walletHash: string;
      name: string;
      age: number;
      bloodType: string;
      allergies: string;
      emergencyContact: string;
      medicalHistory: string;
      createdAt: Date;
      updatedAt: Date;
    };
    indexes: { 'by-wallet-hash': string };
  };
  doctors: {
    key: string; // wallet hash
    value: {
      walletHash: string;
      name: string;
      specialization: string;
      licenseNumber: string;
      hospital: string;
      experience: number;
      createdAt: Date;
      updatedAt: Date;
    };
    indexes: { 'by-wallet-hash': string };
  };
  healthRecords: {
    key: string;
    value: {
      id: string;
      patientWalletHash: string;
      doctorWalletHash: string;
      recordType: string;
      description: string;
      data: string; // encrypted data
      createdAt: Date;
      updatedAt: Date;
    };
    indexes: { 
      'by-patient': string;
      'by-doctor': string;
      'by-type': string;
    };
  };
  doctorAuthorizations: {
    key: string;
    value: {
      id: string;
      patientWalletHash: string;
      doctorWalletHash: string;
      permissions: string[];
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
      expiresAt?: Date;
    };
    indexes: { 
      'by-patient': string;
      'by-doctor': string;
      'by-active': boolean;
    };
  };
}

// Database instance
let db: IDBPDatabase<HealthChainDB> | null = null;

// Initialize database
export const initDatabase = async (): Promise<IDBPDatabase<HealthChainDB>> => {
  if (db) return db;

  db = await openDB<HealthChainDB>('healthchain-db', 1, {
    upgrade(db: IDBPDatabase<HealthChainDB>) {
      // Create patients table
      if (!db.objectStoreNames.contains('patients')) {
        const patientStore = db.createObjectStore('patients', { keyPath: 'walletHash' });
        patientStore.createIndex('by-wallet-hash', 'walletHash', { unique: true });
      }

      // Create doctors table
      if (!db.objectStoreNames.contains('doctors')) {
        const doctorStore = db.createObjectStore('doctors', { keyPath: 'walletHash' });
        doctorStore.createIndex('by-wallet-hash', 'walletHash', { unique: true });
      }

      // Create health records table
      if (!db.objectStoreNames.contains('healthRecords')) {
        const recordStore = db.createObjectStore('healthRecords', { keyPath: 'id' });
        recordStore.createIndex('by-patient', 'patientWalletHash');
        recordStore.createIndex('by-doctor', 'doctorWalletHash');
        recordStore.createIndex('by-type', 'recordType');
      }

      // Create doctor authorizations table
      if (!db.objectStoreNames.contains('doctorAuthorizations')) {
        const authStore = db.createObjectStore('doctorAuthorizations', { keyPath: 'id' });
        authStore.createIndex('by-patient', 'patientWalletHash');
        authStore.createIndex('by-doctor', 'doctorWalletHash');
        authStore.createIndex('by-active', 'isActive');
      }
    },
  });

  return db;
};

// Generate SHA-256 hash of wallet address
export const generateWalletHash = async (walletAddress: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(walletAddress);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Patient operations
export const savePatientProfile = async (walletAddress: string, profileData: {
  name: string;
  age: number;
  bloodType: string;
  allergies: string;
  emergencyContact: string;
  medicalHistory: string;
}): Promise<void> => {
  const database = await initDatabase();
  const walletHash = await generateWalletHash(walletAddress);
  
  await database.put('patients', {
    walletHash,
    ...profileData,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
};

export const getPatientProfile = async (walletAddress: string) => {
  const database = await initDatabase();
  const walletHash = await generateWalletHash(walletAddress);
  
  return await database.get('patients', walletHash);
};

export const updatePatientProfile = async (walletAddress: string, profileData: Partial<{
  name: string;
  age: number;
  bloodType: string;
  allergies: string;
  emergencyContact: string;
  medicalHistory: string;
}>): Promise<void> => {
  const database = await initDatabase();
  const walletHash = await generateWalletHash(walletAddress);
  
  const existing = await database.get('patients', walletHash);
  if (!existing) {
    throw new Error('Patient profile not found');
  }
  
  await database.put('patients', {
    ...existing,
    ...profileData,
    updatedAt: new Date(),
  });
};

// Doctor operations
export const saveDoctorProfile = async (walletAddress: string, profileData: {
  name: string;
  specialization: string;
  licenseNumber: string;
  hospital: string;
  experience: number;
}): Promise<void> => {
  const database = await initDatabase();
  const walletHash = await generateWalletHash(walletAddress);
  
  await database.put('doctors', {
    walletHash,
    ...profileData,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
};

export const getDoctorProfile = async (walletAddress: string) => {
  const database = await initDatabase();
  const walletHash = await generateWalletHash(walletAddress);
  
  return await database.get('doctors', walletHash);
};

export const updateDoctorProfile = async (walletAddress: string, profileData: Partial<{
  name: string;
  specialization: string;
  licenseNumber: string;
  hospital: string;
  experience: number;
}>): Promise<void> => {
  const database = await initDatabase();
  const walletHash = await generateWalletHash(walletAddress);
  
  const existing = await database.get('doctors', walletHash);
  if (!existing) {
    throw new Error('Doctor profile not found');
  }
  
  await database.put('doctors', {
    ...existing,
    ...profileData,
    updatedAt: new Date(),
  });
};

// Health records operations
export const saveHealthRecord = async (recordData: {
  patientWalletAddress: string;
  doctorWalletAddress: string;
  recordType: string;
  description: string;
  data: string;
}): Promise<string> => {
  const database = await initDatabase();
  const patientHash = await generateWalletHash(recordData.patientWalletAddress);
  const doctorHash = await generateWalletHash(recordData.doctorWalletAddress);
  const recordId = `record_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  await database.put('healthRecords', {
    id: recordId,
    patientWalletHash: patientHash,
    doctorWalletHash: doctorHash,
    recordType: recordData.recordType,
    description: recordData.description,
    data: recordData.data,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  
  return recordId;
};

export const getPatientRecords = async (patientWalletAddress: string) => {
  const database = await initDatabase();
  const patientHash = await generateWalletHash(patientWalletAddress);
  
  return await database.getAllFromIndex('healthRecords', 'by-patient', patientHash);
};

export const getDoctorRecords = async (doctorWalletAddress: string) => {
  const database = await initDatabase();
  const doctorHash = await generateWalletHash(doctorWalletAddress);
  
  return await database.getAllFromIndex('healthRecords', 'by-doctor', doctorHash);
};

// Doctor authorization operations
export const saveDoctorAuthorization = async (authData: {
  patientWalletAddress: string;
  doctorWalletAddress: string;
  permissions: string[];
  expiresAt?: Date;
}): Promise<string> => {
  const database = await initDatabase();
  const patientHash = await generateWalletHash(authData.patientWalletAddress);
  const doctorHash = await generateWalletHash(authData.doctorWalletAddress);
  const authId = `auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  await database.put('doctorAuthorizations', {
    id: authId,
    patientWalletHash: patientHash,
    doctorWalletHash: doctorHash,
    permissions: authData.permissions,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: authData.expiresAt,
  });
  
  return authId;
};

export const getPatientAuthorizations = async (patientWalletAddress: string) => {
  const database = await initDatabase();
  const patientHash = await generateWalletHash(patientWalletAddress);
  
  return await database.getAllFromIndex('doctorAuthorizations', 'by-patient', patientHash);
};

export const getDoctorAuthorizations = async (doctorWalletAddress: string) => {
  const database = await initDatabase();
  const doctorHash = await generateWalletHash(doctorWalletAddress);
  
  return await database.getAllFromIndex('doctorAuthorizations', 'by-doctor', doctorHash);
};

export const revokeDoctorAuthorization = async (authId: string): Promise<void> => {
  const database = await initDatabase();
  
  const auth = await database.get('doctorAuthorizations', authId);
  if (!auth) {
    throw new Error('Authorization not found');
  }
  
  await database.put('doctorAuthorizations', {
    ...auth,
    isActive: false,
    updatedAt: new Date(),
  });
};

// Check if user has profile
export const hasPatientProfile = async (walletAddress: string): Promise<boolean> => {
  const database = await initDatabase();
  const walletHash = await generateWalletHash(walletAddress);
  
  const profile = await database.get('patients', walletHash);
  return !!profile;
};

export const hasDoctorProfile = async (walletAddress: string): Promise<boolean> => {
  const database = await initDatabase();
  const walletHash = await generateWalletHash(walletAddress);
  
  const profile = await database.get('doctors', walletHash);
  return !!profile;
};

// Check doctor authorization
export const isDoctorAuthorized = async (patientWalletAddress: string, doctorWalletAddress: string): Promise<boolean> => {
  const database = await initDatabase();
  const patientHash = await generateWalletHash(patientWalletAddress);
  const doctorHash = await generateWalletHash(doctorWalletAddress);
  
  const authorizations = await database.getAllFromIndex('doctorAuthorizations', 'by-patient', patientHash);
  
  return authorizations.some(auth => 
    auth.doctorWalletHash === doctorHash && 
    auth.isActive && 
    (!auth.expiresAt || auth.expiresAt > new Date())
  );
};

// Clear all data (for testing/reset)
export const clearAllData = async (): Promise<void> => {
  const database = await initDatabase();
  
  await database.clear('patients');
  await database.clear('doctors');
  await database.clear('healthRecords');
  await database.clear('doctorAuthorizations');
}; 