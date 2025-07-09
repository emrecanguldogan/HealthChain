"use client";

import React, { useState, FormEvent, useContext } from "react";
import { HiroWalletContext } from "@/components/HiroWalletProvider";
import { useNetwork } from "@/lib/use-network";
import { checkHasAccess } from '@/lib/healthchain/operations';
import {
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Input,
  FormControl,
  FormLabel,
  Card,
  CardBody,
  CardHeader,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Badge,
  Divider,
  Code,
} from "@chakra-ui/react";

export default function ViewRecord() {
  const { testnetAddress, mainnetAddress, isWalletConnected, authenticate } = useContext(HiroWalletContext);
  const currentNetwork = useNetwork();
  const [patient, setPatient] = useState("");
  const [record, setRecord] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const cardBg = useColorModeValue("white", "gray.800");
  const currentAddress = currentNetwork === 'testnet' ? testnetAddress : mainnetAddress;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus(null);
    setRecord(null);
    setLoading(true);
    
    if (!patient.trim()) {
      setStatus("Hasta adresi giriniz.");
      setLoading(false);
      return;
    }

    if (!isWalletConnected || !currentAddress) {
      setStatus("Lütfen cüzdanınızı bağlayın.");
      setLoading(false);
      return;
    }

    try {
      // Check if user is viewing their own data
      if (patient === currentAddress) {
        // User is viewing their own data - allow access
        console.log("User viewing their own data");
        await loadUserData(patient);
        return;
      }

      // Check access permissions for other patients
      const hasAccess = await checkHasAccess(patient, currentAddress, currentNetwork);
      if (!hasAccess) {
        setStatus("❌ Bu hasta verilerine erişim yetkiniz yok. Önce hasta tarafından yetkilendirilmeniz gerekiyor.");
        setLoading(false);
        return;
      }

      console.log("Authorized user viewing patient data");
      await loadUserData(patient);
    } catch (err) {
      console.error("Error:", err);
      setStatus("Veri alınırken hata oluştu: " + (err as Error).message);
      setLoading(false);
    }
  };

  const loadUserData = async (patientAddress: string) => {
    try {
      // Load patient profile from localStorage
      const profileKey = `patient_profile_${patientAddress}`;
      const savedProfile = localStorage.getItem(profileKey);
      
      if (savedProfile) {
        const profileData = JSON.parse(savedProfile);
        setRecord(JSON.stringify(profileData, null, 2));
        setStatus("✅ Hasta profili bulundu!");
        setLoading(false);
        return;
      }

      // Load patient records from localStorage
      const recordsKey = `patient_records_${patientAddress}`;
      const savedRecords = localStorage.getItem(recordsKey);
      
      if (savedRecords) {
        const recordsData = JSON.parse(savedRecords);
        setRecord(JSON.stringify(recordsData, null, 2));
        setStatus("✅ Hasta kayıtları bulundu!");
        setLoading(false);
        return;
      }

      setStatus("❌ Bu hasta için veri bulunamadı.");
    } catch (error) {
      console.error('Data loading error:', error);
      setStatus("Veri yüklenirken hata oluştu: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!isWalletConnected) {
    return (
      <Card bg={cardBg} shadow="md">
        <CardHeader>
          <Heading size="md" color="emerald.600">
            📋 Hasta Kaydı Görüntüle
          </Heading>
        </CardHeader>
        <CardBody>
          <Alert status="warning">
            <AlertIcon />
            <Box>
              <AlertTitle>Wallet Bağlantısı Gerekli!</AlertTitle>
              <AlertDescription>
                Hasta kayıtlarını görüntülemek için Hiro Wallet ile bağlanmanız gerekiyor.
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
        </CardBody>
      </Card>
    );
  }

  return (
    <Card bg={cardBg} shadow="md">
      <CardHeader>
        <Heading size="md" color="emerald.600">
          📋 Hasta Kaydı Görüntüle
        </Heading>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <Alert status="info">
              <AlertIcon />
              <Box>
                <AlertTitle>Erişim Kontrolü</AlertTitle>
                <AlertDescription>
                  Sadece kendi verilerinizi veya size erişim verilen hasta verilerini görüntüleyebilirsiniz.
                </AlertDescription>
              </Box>
            </Alert>
            
            <FormControl>
              <FormLabel>Hasta Adresi</FormLabel>
              <Input
                type="text"
                placeholder="ST1M2X1WBC60W09W91W4ESDRHM94H75VGXGDNCQE8"
                value={patient}
                onChange={e => setPatient(e.target.value)}
                required
                disabled={loading}
              />
            </FormControl>
            
            <Button
              type="submit"
              colorScheme="emerald"
              w="full"
              isLoading={loading}
              loadingText="Aranıyor..."
              disabled={loading}
            >
              Kayıt Görüntüle
            </Button>
            
            {status && (
              <Alert status={status.includes('❌') ? 'error' : 'success'}>
                <AlertIcon />
                {status}
              </Alert>
            )}
            
            {record && (
              <Box w="full">
                <Divider my={4} />
                <Heading size="sm" mb={2}>Veri:</Heading>
                <Code p={4} borderRadius="md" w="full" overflowX="auto">
                  <pre>{record}</pre>
                </Code>
              </Box>
            )}
          </VStack>
        </form>
      </CardBody>
    </Card>
  );
} 