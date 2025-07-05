"use client";

import React, { useState, useEffect } from "react";
import { useDevnetWallet } from "@/lib/devnet-wallet-context";
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
  const { currentWallet } = useDevnetWallet();
  const [profileData, setProfileData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    if (currentWallet) {
      loadProfile();
    } else {
      setLoading(false);
      setError("Cüzdan bağlanmalı");
    }
  }, [currentWallet]);

  const loadProfile = () => {
    if (!currentWallet) return;

    try {
      // First check if there's a predefined profile in the wallet context
      if (currentWallet.profileData) {
        const predefinedProfile: PatientData = {
          ...currentWallet.profileData,
          walletAddress: currentWallet.stxAddress,
          timestamp: new Date().toISOString(), // Add timestamp for display
        };
        setProfileData(predefinedProfile);
        setLoading(false);
        return;
      }

      // If no predefined profile, check localStorage
      const savedProfile = localStorage.getItem(`patient_profile_${currentWallet.stxAddress}`);
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        setProfileData(parsedProfile);
      } else {
        setError("Henüz profil oluşturulmamış");
      }
    } catch (error) {
      setError("Profil yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

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

  const isDoctor = currentWallet?.role === 'doctor';

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
          variant="outline" 
          colorScheme="emerald"
          onClick={() => window.location.href = '/'}
        >
          Ana Sayfaya Dön
        </Button>
      </HStack>
    </VStack>
  );
} 