"use client";

import React, { useState, FormEvent, useEffect } from "react";
import { useDevnetWallet } from "@/lib/devnet-wallet-context";
import { useNetwork } from "@/lib/use-network";
import { createProfileOnChain, generateProfileHash } from "@/lib/healthchain/operations";
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
  const { currentWallet } = useDevnetWallet();
  const network = useNetwork();
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

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // Profil verilerini yükle
  useEffect(() => {
    if (currentWallet) {
      // Önce localStorage'dan kaydedilmiş profil var mı kontrol et
      const savedProfile = localStorage.getItem(`patient_profile_${currentWallet.stxAddress}`);
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
          console.error("Profil verisi yüklenirken hata:", error);
        }
      } else if (currentWallet.profileData) {
        // Eğer localStorage'da yoksa, önceden tanımlanmış profil bilgilerini kullan
        const predefinedProfile = currentWallet.profileData;
        setPatientData({
          name: predefinedProfile.name || "",
          age: predefinedProfile.age.toString() || "",
          bloodType: predefinedProfile.bloodType || "",
          allergies: predefinedProfile.allergies || "",
          emergencyContact: predefinedProfile.emergencyContact || "",
          medicalHistory: predefinedProfile.medicalHistory || "",
        });
      }
    }
  }, [currentWallet]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentWallet) {
      setStatus("Cüzdan bağlanmalı!");
      return;
    }

    try {
      setStatus("Blockchain'e kaydediliyor...");
      
      // Blockchain'e kaydet
      await createProfileOnChain({
        name: patientData.name,
        age: parseInt(patientData.age) || 0,
        bloodType: patientData.bloodType,
        allergies: patientData.allergies,
        emergencyContact: patientData.emergencyContact,
        medicalHistory: patientData.medicalHistory
      });

      // Hash oluştur
      const profileHash = generateProfileHash(
        currentWallet.stxAddress,
        patientData.name,
        parseInt(patientData.age) || 0
      );

      // Local storage'a da kaydet (cache için)
      const profileData = {
        ...patientData,
        walletAddress: currentWallet.stxAddress,
        timestamp: new Date().toISOString(),
        profileHash: profileHash
      };

      localStorage.setItem(`patient_profile_${currentWallet.stxAddress}`, JSON.stringify(profileData));
      
      setStatus("Profil blockchain'e başarıyla kaydedildi! Hash: " + profileHash.substring(0, 10) + "...");
      setIsEditing(false);
    } catch (error) {
      console.error('Profile creation error:', error);
      setStatus("Blockchain'e kaydedilirken hata oluştu! Lütfen tekrar deneyin.");
    }
  };

  const handleInputChange = (field: keyof PatientData, value: string) => {
    setPatientData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Profil Bilgileri */}
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
                  <Button type="submit" colorScheme="emerald">
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

      {status && (
        <Alert status="success">
          <AlertIcon />
          {status}
        </Alert>
      )}

      <Divider />

      {/* Sağlık Kayıtları */}
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

      {/* Doktor Erişimi */}
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
    </VStack>
  );
} 