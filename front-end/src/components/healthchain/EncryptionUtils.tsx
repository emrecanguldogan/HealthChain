"use client";

import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Textarea,
  FormControl,
  FormLabel,
  Card,
  CardBody,
  CardHeader,
  Badge,
  useColorModeValue,
  Alert,
  AlertIcon,
  Input,
} from "@chakra-ui/react";

export default function EncryptionUtils() {
  const [plainText, setPlainText] = useState("");
  const [encryptedText, setEncryptedText] = useState("");
  const [decryptedText, setDecryptedText] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const cardBg = useColorModeValue("white", "gray.800");

  // UTF-8 uyumlu şifreleme
  const simpleEncrypt = (text: string, key: string): string => {
    if (!text || !key) return "";
    
    // UTF-8 encoding
    const encoder = new TextEncoder();
    const textBytes = encoder.encode(text);
    const keyBytes = encoder.encode(key);
    
    // XOR encryption
    const encryptedBytes = new Uint8Array(textBytes.length);
    for (let i = 0; i < textBytes.length; i++) {
      encryptedBytes[i] = textBytes[i] ^ keyBytes[i % keyBytes.length];
    }
    
    // Convert to base64
    const binaryString = Array.from(encryptedBytes, byte => String.fromCharCode(byte)).join('');
    return btoa(binaryString);
  };

  const simpleDecrypt = (encryptedText: string, key: string): string => {
    if (!encryptedText || !key) return "";
    
    try {
      // Base64 decoding
      const binaryString = atob(encryptedText);
      const encryptedBytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        encryptedBytes[i] = binaryString.charCodeAt(i);
      }
      
      // XOR decryption
      const keyBytes = new TextEncoder().encode(key);
      const decryptedBytes = new Uint8Array(encryptedBytes.length);
      for (let i = 0; i < encryptedBytes.length; i++) {
        decryptedBytes[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length];
      }
      
      // UTF-8 decoding
      const decoder = new TextDecoder();
      return decoder.decode(decryptedBytes);
    } catch (error) {
      return "Şifre çözme hatası";
    }
  };

  const handleEncrypt = () => {
    if (!plainText || !password) {
      setStatus("Lütfen metin ve şifre girin!");
      return;
    }
    
    const encrypted = simpleEncrypt(plainText, password);
    setEncryptedText(encrypted);
    setStatus("Metin başarıyla şifrelendi!");
  };

  const handleDecrypt = () => {
    if (!encryptedText || !password) {
      setStatus("Lütfen şifreli metin ve şifre girin!");
      return;
    }
    
    const decrypted = simpleDecrypt(encryptedText, password);
    setDecryptedText(decrypted);
    setStatus("Metin başarıyla çözüldü!");
  };

  const handleClear = () => {
    setPlainText("");
    setEncryptedText("");
    setDecryptedText("");
    setPassword("");
    setStatus(null);
  };

  return (
    <VStack spacing={6} align="stretch">
      <Card bg={cardBg} shadow="md">
        <CardHeader>
          <Heading size="md" color="purple.600">
            🔐 Veri Şifreleme Aracı
          </Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Şifre (Anahtar)</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Şifreleme anahtarını girin"
              />
            </FormControl>

            <HStack w="full" spacing={4}>
              <FormControl>
                <FormLabel>Orijinal Metin</FormLabel>
                <Textarea
                  value={plainText}
                  onChange={(e) => setPlainText(e.target.value)}
                  placeholder="Şifrelenecek metni girin..."
                  rows={4}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Şifreli Metin</FormLabel>
                <Textarea
                  value={encryptedText}
                  onChange={(e) => setEncryptedText(e.target.value)}
                  placeholder="Şifreli metin burada görünecek..."
                  rows={4}
                  readOnly
                />
              </FormControl>
            </HStack>

            <FormControl>
              <FormLabel>Çözülmüş Metin</FormLabel>
              <Textarea
                value={decryptedText}
                onChange={(e) => setDecryptedText(e.target.value)}
                placeholder="Çözülmüş metin burada görünecek..."
                rows={3}
                readOnly
              />
            </FormControl>

            <HStack spacing={4}>
              <Button colorScheme="purple" onClick={handleEncrypt}>
                🔒 Şifrele
              </Button>
              <Button colorScheme="green" onClick={handleDecrypt}>
                🔓 Çöz
              </Button>
              <Button variant="outline" onClick={handleClear}>
                🗑️ Temizle
              </Button>
            </HStack>

            {status && (
              <Alert status="info">
                <AlertIcon />
                {status}
              </Alert>
            )}

            <Box p={4} bg="gray.50" borderRadius="md" w="full">
              <Text fontSize="sm" color="gray.600">
                <strong>Not:</strong> Bu basit bir XOR şifreleme örneğidir. 
                Gerçek sağlık verileri için AES-256 gibi güçlü şifreleme algoritmaları kullanılmalıdır.
              </Text>
            </Box>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
} 