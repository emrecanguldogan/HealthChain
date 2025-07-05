'use client';

import {
  Box,
  Button,
  Flex,
  Tooltip,
  Tag,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Link,
  Text,
} from '@chakra-ui/react';
import { ChevronDownIcon, CheckIcon } from '@chakra-ui/icons';
import { DevnetWallet } from '@/lib/devnet-wallet-context';
import { formatStxAddress } from '@/lib/address-utils';
import { DEVNET_STACKS_BLOCKCHAIN_API_URL } from '@/constants/devnet';

interface DevnetWalletButtonProps {
  currentWallet: DevnetWallet | null;
  wallets: DevnetWallet[];
  onWalletSelect: (wallet: DevnetWallet) => void;
}

export const DevnetWalletButton = ({
  currentWallet,
  wallets,
  onWalletSelect,
}: DevnetWalletButtonProps) => {
  return (
    <Menu>
      <Flex align="center">
        {currentWallet ? (
          <Link
            href={`https://explorer.hiro.so/address/${currentWallet.stxAddress}?chain=testnet&api=${DEVNET_STACKS_BLOCKCHAIN_API_URL}`}
            target="_blank"
            _hover={{ textDecoration: 'none' }}
          >
            <Button variant="ghost" rightIcon={<ChevronDownIcon visibility="hidden" />}>
              <Tooltip label="Devnet connection detected, click to view in explorer" bg="gray.800">
                <Flex align="center" gap={2}>
                  <Box
                    fontSize="sm"
                    fontFamily="mono"
                    width="140px"
                    overflow="hidden"
                    textOverflow="ellipsis"
                  >
                    {formatStxAddress(currentWallet.stxAddress)}
                  </Box>
                  <Tag size="sm" colorScheme="purple" borderRadius="full">
                    {currentWallet.label}
                  </Tag>
                </Flex>
              </Tooltip>
            </Button>
          </Link>
        ) : (
          <Button variant="ghost" colorScheme="emerald">
            <Flex align="center" gap={2}>
              <Box fontSize="sm">Wallet Seç</Box>
              <Tag size="sm" colorScheme="orange" borderRadius="full">
                devnet
              </Tag>
            </Flex>
          </Button>
        )}
        <MenuButton
          as={IconButton}
          variant="ghost"
          icon={<ChevronDownIcon />}
          aria-label="Select wallet"
          size="md"
        />
      </Flex>
      <MenuList width={'300px'}>
        <Box p={2} borderBottom="1px solid" borderColor="gray.200">
          <Text fontSize="sm" fontWeight="bold" color="gray.600">
            Devnet Wallet Seç
          </Text>
        </Box>
        {wallets.map((wallet, index) => (
          <MenuItem key={wallet.stxAddress} onClick={() => onWalletSelect(wallet)}>
            <Flex align="center" gap={3} w="full">
              <Box
                fontSize="sm"
                fontFamily="mono"
                flex={1}
                overflow="hidden"
                textOverflow="ellipsis"
              >
                {formatStxAddress(wallet.stxAddress)}
              </Box>
                             <Tag 
                 size="sm" 
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
               </Tag>
              {currentWallet?.stxAddress === wallet.stxAddress && (
                <CheckIcon color="emerald.500" />
              )}
            </Flex>
          </MenuItem>
        ))}
        <Box p={2} borderTop="1px solid" borderColor="gray.200">
          <Text fontSize="xs" color="gray.500" mb={2}>
            💡 Farklı wallet'lar farklı hasta/doktor rolleri temsil eder
          </Text>
          {currentWallet && (
            <Button 
              size="xs" 
              colorScheme="red" 
              variant="outline"
              onClick={() => {
                localStorage.removeItem('selected_wallet_address');
                window.location.reload();
              }}
            >
              Wallet Temizle
            </Button>
          )}
        </Box>
      </MenuList>
    </Menu>
  );
};
