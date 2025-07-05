import { createContext, useContext } from 'react';

export interface DevnetWallet {
  stxAddress: string;
  label: string;
  mnemonic: string;
  role: 'deployer' | 'patient' | 'doctor';
  profileData?: {
    name: string;
    age: number;
    bloodType: string;
    allergies: string;
    emergencyContact: string;
    medicalHistory: string;
    specialization?: string;
    licenseNumber?: string;
  };
}

export interface DevnetWalletContextType {
  currentWallet: DevnetWallet | null;
  wallets: DevnetWallet[];
  setCurrentWallet: (wallet: DevnetWallet) => void;
}

// Gerçek Stacks testnet cüzdanları (mnemonics gerçek)
export const devnetWallets: DevnetWallet[] = [
  {
    stxAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    label: 'Deployer',
    role: 'deployer',
    mnemonic:
      'twice kind fence tip hidden tilt action fragile skin nothing glory cousin green tomorrow spring wrist shed math olympic multiply hip blue scout claw',
    profileData: {
      name: 'Ahmet Yılmaz',
      age: 35,
      bloodType: 'A+',
      allergies: 'Penisilin, Lateks',
      emergencyContact: '+90 532 123 4567',
      medicalHistory: 'Hipertansiyon, Diyabet tip 2. 2019 yılında apandisit ameliyatı geçirdi.',
    }
  },
  {
    stxAddress: 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5',
    label: 'Hasta 1',
    role: 'patient',
    mnemonic:
      'sell invite acquire kitten bamboo drastic jelly vivid peace spawn twice guilt pave pen trash pretty park cube fragile unaware remain midnight betray rebuild',
    profileData: {
      name: 'Ayşe Kaya',
      age: 28,
      bloodType: 'O+',
      allergies: 'Arı sokması, Fındık',
      emergencyContact: '+90 533 987 6543',
      medicalHistory: 'Astım, Mevsimsel alerji. 2022 yılında doğum yaptı. Düzenli kontroller yapılıyor.',
    }
  },
  {
    stxAddress: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
    label: 'Doktor 1',
    role: 'doctor',
    mnemonic:
      'hold excess usual excess ring elephant install account glad dry fragile donkey gaze humble truck breeze nation gasp vacuum limb head keep delay hospital',
    profileData: {
      name: 'Dr. Mehmet Özkan',
      age: 42,
      bloodType: 'B+',
      allergies: 'Yok',
      emergencyContact: '+90 534 555 1234',
      medicalHistory: 'Sağlıklı. 15 yıl kardiyoloji deneyimi.',
      specialization: 'Kardiyoloji',
      licenseNumber: 'TR-12345'
    }
  },
  {
    stxAddress: 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC',
    label: 'Hasta 2',
    role: 'patient',
    mnemonic:
      'cycle puppy glare enroll cost improve round trend wrist mushroom scorpion tower claim oppose clever elephant dinosaur eight problem before frozen dune wagon high',
    profileData: {
      name: 'Fatma Demir',
      age: 65,
      bloodType: 'AB+',
      allergies: 'Sülfa ilaçları, Deniz ürünleri',
      emergencyContact: '+90 535 777 8888',
      medicalHistory: 'Artrit, Osteoporoz, Yüksek kolesterol. 2020 yılında kalp krizi geçirdi. Düzenli ilaç kullanıyor.',
    }
  },
  {
    stxAddress: 'ST2NEB84ASENDXKYGJPQW86YXQCEFEX2ZQPG87ND',
    label: 'Doktor 2',
    role: 'doctor',
    mnemonic:
      'board list obtain sugar hour worth raven scout denial thunder horse logic fury scorpion fold genuine phrase wealth news aim below celery when cabin',
    profileData: {
      name: 'Dr. Zeynep Arslan',
      age: 38,
      bloodType: 'A-',
      allergies: 'Lateks',
      emergencyContact: '+90 536 999 0000',
      medicalHistory: 'Sağlıklı. 12 yıl nöroloji deneyimi.',
      specialization: 'Nöroloji',
      licenseNumber: 'TR-67890'
    }
  },
  {
    stxAddress: 'ST2REHHS5J3CERCRBEPMGH7921Q6PYKAADT7JP2VB',
    label: 'Test Kullanıcı',
    role: 'patient',
    mnemonic:
      'hurry aunt blame peanut heavy update captain human rice crime juice adult scale device promote vast project quiz unit note reform update climb purchase',
    profileData: {
      name: 'Can Yıldız',
      age: 25,
      bloodType: 'O-',
      allergies: 'Yok',
      emergencyContact: '+90 537 111 2222',
      medicalHistory: 'Sağlıklı. Düzenli spor yapıyor. Geçmişte ciddi hastalık yok.',
    }
  },
];

export const DevnetWalletContext = createContext<DevnetWalletContextType>({
  currentWallet: null,
  wallets: devnetWallets,
  setCurrentWallet: () => {},
});

export const useDevnetWallet = () => useContext(DevnetWalletContext);
