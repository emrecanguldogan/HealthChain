"use client";

import React, { useState, FormEvent, useEffect, useContext } from "react";
import { HiroWalletContext } from "@/components/HiroWalletProvider";
import { useNetwork } from "@/lib/use-network";
import { assignRole, checkHasAccess, getDoctorPatients } from "@/lib/healthchain/operations";
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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
import ViewRecord from "./ViewRecord";

interface DoctorData {
  name: string;
  specialization: string;
  licenseNumber: string;
  hospital: string;
  phone: string;
  experience: string;
}

interface PatientAccess {
  patientAddress: string;
  patientName: string;
  lastAccess: string;
  status: "active" | "pending" | "expired";
}

export default function DoctorProfile() {
  const { testnetAddress, mainnetAddress, network } = useContext(HiroWalletContext);
  const currentNetwork = useNetwork();
  const [doctorData, setDoctorData] = useState<DoctorData>({
    name: "",
    specialization: "",
    licenseNumber: "",
    hospital: "",
    phone: "",
    experience: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [patientAccesses, setPatientAccesses] = useState<PatientAccess[]>([]);

  const cardBg = useColorModeValue("white", "gray.800");
  const currentAddress = currentNetwork === 'testnet' ? testnetAddress : mainnetAddress;

  // Load profile data and check user role
  useEffect(() => {
    if (currentAddress) {
      // Load saved profile from localStorage
      const savedProfile = localStorage.getItem(`doctor_profile_${currentAddress}`);
      if (savedProfile) {
        try {
          const parsedProfile = JSON.parse(savedProfile);
          setDoctorData({
            name: parsedProfile.name || "",
            specialization: parsedProfile.specialization || "",
            licenseNumber: parsedProfile.licenseNumber || "",
            hospital: parsedProfile.hospital || "",
            phone: parsedProfile.phone || "",
            experience: parsedProfile.experience || "",
          });
        } catch (error) {
          console.error("Error loading profile data:", error);
        }
      }

      // Check user role from localStorage
      const savedRole = localStorage.getItem(`user_role_${currentAddress}`);
      if (savedRole) {
        setUserRole(savedRole);
      }

      // Load patient accesses
      loadPatientAccesses();
    }
  }, [currentAddress, currentNetwork]);

  const loadPatientAccesses = async () => {
    if (!currentAddress) return;

    try {
      // For now, we'll use mock data since the contract doesn't have a direct getter
      // In a real implementation, you would query the blockchain for patient accesses
      const mockPatients: PatientAccess[] = [
        {
          patientAddress: "ST1M2X1WBC60W09W91W4ESDRHM94H75VGXGDNCQE8",
          patientName: "Alice Johnson",
          lastAccess: "2024-01-15",
          status: "active",
        },
        {
          patientAddress: "ST2NEB84ASENDXKYGJPQW86YXQCEFEX2ZQPG87ND",
          patientName: "Bob Smith",
          lastAccess: "2024-01-10",
          status: "active",
        },
      ];
      setPatientAccesses(mockPatients);
    } catch (error) {
      console.error("Error loading patient accesses:", error);
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
      
      await assignRole("doctor", currentNetwork);
      
      setUserRole("doctor");
      localStorage.setItem(`user_role_${currentAddress}`, "doctor");
      
      setStatus("Doktor rolü başarıyla atandı!");
    } catch (error) {
      console.error('Role assignment error:', error);
      setStatus("Rol atanırken hata oluştu! Lütfen tekrar deneyin.");
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
        ...doctorData,
        walletAddress: currentAddress,
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem(`doctor_profile_${currentAddress}`, JSON.stringify(profileData));
      
      setStatus("Profil başarıyla kaydedildi!");
      setIsEditing(false);
    } catch (error) {
      console.error('Profile creation error:', error);
      setStatus("Profil kaydedilirken hata oluştu! Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof DoctorData, value: string) => {
    setDoctorData(prev => ({ ...prev, [field]: value }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "green";
      case "pending": return "yellow";
      case "expired": return "red";
      default: return "gray";
    }
  };

  if (!currentAddress) {
    return (
      <Alert status="warning">
        <AlertIcon />
        <AlertTitle>Wallet Bağlantısı Gerekli!</AlertTitle>
        <AlertDescription>
          Doktor profili görüntülemek için cüzdanınızı bağlamanız gerekiyor.
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
              <Badge colorScheme={userRole === 'doctor' ? 'blue' : 'gray'}>
                {userRole || 'Atanmamış'}
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
              <Text>Doktor profili oluşturmak için önce doktor rolü atamanız gerekiyor.</Text>
              <Button
                colorScheme="purple"
                onClick={handleAssignRole}
                isLoading={isLoading}
                loadingText="Rol Atanıyor..."
              >
                Doktor Rolü Ata
              </Button>
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Profil Bilgileri */}
      {userRole === 'doctor' && (
        <Card bg={cardBg} shadow="md">
          <CardHeader>
            <HStack justify="space-between">
              <Heading size="md" color="blue.600">
                👨‍⚕️ Doktor Profili
              </Heading>
              <Button
                size="sm"
                colorScheme="blue"
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
                        value={doctorData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Dr. Ad Soyad"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Uzmanlık</FormLabel>
                      <Input
                        value={doctorData.specialization}
                        onChange={(e) => handleInputChange("specialization", e.target.value)}
                        placeholder="Kardiyoloji, Nöroloji..."
                      />
                    </FormControl>
                  </HStack>

                  <HStack w="full" spacing={4}>
                    <FormControl>
                      <FormLabel>Lisans Numarası</FormLabel>
                      <Input
                        value={doctorData.licenseNumber}
                        onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                        placeholder="Lisans numarası"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Hastane</FormLabel>
                      <Input
                        value={doctorData.hospital}
                        onChange={(e) => handleInputChange("hospital", e.target.value)}
                        placeholder="Hastane adı"
                      />
                    </FormControl>
                  </HStack>

                  <HStack w="full" spacing={4}>
                    <FormControl>
                      <FormLabel>Telefon</FormLabel>
                      <Input
                        value={doctorData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="Telefon numarası"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Deneyim</FormLabel>
                      <Input
                        value={doctorData.experience}
                        onChange={(e) => handleInputChange("experience", e.target.value)}
                        placeholder="X yıl"
                      />
                    </FormControl>
                  </HStack>

                  <HStack w="full" justify="flex-end">
                    <Button 
                      type="submit" 
                      colorScheme="blue"
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
                  <Text>{doctorData.name || "Belirtilmemiş"}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontWeight="bold">Uzmanlık:</Text>
                  <Badge colorScheme="blue">{doctorData.specialization || "Belirtilmemiş"}</Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text fontWeight="bold">Lisans No:</Text>
                  <Text>{doctorData.licenseNumber || "Belirtilmemiş"}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontWeight="bold">Hastane:</Text>
                  <Text>{doctorData.hospital || "Belirtilmemiş"}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontWeight="bold">Telefon:</Text>
                  <Text>{doctorData.phone || "Belirtilmemiş"}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontWeight="bold">Deneyim:</Text>
                  <Text>{doctorData.experience || "Belirtilmemiş"}</Text>
                </HStack>
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

      {/* Hasta Erişimleri */}
      {userRole === 'doctor' && (
        <Card bg={cardBg} shadow="md">
          <CardHeader>
            <Heading size="md" color="blue.600">
              🏥 Hasta Erişimleri
            </Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Hasta</Th>
                    <Th>Adres</Th>
                    <Th>Son Erişim</Th>
                    <Th>Durum</Th>
                    <Th>İşlem</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {patientAccesses.map((access, index) => (
                    <Tr key={index}>
                      <Td fontWeight="bold">{access.patientName}</Td>
                      <Td fontSize="xs" fontFamily="mono">
                        {access.patientAddress.slice(0, 8)}...{access.patientAddress.slice(-8)}
                      </Td>
                      <Td>{access.lastAccess}</Td>
                      <Td>
                        <Badge colorScheme={getStatusColor(access.status)}>
                          {access.status === "active" ? "Aktif" : 
                           access.status === "pending" ? "Beklemede" : "Süresi Dolmuş"}
                        </Badge>
                      </Td>
                      <Td>
                        <Button size="xs" colorScheme="emerald">
                          Görüntüle
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Kayıt Görüntüleme */}
      {userRole === 'doctor' && (
        <Card bg={cardBg} shadow="md">
          <CardHeader>
            <Heading size="md" color="emerald.600">
              📋 Hasta Kaydı Görüntüle
            </Heading>
          </CardHeader>
          <CardBody>
            <ViewRecord />
          </CardBody>
        </Card>
      )}
    </VStack>
  );
} 