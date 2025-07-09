'use client';

import { Box, Button, Container, Flex, Link } from '@chakra-ui/react';
import { useContext, useCallback } from 'react';
import { HiroWalletContext } from './HiroWalletProvider';
import { ConnectWalletButton } from './ConnectWallet';
import { NetworkSelector } from './NetworkSelector';

export const Navbar = () => {
  const { isWalletConnected, authenticate, disconnect } = useContext(HiroWalletContext);

  const handleConnect = useCallback(async () => {
    if (!isWalletConnected) {
      try {
        await authenticate();
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    }
  }, [isWalletConnected, authenticate]);

  return (
    <Box as="nav" bg="white" boxShadow="sm">
      <Container maxW="container.xl">
        <Flex justify="space-between" h={16} align="center">
          <Flex align="center">
            <Flex
              bg="white"
              borderRadius="md"
              border="2px"
              borderColor="gray.700"
              letterSpacing="-.05em"
              fontSize="xl"
              fontWeight="bold"
              w="52px"
              h="52px"
              justify="center"
              align="center"
              color="gray.900"
              shrink="0"
            >
              /-/
            </Flex>
            <Link href="/" textDecoration="none">
              <Box fontSize="lg" fontWeight="bold" color="emerald.600" ml={4}>
                HealthChain
              </Box>
            </Link>
          </Flex>
          <Flex align="center" gap={4}>
            <Link href="/profile">
              <Box>Hasta Profili</Box>
            </Link>
            <Link href="/my-profile">
              <Box>Doktor Profili</Box>
            </Link>
            <NetworkSelector />
            <ConnectWalletButton />
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
};
