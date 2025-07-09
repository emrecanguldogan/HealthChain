"use client";

import React, { useState, FormEvent, useContext } from "react";
import { HiroWalletContext } from "@/components/HiroWalletProvider";
import { useNetwork } from "@/lib/use-network";
import {
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
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Select,
  Box,
} from "@chakra-ui/react";

export default function RecordUploadForm() {
  const { testnetAddress, mainnetAddress, isWalletConnected, authenticate } = useContext(HiroWalletContext);
  const currentNetwork = useNetwork();
  const [recordData, setRecordData] = useState("");
  const [recordType, setRecordType] = useState("lab");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const cardBg = useColorModeValue("white", "gray.800");
  const currentAddress = currentNetwork === 'testnet' ? testnetAddress : mainnetAddress;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    
    if (!recordData.trim()) {
      setStatus("Kayıt verilerini giriniz.");
      setLoading(false);
      return;
    }

    if (!isWalletConnected || !currentAddress) {
      setStatus("Lütfen cüzdanınızı bağlayın.");
      setLoading(false);
      return;
    }

    try {
      setStatus("Kayıt yükleniyor...");
      
      // Store record in localStorage (off-chain storage)
      const recordKey = `health_record_${currentAddress}_${Date.now()}`;
      const recordInfo = {
        patient: currentAddress,
        type: recordType,
        data: recordData,
        uploadedAt: new Date().toISOString(),
        network: currentNetwork,
      };
      
      localStorage.setItem(recordKey, JSON.stringify(recordInfo));
      
      // Also store in patient's record list
      const patientRecordsKey = `patient_records_${currentAddress}`;
      const existingRecords = localStorage.getItem(patientRecordsKey);
      const records = existingRecords ? JSON.parse(existingRecords) : [];
      records.push(recordInfo);
      localStorage.setItem(patientRecordsKey, JSON.stringify(records));
      
      setStatus("✅ Kayıt başarıyla yüklendi!");
      setRecordData(""); // Clear form
    } catch (err) {
      console.error('Error:', err);
      setStatus("❌ Kayıt yüklenirken hata oluştu: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!isWalletConnected) {
    return (
      <Card bg={cardBg} shadow="md">
        <CardHeader>
          <Heading size="md" color="blue.600">
            📋 Sağlık Kaydı Yükle
          </Heading>
        </CardHeader>
        <CardBody>
          <Alert status="warning">
            <AlertIcon />
            <Box>
              <AlertTitle>Wallet Bağlantısı Gerekli!</AlertTitle>
              <AlertDescription>
                Sağlık kaydı yüklemek için Hiro Wallet ile bağlanmanız gerekiyor.
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
        <Heading size="md" color="blue.600">
          📋 Sağlık Kaydı Yükle
        </Heading>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <Alert status="info">
              <AlertIcon />
              <Box>
                <AlertTitle>Off-Chain Kayıt</AlertTitle>
                <AlertDescription>
                  Sağlık kayıtları güvenlik için off-chain olarak saklanır. 
                  Erişim kontrolü blockchain üzerinden yapılır.
                </AlertDescription>
              </Box>
            </Alert>
            
            <FormControl>
              <FormLabel>Kayıt Türü</FormLabel>
              <Select
                value={recordType}
                onChange={e => setRecordType(e.target.value)}
                disabled={loading}
              >
                <option value="lab">Laboratuvar Sonucu</option>
                <option value="radiology">Radyoloji</option>
                <option value="prescription">Reçete</option>
                <option value="note">Doktor Notu</option>
                <option value="vaccination">Aşı Kaydı</option>
                <option value="surgery">Cerrahi Kayıt</option>
              </Select>
            </FormControl>
            
            <FormControl>
              <FormLabel>Kayıt Verileri</FormLabel>
              <Textarea
                placeholder="Kayıt verilerini giriniz..."
                value={recordData}
                onChange={e => setRecordData(e.target.value)}
                rows={4}
                required
                disabled={loading}
              />
            </FormControl>
            
            <Button
              type="submit"
              colorScheme="blue"
              w="full"
              isLoading={loading}
              loadingText="Yükleniyor..."
              disabled={loading}
            >
              Kayıt Yükle
            </Button>
            
            {status && (
              <Alert status={status.includes('❌') ? 'error' : 'success'}>
                <AlertIcon />
                {status}
              </Alert>
            )}
          </VStack>
        </form>
      </CardBody>
    </Card>
  );
} 