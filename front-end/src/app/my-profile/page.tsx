"use client";

import React, { useState, useEffect, useContext } from "react";
import { HiroWalletContext } from "@/components/HiroWalletProvider";
import { useNetwork } from "@/lib/use-network";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Divider,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Center,
} from "@chakra-ui/react";

interface PatientData {
  name: string;
  age: string | number;
  bloodType: string;
  allergies: string;
  emergencyContact: string;
  medicalHistory: string;
  walletAddress: string;
  timestamp?: string;
  specialization?: string;
  licenseNumber?: string;
}

export default function MyProfile() {
  const { testnetAddress, mainnetAddress, isWalletConnected, authenticate } = useContext(HiroWalletContext);
  const currentNetwork = useNetwork();
  const [profileData, setProfileData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const currentAddress = currentNetwork === 'testnet' ? testnetAddress : mainnetAddress;

  useEffect(() => {
    if (isWalletConnected && currentAddress) {
      loadProfile();
    } else {
      setLoading(false);
      setError("Cüzdan bağlanmalı");
    }
  }, [isWalletConnected, currentAddress, currentNetwork]);

  const loadProfile = () => {
    if (!currentAddress) return;

    try {
      // Check user role from localStorage
      const savedRole = localStorage.getItem(`user_role_${currentAddress}`);
      if (savedRole) {
        setUserRole(savedRole);
      }

      // Check for patient profile
      const patientProfile = localStorage.getItem(`patient_profile_${currentAddress}`);
      if (patientProfile) {
        const parsedProfile = JSON.parse(patientProfile);
        setProfileData(parsedProfile);
        setLoading(false);
        return;
      }

      // Check for doctor profile
      const doctorProfile = localStorage.getItem(`doctor_profile_${currentAddress}`);
      if (doctorProfile) {
        const parsedProfile = JSON.parse(doctorProfile);
        setProfileData(parsedProfile);
        setLoading(false);
        return;
      }

      setError("Henüz profil oluşturulmamış");
    } catch (error) {
      setError("Profil yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  if (!isWalletConnected) {
    return (
      <VStack spacing={6} align="stretch" maxW="800px" mx="auto" p={6}>
        <Alert status="warning">
          <AlertIcon />
          <Box>
            <AlertTitle>Wallet Bağlantısı Gerekli!</AlertTitle>
            <AlertDescription>
              Profil görüntülemek için Hiro Wallet ile bağlanmanız gerekiyor.
              <Button 
                colorScheme="orange" 
                size="sm" 
                ml={4}
                onClick={authenticate}
              >
                Bağlan
              </Button>
            </AlertDescription>
          </Box>
        </Alert>
      </VStack>
    );
  }

  if (loading) {
    return (
      <Center minH="50vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="emerald.500" />
          <Text>Profil yükleniyor...</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <VStack spacing={6} align="stretch" maxW="800px" mx="auto" p={6}>
        <Alert status="warning">
          <AlertIcon />
          {error}
        </Alert>
        <Button 
          colorScheme="emerald" 
          onClick={() => window.location.href = '/profile'}
        >
          Profil Oluştur
        </Button>
      </VStack>
    );
  }

  if (!profileData) {
    return (
      <VStack spacing={6} align="stretch" maxW="800px" mx="auto" p={6}>
        <Alert status="info">
          <AlertIcon />
          Henüz profil oluşturulmamış
        </Alert>
        <Button 
          colorScheme="emerald" 
          onClick={() => window.location.href = '/profile'}
        >
          Profil Oluştur
        </Button>
      </VStack>
    );
  }

  const isDoctor = userRole === 'doctor';

  return (
    <VStack spacing={6} align="stretch" maxW="800px" mx="auto" p={6}>
      <Heading size="lg" color="emerald.600" textAlign="center">
        🏥 Benim Profilim
      </Heading>

      <Card bg={cardBg} shadow="lg">
        <CardHeader>
          <HStack justify="space-between">
            <Heading size="md" color="emerald.600">
              {isDoctor ? 'Doktor Bilgileri' : 'Kişisel Bilgiler'}
            </Heading>
            <Badge colorScheme={isDoctor ? "blue" : "emerald"}>
              {isDoctor ? 'Doktor' : 'Hasta'}
            </Badge>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <Text fontWeight="bold">Ad Soyad:</Text>
              <Text>{profileData.name || "Belirtilmemiş"}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text fontWeight="bold">Yaş:</Text>
              <Text>{profileData.age || "Belirtilmemiş"}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text fontWeight="bold">Kan Grubu:</Text>
              <Badge colorScheme="red">{profileData.bloodType || "Belirtilmemiş"}</Badge>
            </HStack>
            <HStack justify="space-between">
              <Text fontWeight="bold">Acil Durum:</Text>
              <Text>{profileData.emergencyContact || "Belirtilmemiş"}</Text>
            </HStack>
            <Box>
              <Text fontWeight="bold" mb={2}>Alerjiler:</Text>
              <Text>{profileData.allergies || "Bilinen alerji yok"}</Text>
            </Box>
            <Box>
              <Text fontWeight="bold" mb={2}>Tıbbi Geçmiş:</Text>
              <Text>{profileData.medicalHistory || "Belirtilmemiş"}</Text>
            </Box>
            
            {isDoctor && profileData.specialization && (
              <Box>
                <Text fontWeight="bold" mb={2}>Uzmanlık Alanı:</Text>
                <Badge colorScheme="blue">{profileData.specialization}</Badge>
              </Box>
            )}
            
            {isDoctor && profileData.licenseNumber && (
              <Box>
                <Text fontWeight="bold" mb={2}>Lisans Numarası:</Text>
                <Text fontFamily="mono">{profileData.licenseNumber}</Text>
              </Box>
            )}
            
            <Divider />
            <Box>
              <Text fontWeight="bold" mb={2}>Cüzdan Adresi:</Text>
              <Text fontSize="sm" color="gray.600" fontFamily="mono">
                {profileData.walletAddress}
              </Text>
            </Box>
            {profileData.timestamp && (
              <Box>
                <Text fontWeight="bold" mb={2}>Oluşturulma Tarihi:</Text>
                <Text fontSize="sm" color="gray.600">
                  {new Date(profileData.timestamp).toLocaleString('tr-TR')}
                </Text>
              </Box>
            )}
          </VStack>
        </CardBody>
      </Card>

      <HStack justify="center" spacing={4}>
        <Button 
          colorScheme="emerald" 
          onClick={() => window.location.href = '/profile'}
        >
          Profili Düzenle
        </Button>
        <Button 
          colorScheme="blue" 
          variant="outline"
          onClick={() => window.location.href = '/'}
        >
          Ana Sayfaya Dön
        </Button>
      </HStack>
    </VStack>
  );
} 