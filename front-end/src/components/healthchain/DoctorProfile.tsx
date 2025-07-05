"use client";

import React, { useState, FormEvent } from "react";
import { useDevnetWallet } from "@/lib/devnet-wallet-context";
import { useNetwork } from "@/lib/use-network";
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
  const { currentWallet } = useDevnetWallet();
  const network = useNetwork();
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
  const [patientAccesses, setPatientAccesses] = useState<PatientAccess[]>([
    {
      patientAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
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
  ]);

  const cardBg = useColorModeValue("white", "gray.800");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("Profil güncellendi!");
    setIsEditing(false);
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

  return (
    <VStack spacing={6} align="stretch">
      {/* Profil Bilgileri */}
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
                  <Button type="submit" colorScheme="blue">
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

      {status && (
        <Alert status="success">
          <AlertIcon />
          {status}
        </Alert>
      )}

      <Divider />

      {/* Hasta Erişimleri */}
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

      {/* Kayıt Görüntüleme */}
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
    </VStack>
  );
} 