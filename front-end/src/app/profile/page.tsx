"use client";

import React, { useState } from "react";
import { useDevnetWallet } from "@/lib/devnet-wallet-context";
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
} from "@chakra-ui/react";
import PatientProfile from "@/components/healthchain/PatientProfile";
import DoctorProfile from "@/components/healthchain/DoctorProfile";

export default function ProfilePage() {
  const { currentWallet } = useDevnetWallet();
  const network = useNetwork();
  const [userType, setUserType] = useState<"patient" | "doctor" | null>(null);
  
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");

  if (!currentWallet) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box textAlign="center" py={10}>
          <Heading size="lg" color="emerald.600" mb={4}>
            Profil Sayfası
          </Heading>
          <Text color="gray.600">Lütfen cüzdanınızı bağlayın.</Text>
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
          <Text color="gray.600">
            Adres: {currentWallet.stxAddress}
          </Text>
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