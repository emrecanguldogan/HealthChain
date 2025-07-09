"use client";

import React, { useState, useContext } from "react";
import { HiroWalletContext } from "@/components/HiroWalletProvider";
import { useNetwork } from "@/lib/use-network";
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Divider,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import PatientProfile from "@/components/healthchain/PatientProfile";
import DoctorProfile from "@/components/healthchain/DoctorProfile";

export default function ProfilePage() {
  const { testnetAddress, mainnetAddress, isWalletConnected, authenticate } = useContext(HiroWalletContext);
  const currentNetwork = useNetwork();
  const [userType, setUserType] = useState<"patient" | "doctor" | null>(null);
  
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const currentAddress = currentNetwork === 'testnet' ? testnetAddress : mainnetAddress;

  if (!isWalletConnected) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box textAlign="center" py={10}>
          <Heading size="lg" color="emerald.600" mb={4}>
            Profil Sayfası
          </Heading>
          <Alert status="warning" mb={6}>
            <AlertIcon />
            <Box>
              <AlertTitle>Wallet Bağlantısı Gerekli!</AlertTitle>
              <AlertDescription>
                Profil oluşturmak için Hiro Wallet ile bağlanmanız gerekiyor.
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
        </Box>
      </Container>
    );
  }

  if (!currentAddress) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box textAlign="center" py={10}>
          <Heading size="lg" color="emerald.600" mb={4}>
            Profil Sayfası
          </Heading>
          <Alert status="error">
            <AlertIcon />
            <AlertTitle>Wallet Adresi Bulunamadı!</AlertTitle>
            <AlertDescription>
              Lütfen wallet'ınızı yeniden bağlayın.
            </AlertDescription>
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading size="lg" color="emerald.600" mb={4}>
            Profil Yönetimi
          </Heading>
          <Text color="gray.600" fontSize="sm" fontFamily="mono">
            {currentAddress}
          </Text>
          <Badge colorScheme={currentNetwork === 'testnet' ? 'orange' : 'green'} mt={2}>
            {currentNetwork === 'testnet' ? 'Stacks Testnet' : 'Stacks Mainnet'}
          </Badge>
        </Box>

        {!userType ? (
          <Card bg={cardBg} shadow="md">
            <CardHeader>
              <Heading size="md" color="emerald.600">
                Kullanıcı Tipini Seçin
              </Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4}>
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  HealthChain'de hasta veya doktor olarak profil oluşturabilirsiniz.
                </Text>
                <Button
                  size="lg"
                  colorScheme="emerald"
                  onClick={() => setUserType("patient")}
                  w="full"
                >
                  🏥 Hasta Profili Oluştur
                </Button>
                <Button
                  size="lg"
                  colorScheme="blue"
                  onClick={() => setUserType("doctor")}
                  w="full"
                >
                  👨‍⚕️ Doktor Profili Oluştur
                </Button>
              </VStack>
            </CardBody>
          </Card>
        ) : (
          <>
            <HStack justify="center" mb={4}>
              <Badge
                colorScheme={userType === "patient" ? "emerald" : "blue"}
                fontSize="lg"
                p={2}
              >
                {userType === "patient" ? "🏥 Hasta" : "👨‍⚕️ Doktor"}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setUserType(null)}
              >
                Değiştir
              </Button>
            </HStack>

            {userType === "patient" ? (
              <PatientProfile />
            ) : (
              <DoctorProfile />
            )}
          </>
        )}
      </VStack>
    </Container>
  );
} 