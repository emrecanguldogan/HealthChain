'use client';

import { Box, Button, Container, Flex, Link } from '@chakra-ui/react';
import { useContext, useCallback } from 'react';
import { HiroWalletContext } from './HiroWalletProvider';


import { ConnectWalletButton } from './ConnectWallet';
import { NetworkSelector } from './NetworkSelector';
import { isTestnetEnvironment, useNetwork } from '@/lib/use-network';

export const Navbar = () => {
  const { isWalletConnected } = useContext(HiroWalletContext);

  const network = useNetwork();

  const handleConnect = useCallback(async () => {
    if (!isWalletConnected) {
      try {
        const { connect } = await import('@stacks/connect');
        // In the latest API, connect() doesn't take appDetails directly
        // It's now handled through the request method with forceWalletSelect option
        await connect();
        window.location.reload();
      } catch (error) {
        console.error('Failed to load @stacks/connect:', error);
      }
    }
  }, [isWalletConnected]);

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
              <Box>Profil Oluştur</Box>
            </Link>
            <Link href="/my-profile">
              <Box>Benim Profilim</Box>
            </Link>
            <Link href="/encryption">
              <Box>Şifreleme</Box>
            </Link>
            <NetworkSelector />
                          <ConnectWalletButton />
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
};
