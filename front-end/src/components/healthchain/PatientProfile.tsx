"use client";

import React, { useState, FormEvent, useEffect } from "react";
import { useNetwork } from "@/lib/use-network";
import { HiroWalletContext } from "@/components/HiroWalletProvider";
import { useContext } from "react";
import { assignRole, mintAccessToken, hasAccessToken } from "@/lib/healthchain/operations";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Input,
  Textarea,
  FormControl,
  FormLabel,
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
} from "@chakra-ui/react";
import RecordUploadForm from "./RecordUploadForm";
import GrantAccessForm from "./GrantAccessForm";

interface PatientData {
  name: string;
  age: string;
  bloodType: string;
  allergies: string;
  emergencyContact: string;
  medicalHistory: string;
}

export default function PatientProfile() {
  const { testnetAddress, mainnetAddress, network } = useContext(HiroWalletContext);
  const currentNetwork = useNetwork();
  const [patientData, setPatientData] = useState<PatientData>({
    name: "",
    age: "",
    bloodType: "",
    allergies: "",
    emergencyContact: "",
    medicalHistory: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const currentAddress = currentNetwork === 'testnet' ? testnetAddress : mainnetAddress;

  // Load profile data and check user role
  useEffect(() => {
    if (currentAddress) {
      // Load saved profile from localStorage
      const savedProfile = localStorage.getItem(`patient_profile_${currentAddress}`);
      if (savedProfile) {
        try {
          const parsedProfile = JSON.parse(savedProfile);
          setPatientData({
            name: parsedProfile.name || "",
            age: parsedProfile.age || "",
            bloodType: parsedProfile.bloodType || "",
            allergies: parsedProfile.allergies || "",
            emergencyContact: parsedProfile.emergencyContact || "",
            medicalHistory: parsedProfile.medicalHistory || "",
          });
        } catch (error) {
          console.error("Error loading profile data:", error);
        }
      }

      // Check if user has access token
      checkUserStatus();
    }
  }, [currentAddress, currentNetwork]);

  const checkUserStatus = async () => {
    if (!currentAddress) return;

    try {
      setIsLoading(true);
      
      // Check if user has access token
      const tokenExists = await hasAccessToken(currentAddress, currentNetwork);
      setHasToken(tokenExists);

      // Check user role from localStorage (we'll implement blockchain role checking later)
      const savedRole = localStorage.getItem(`user_role_${currentAddress}`);
      if (savedRole) {
        setUserRole(savedRole);
      }
    } catch (error) {
      console.error("Error checking user status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignRole = async () => {
    if (!currentAddress) {
      setStatus("Cüzdan bağlanmalı!");
      return;
    }

    try {
      setIsLoading(true);
      setStatus("Rol atanıyor...");
      
      await assignRole("patient", currentNetwork);
      
      setUserRole("patient");
      localStorage.setItem(`user_role_${currentAddress}`, "patient");
      
      setStatus("Hasta rolü başarıyla atandı!");
    } catch (error) {
      console.error('Role assignment error:', error);
      setStatus("Rol atanırken hata oluştu! Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMintToken = async () => {
    if (!currentAddress) {
      setStatus("Cüzdan bağlanmalı!");
      return;
    }

    try {
      setIsLoading(true);
      setStatus("Erişim tokeni oluşturuluyor...");
      
      // Create a URI for the patient's health data
      const healthDataUri = `https://healthchain.com/patient/${currentAddress}/data`;
      
      await mintAccessToken(healthDataUri, currentNetwork);
      
      setHasToken(true);
      setStatus("Erişim tokeni başarıyla oluşturuldu!");
    } catch (error) {
      console.error('Token minting error:', error);
      setStatus("Token oluşturulurken hata oluştu! Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentAddress) {
      setStatus("Cüzdan bağlanmalı!");
      return;
    }

    try {
      setIsLoading(true);
      setStatus("Profil kaydediliyor...");
      
      // Save to localStorage (profile data is stored off-chain)
      const profileData = {
        ...patientData,
        walletAddress: currentAddress,
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem(`patient_profile_${currentAddress}`, JSON.stringify(profileData));
      
      setStatus("Profil başarıyla kaydedildi!");
      setIsEditing(false);
    } catch (error) {
      console.error('Profile creation error:', error);
      setStatus("Profil kaydedilirken hata oluştu! Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof PatientData, value: string) => {
    setPatientData(prev => ({ ...prev, [field]: value }));
  };

  if (!currentAddress) {
    return (
      <Alert status="warning">
        <AlertIcon />
        <AlertTitle>Wallet Bağlantısı Gerekli!</AlertTitle>
        <AlertDescription>
          Hasta profili görüntülemek için cüzdanınızı bağlamanız gerekiyor.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Wallet Status */}
      <Card bg={cardBg} shadow="md">
        <CardHeader>
          <Heading size="md" color="blue.600">
            💳 Cüzdan Durumu
          </Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={3} align="stretch">
            <HStack justify="space-between">
              <Text fontWeight="bold">Adres:</Text>
              <Text fontSize="sm" fontFamily="mono">{currentAddress}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text fontWeight="bold">Ağ:</Text>
              <Badge colorScheme={currentNetwork === 'testnet' ? 'orange' : 'green'}>
                {currentNetwork === 'testnet' ? 'Testnet' : 'Mainnet'}
              </Badge>
            </HStack>
            <HStack justify="space-between">
              <Text fontWeight="bold">Rol:</Text>
              <Badge colorScheme={userRole === 'patient' ? 'green' : 'gray'}>
                {userRole || 'Atanmamış'}
              </Badge>
            </HStack>
            <HStack justify="space-between">
              <Text fontWeight="bold">Erişim Tokeni:</Text>
              <Badge colorScheme={hasToken ? 'green' : 'red'}>
                {hasToken ? 'Mevcut' : 'Yok'}
              </Badge>
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Role Assignment */}
      {!userRole && (
        <Card bg={cardBg} shadow="md">
          <CardHeader>
            <Heading size="md" color="purple.600">
              🎭 Rol Atama
            </Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              <Text>Hasta profili oluşturmak için önce hasta rolü atamanız gerekiyor.</Text>
              <Button
                colorScheme="purple"
                onClick={handleAssignRole}
                isLoading={isLoading}
                loadingText="Rol Atanıyor..."
              >
                Hasta Rolü Ata
              </Button>
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Access Token */}
      {userRole === 'patient' && !hasToken && (
        <Card bg={cardBg} shadow="md">
          <CardHeader>
            <Heading size="md" color="orange.600">
              🔑 Erişim Tokeni
            </Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              <Text>Sağlık verilerinize erişim kontrolü için bir NFT tokeni oluşturmanız gerekiyor.</Text>
              <Button
                colorScheme="orange"
                onClick={handleMintToken}
                isLoading={isLoading}
                loadingText="Token Oluşturuluyor..."
              >
                Erişim Tokeni Oluştur
              </Button>
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Profil Bilgileri */}
      {userRole === 'patient' && (
        <Card bg={cardBg} shadow="md">
          <CardHeader>
            <HStack justify="space-between">
              <Heading size="md" color="emerald.600">
                🏥 Hasta Profili
              </Heading>
              <Button
                size="sm"
                colorScheme="emerald"
                onClick={() => setIsEditing(!isEditing)}
                isDisabled={isLoading}
              >
                {isEditing ? "İptal" : "Düzenle"}
              </Button>
            </HStack>
          </CardHeader>
          <CardBody>
            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <VStack spacing={4}>
                  <HStack w="full" spacing={4}>
                    <FormControl>
                      <FormLabel>Ad Soyad</FormLabel>
                      <Input
                        value={patientData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Ad Soyad"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Yaş</FormLabel>
                      <Input
                        value={patientData.age}
                        onChange={(e) => handleInputChange("age", e.target.value)}
                        placeholder="Yaş"
                        type="number"
                      />
                    </FormControl>
                  </HStack>

                  <HStack w="full" spacing={4}>
                    <FormControl>
                      <FormLabel>Kan Grubu</FormLabel>
                      <Input
                        value={patientData.bloodType}
                        onChange={(e) => handleInputChange("bloodType", e.target.value)}
                        placeholder="A+, B-, O+, AB+"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Acil Durum İletişim</FormLabel>
                      <Input
                        value={patientData.emergencyContact}
                        onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                        placeholder="Telefon numarası"
                      />
                    </FormControl>
                  </HStack>

                  <FormControl>
                    <FormLabel>Alerjiler</FormLabel>
                    <Textarea
                      value={patientData.allergies}
                      onChange={(e) => handleInputChange("allergies", e.target.value)}
                      placeholder="Bilinen alerjiler..."
                      rows={2}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Tıbbi Geçmiş</FormLabel>
                    <Textarea
                      value={patientData.medicalHistory}
                      onChange={(e) => handleInputChange("medicalHistory", e.target.value)}
                      placeholder="Önemli tıbbi geçmiş..."
                      rows={3}
                    />
                  </FormControl>

                  <HStack w="full" justify="flex-end">
                    <Button 
                      type="submit" 
                      colorScheme="emerald"
                      isLoading={isLoading}
                      loadingText="Kaydediliyor..."
                    >
                      Kaydet
                    </Button>
                  </HStack>
                </VStack>
              </form>
            ) : (
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Text fontWeight="bold">Ad Soyad:</Text>
                  <Text>{patientData.name || "Belirtilmemiş"}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontWeight="bold">Yaş:</Text>
                  <Text>{patientData.age || "Belirtilmemiş"}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontWeight="bold">Kan Grubu:</Text>
                  <Badge colorScheme="red">{patientData.bloodType || "Belirtilmemiş"}</Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text fontWeight="bold">Acil Durum:</Text>
                  <Text>{patientData.emergencyContact || "Belirtilmemiş"}</Text>
                </HStack>
                <Box>
                  <Text fontWeight="bold" mb={2}>Alerjiler:</Text>
                  <Text>{patientData.allergies || "Bilinen alerji yok"}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" mb={2}>Tıbbi Geçmiş:</Text>
                  <Text>{patientData.medicalHistory || "Belirtilmemiş"}</Text>
                </Box>
              </VStack>
            )}
          </CardBody>
        </Card>
      )}

      {status && (
        <Alert status="success">
          <AlertIcon />
          {status}
        </Alert>
      )}

      <Divider />

      {/* Sağlık Kayıtları */}
      {userRole === 'patient' && hasToken && (
        <Card bg={cardBg} shadow="md">
          <CardHeader>
            <Heading size="md" color="emerald.600">
              📋 Sağlık Kayıtları
            </Heading>
          </CardHeader>
          <CardBody>
            <RecordUploadForm />
          </CardBody>
        </Card>
      )}

      {/* Doktor Erişimi */}
      {userRole === 'patient' && hasToken && (
        <Card bg={cardBg} shadow="md">
          <CardHeader>
            <Heading size="md" color="blue.600">
              👨‍⚕️ Doktor Erişimi
            </Heading>
          </CardHeader>
          <CardBody>
            <GrantAccessForm />
          </CardBody>
        </Card>
      )}
    </VStack>
  );
} 