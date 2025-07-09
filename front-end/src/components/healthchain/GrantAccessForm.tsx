"use client";

import React, { useState, FormEvent, useContext } from "react";
import { HiroWalletContext } from "@/components/HiroWalletProvider";
import { grantAccess, hasAccessToken } from "@/lib/healthchain/operations";
import { useNetwork } from "@/lib/use-network";
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
} from "@chakra-ui/react";

export default function GrantAccessForm() {
  const { testnetAddress, mainnetAddress, network } = useContext(HiroWalletContext);
  const currentNetwork = useNetwork();
  const [doctorAddress, setDoctorAddress] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const cardBg = useColorModeValue("white", "gray.800");
  const currentAddress = currentNetwork === 'testnet' ? testnetAddress : mainnetAddress;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    
    if (!doctorAddress.trim()) {
      setStatus("Doktor adresi giriniz.");
      setLoading(false);
      return;
    }

    if (!tokenId.trim()) {
      setStatus("Token ID giriniz.");
      setLoading(false);
      return;
    }

    if (!currentAddress) {
      setStatus("Lütfen cüzdanınızı bağlayın.");
      setLoading(false);
      return;
    }

    try {
      // Check if user has access token
      const hasToken = await hasAccessToken(currentAddress, currentNetwork);
      if (!hasToken) {
        setStatus("❌ Önce bir erişim token'ı (NFT) oluşturmanız gerekiyor.");
        setLoading(false);
        return;
      }

      setStatus("Doktor erişimi veriliyor...");
      
      await grantAccess(doctorAddress, parseInt(tokenId), currentNetwork);
      setStatus("✅ Doktor erişimi başarıyla verildi!");
      
      // Clear form
      setDoctorAddress("");
      setTokenId("");
    } catch (err) {
      console.error('Error:', err);
      setStatus("❌ Doktor erişimi verilirken hata oluştu: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!currentAddress) {
    return (
      <Alert status="warning">
        <AlertIcon />
        <AlertTitle>Wallet Bağlantısı Gerekli!</AlertTitle>
        <AlertDescription>
          Doktor erişimi vermek için cüzdanınızı bağlamanız gerekiyor.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card bg={cardBg} shadow="md">
      <CardHeader>
        <Heading size="md" color="blue.600">
          👨‍⚕️ Doktor Erişimi Ver
        </Heading>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <Alert status="info">
              <AlertIcon />
              <Box>
                <AlertTitle>Blockchain İşlemi!</AlertTitle>
                <AlertDescription>
                  Bu işlem Hiro Wallet ile gerçek blockchain işlemi yapacaktır.
                </AlertDescription>
              </Box>
            </Alert>
            
            <FormControl>
              <FormLabel>Doktor Adresi</FormLabel>
              <Input
                type="text"
                placeholder="ST1M2X1WBC60W09W91W4ESDRHM94H75VGXGDNCQE8"
                value={doctorAddress}
                onChange={e => setDoctorAddress(e.target.value)}
                required
                disabled={loading}
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Token ID</FormLabel>
              <Input
                type="number"
                placeholder="0"
                value={tokenId}
                onChange={e => setTokenId(e.target.value)}
                required
                disabled={loading}
              />
            </FormControl>
            
            <Button
              type="submit"
              colorScheme="blue"
              w="full"
              isLoading={loading}
              loadingText="İşleniyor..."
              disabled={loading}
            >
              Doktor Erişimi Ver
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