"use client";

import React from "react";
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
  useColorModeValue,
  Alert,
  AlertIcon,
  Grid,
  GridItem,
  Icon,
} from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";

export default function WalletSelect() {
  const { currentWallet, wallets, setCurrentWallet } = useDevnetWallet();
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const handleWalletSelect = (wallet: any) => {
    setCurrentWallet(wallet);
    // Wallet seçimini localStorage'a kaydet
    localStorage.setItem('selected_wallet_address', wallet.stxAddress);
    // Kısa bir gecikme ile ana sayfaya yönlendir
    setTimeout(() => {
      window.location.href = '/';
    }, 500);
  };

  return (
    <VStack spacing={8} align="stretch" maxW="1200px" mx="auto" p={6}>
      <Box textAlign="center">
        <Heading size="lg" color="emerald.600" mb={4}>
          🏥 HealthChain - Wallet Seçimi
        </Heading>
        <Text fontSize="lg" color="gray.600">
          Test için bir devnet wallet seçin. Her wallet farklı bir hasta/doktor rolünü temsil eder.
        </Text>
      </Box>

      {currentWallet && (
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">Aktif Wallet:</Text>
            <Text fontSize="sm" fontFamily="mono">
              {currentWallet.stxAddress}
            </Text>
          </Box>
        </Alert>
      )}

      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
        {wallets.map((wallet, index) => (
          <GridItem key={wallet.stxAddress}>
            <Card 
              bg={cardBg} 
              shadow="md" 
              border={currentWallet?.stxAddress === wallet.stxAddress ? "2px solid" : "1px solid"}
              borderColor={currentWallet?.stxAddress === wallet.stxAddress ? "emerald.500" : borderColor}
              cursor="pointer"
              _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
              transition="all 0.2s"
              onClick={() => handleWalletSelect(wallet)}
            >
              <CardHeader pb={2}>
                <HStack justify="space-between">
                  <HStack>
                    <Box w={4} h={4} bg="emerald.500" borderRadius="full" />
                    <Heading size="md" color="emerald.600">
                      {wallet.label}
                    </Heading>
                  </HStack>
                  {currentWallet?.stxAddress === wallet.stxAddress && (
                    <Badge colorScheme="emerald" borderRadius="full">
                      <CheckIcon mr={1} />
                      Aktif
                    </Badge>
                  )}
                </HStack>
              </CardHeader>
              <CardBody pt={0}>
                <VStack spacing={3} align="stretch">
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      Adres:
                    </Text>
                    <Text fontSize="sm" fontFamily="mono" color="gray.700">
                      {wallet.stxAddress.substring(0, 12)}...
                      {wallet.stxAddress.substring(wallet.stxAddress.length - 12)}
                    </Text>
                  </Box>
                  
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      Rol:
                    </Text>
                    <Badge 
                      colorScheme={
                        wallet.role === 'deployer' ? "purple" : 
                        wallet.role === 'patient' ? "blue" : 
                        wallet.role === 'doctor' ? "green" : "gray"
                      }
                      borderRadius="full"
                    >
                      {wallet.role === 'deployer' ? "Deployer" : 
                       wallet.role === 'patient' ? "Hasta" : 
                       wallet.role === 'doctor' ? "Doktor" : "Test"}
                    </Badge>
                  </Box>

                  {wallet.profileData && (
                    <Box>
                      <Text fontSize="xs" color="gray.500" mb={1}>
                        İsim:
                      </Text>
                      <Text fontSize="sm" color="gray.700">
                        {wallet.profileData.name}
                      </Text>
                    </Box>
                  )}

                  {wallet.profileData?.specialization && (
                    <Box>
                      <Text fontSize="xs" color="gray.500" mb={1}>
                        Uzmanlık:
                      </Text>
                      <Text fontSize="sm" color="gray.700">
                        {wallet.profileData.specialization}
                      </Text>
                    </Box>
                  )}

                  <Button 
                    colorScheme="emerald" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWalletSelect(wallet);
                    }}
                  >
                    {currentWallet?.stxAddress === wallet.stxAddress ? "Aktif" : "Seç"}
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>
        ))}
      </Grid>

      <Box textAlign="center" mt={8}>
        <Text fontSize="sm" color="gray.500" mb={4}>
          💡 İpucu: Farklı wallet'lar arasında geçiş yaparak hasta-doktor etkileşimlerini test edebilirsiniz.
        </Text>
        <Button 
          colorScheme="emerald" 
          variant="outline"
          onClick={() => window.location.href = '/'}
        >
          Ana Sayfaya Dön
        </Button>
      </Box>
    </VStack>
  );
} 