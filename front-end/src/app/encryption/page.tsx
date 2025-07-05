"use client";

import React from "react";
import { Container, Heading, Text, Box } from "@chakra-ui/react";
import EncryptionUtils from "@/components/healthchain/EncryptionUtils";

export default function EncryptionPage() {
  return (
    <Container maxW="container.xl" py={8}>
      <Box textAlign="center" mb={8}>
        <Heading size="lg" color="purple.600" mb={4}>
          🔐 Veri Şifreleme Merkezi
        </Heading>
        <Text color="gray.600">
          Sağlık verilerinizi güvenli bir şekilde şifreleyin ve çözün
        </Text>
      </Box>
      
      <EncryptionUtils />
    </Container>
  );
} 