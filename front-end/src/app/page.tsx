"use client";

import { useContext } from "react";
import { HiroWalletContext } from "@/components/HiroWalletProvider";
import { useNetwork } from "@/lib/use-network";
import PatientProfile from "@/components/healthchain/PatientProfile";
import DoctorProfile from "@/components/healthchain/DoctorProfile";
import { 
  Alert, 
  AlertIcon, 
  AlertTitle, 
  AlertDescription, 
  Button, 
  Text, 
  VStack,
  HStack,
  Heading,
  Box,
  useColorModeValue,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Divider,
} from "@chakra-ui/react";

export default function Home() {
  const { testnetAddress, mainnetAddress, network, isWalletConnected, authenticate } = useContext(HiroWalletContext);
  const currentNetwork = useNetwork();
  const cardBg = useColorModeValue("white", "gray.800");
  
  const currentAddress = currentNetwork === 'testnet' ? testnetAddress : mainnetAddress;

  return (
    <main className="min-h-screen bg-slate-900 flex flex-col items-center justify-center py-12">
      <div className="max-w-4xl w-full px-4">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            {/* Medical icon (Heroicons style) */}
            <svg className="w-16 h-16 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold text-emerald-600 mb-2">HealthChain</h1>
          <p className="text-lg text-slate-200 font-medium">
            NFT-based Health Data Access Control on Stacks Testnet
          </p>
          <p className="text-sm text-slate-400 mt-2">
            Own your health data. Share it with trusted doctors using NFTs on the blockchain.
          </p>
        </div>

        {!isWalletConnected && (
          <Card bg={cardBg} shadow="lg" mb={6}>
            <CardHeader>
              <Heading size="md" color="orange.600">
                🔗 Wallet Bağlantısı Gerekli
              </Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4}>
                <Text>
                  HealthChain'i kullanmak için Hiro Wallet ile bağlanmanız gerekiyor.
                </Text>
                <Button 
                  colorScheme="orange" 
                  size="lg"
                  onClick={authenticate}
                >
                  Hiro Wallet ile Bağlan
                </Button>
                <Text fontSize="sm" color="gray.500">
                  Stacks Testnet üzerinde gerçek blockchain işlemleri yapılacaktır.
                </Text>
              </VStack>
            </CardBody>
          </Card>
        )}

        {isWalletConnected && currentAddress && (
          <Card bg={cardBg} shadow="lg" mb={6}>
            <CardHeader>
              <Heading size="md" color="green.600">
                ✅ Wallet Bağlandı
              </Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={3} align="stretch">
                <HStack justify="space-between">
                  <Text fontWeight="bold">Adres:</Text>
                  <Text fontSize="sm" fontFamily="mono">{currentAddress}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontWeight="bold">Ağ:</Text>
                  <Badge colorScheme={currentNetwork === 'testnet' ? 'orange' : 'green'}>
                    {currentNetwork === 'testnet' ? 'Stacks Testnet' : 'Stacks Mainnet'}
                  </Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text fontWeight="bold">Kontrat:</Text>
                  <Text fontSize="sm" fontFamily="mono">
                    ST1M2X1WBC60W09W91W4ESDRHM94H75VGXGDNCQE8.healthchain_v5
                  </Text>
                </HStack>
                <Divider />
                <Text fontSize="sm" color="gray.600">
                  <strong>Önemli:</strong> Tüm işlemler gerçek Stacks Testnet üzerinde yapılacaktır. 
                  Testnet STX tokenlarına ihtiyacınız olabilir.
                </Text>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Main Application */}
        {isWalletConnected && currentAddress && (
          <VStack spacing={8} align="stretch">
            {/* Role Selection */}
            <Card bg={cardBg} shadow="md">
              <CardHeader>
                <Heading size="md" color="purple.600">
                  🎭 Rol Seçimi
                </Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4}>
                  <Text>
                    HealthChain'de hasta veya doktor olarak işlem yapabilirsiniz. 
                    Aşağıdaki sekmelerden birini seçin:
                  </Text>
                  <HStack spacing={4} justify="center">
                    <Button 
                      colorScheme="emerald" 
                      size="lg"
                      onClick={() => window.location.href = '/profile'}
                    >
                      🏥 Hasta Profili
                    </Button>
                    <Button 
                      colorScheme="blue" 
                      size="lg"
                      onClick={() => window.location.href = '/my-profile'}
                    >
                      👨‍⚕️ Doktor Profili
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Contract Information */}
            <Card bg={cardBg} shadow="md">
              <CardHeader>
                <Heading size="md" color="blue.600">
                  📋 Kontrat Bilgileri
                </Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={3} align="stretch">
                  <HStack justify="space-between">
                    <Text fontWeight="bold">Kontrat Adresi:</Text>
                    <Text fontSize="sm" fontFamily="mono">ST1M2X1WBC60W09W91W4ESDRHM94H75VGXGDNCQE8</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontWeight="bold">Kontrat Adı:</Text>
                    <Text fontSize="sm" fontFamily="mono">healthchain_v5</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontWeight="bold">Ağ:</Text>
                    <Badge colorScheme="orange">Stacks Testnet</Badge>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontWeight="bold">Explorer:</Text>
                    <a 
                      href="https://explorer.hiro.so/address/ST1M2X1WBC60W09W91W4ESDRHM94H75VGXGDNCQE8?chain=testnet" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: '#3182ce', textDecoration: 'underline' }}
                    >
                      Hiro Explorer'da Görüntüle
                    </a>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            {/* How It Works */}
            <Card bg={cardBg} shadow="md">
              <CardHeader>
                <Heading size="md" color="teal.600">
                  🔄 Nasıl Çalışır?
                </Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Box>
                    <Text fontWeight="bold" color="emerald.600">1. Rol Atama</Text>
                    <Text fontSize="sm">Hasta veya doktor rolünü blockchain'e kaydedin.</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="orange.600">2. NFT Token Oluşturma (Hasta)</Text>
                    <Text fontSize="sm">Sağlık verilerinize erişim kontrolü için NFT tokeni oluşturun.</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="blue.600">3. Doktor Erişimi Verme (Hasta)</Text>
                    <Text fontSize="sm">Güvendiğiniz doktorlara NFT üzerinden erişim izni verin.</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="purple.600">4. Veri Erişimi (Doktor)</Text>
                    <Text fontSize="sm">Size erişim verilen hastaların verilerini görüntüleyin.</Text>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        )}
      </div>
    </main>
  );
}
