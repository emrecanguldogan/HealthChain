"use client";

import { useDevnetWallet } from "@/lib/devnet-wallet-context";
import MintAccessToken from "@/components/healthchain/MintAccessToken";
import GrantAccessForm from "@/components/healthchain/GrantAccessForm";
import RecordUploadForm from "@/components/healthchain/RecordUploadForm";
import ViewRecord from "@/components/healthchain/ViewRecord";
import { Alert, AlertIcon, AlertTitle, AlertDescription, Button, Text, Switch, FormControl, FormLabel } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { isDevnetEnvironment } from "@/lib/use-network";

export default function Home() {
  const { currentWallet, setCurrentWallet, wallets } = useDevnetWallet();
  const [isTestMode, setIsTestMode] = useState(false); // Test modu kapalı - gerçek blockchain işlemleri

  // Devnet modunda otomatik olarak ilk wallet'ı seç
  useEffect(() => {
    if (isDevnetEnvironment() && !currentWallet && wallets.length > 0) {
      setCurrentWallet(wallets[0]); // İlk wallet'ı otomatik seç
    }
  }, [isDevnetEnvironment(), currentWallet, wallets, setCurrentWallet]);

  return (
    <main className="min-h-screen bg-slate-900 flex flex-col items-center justify-center py-12">
      <div className="max-w-xl w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            {/* Medical icon (Heroicons style) */}
            <svg className="w-16 h-16 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold text-emerald-600 mb-2">HealthChain</h1>
          <p className="text-lg text-slate-200 font-medium">
            NFT-based Health Data Access Control
          </p>
          <p className="text-sm text-slate-400 mt-2">
            Own your health data. Share it with trusted doctors using NFTs.
          </p>
        </div>

        {!currentWallet && !isDevnetEnvironment() && (
          <Alert status="warning" mb={6} borderRadius="md">
            <AlertIcon />
            <div>
              <AlertTitle>Wallet Seçimi Gerekli!</AlertTitle>
              <AlertDescription>
                Sağ üst köşeden bir devnet wallet seçin veya{" "}
                <a href="/wallet-select" style={{ color: '#059669', textDecoration: 'underline' }}>
                  buraya tıklayarak
                </a>{" "}
                wallet seçim sayfasına gidin. Farklı adreslerle test edebilirsiniz.
              </AlertDescription>
            </div>
          </Alert>
        )}

        {currentWallet && (
          <Alert status="success" mb={6} borderRadius="md">
            <AlertIcon />
            <div style={{ width: '100%' }}>
              <AlertTitle>Wallet Bağlandı!</AlertTitle>
              <AlertDescription>
                <Text fontWeight="bold">
                  {currentWallet.profileData?.name || currentWallet.label}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Rol: {currentWallet.role === 'deployer' ? 'Deployer' : 
                        currentWallet.role === 'patient' ? 'Hasta' : 
                        currentWallet.role === 'doctor' ? 'Doktor' : 'Test Kullanıcı'}
                </Text>
                <Text fontSize="xs" color="gray.500" fontFamily="mono">
                  {currentWallet.stxAddress.substring(0, 8)}...{currentWallet.stxAddress.substring(currentWallet.stxAddress.length - 8)}
                </Text>
                
                {/* Test Mode Toggle */}
                <FormControl display="flex" alignItems="center" mt={3}>
                  <FormLabel htmlFor="test-mode" mb="0" fontSize="sm">
                    🧪 Test Modu
                  </FormLabel>
                  <Switch 
                    id="test-mode" 
                    isChecked={isTestMode}
                    onChange={(e) => setIsTestMode(e.target.checked)}
                    colorScheme="blue"
                  />
                </FormControl>
                
                <Text fontSize="xs" color="gray.500" mt={1}>
                  {isTestMode ? 'Simülasyon modu aktif' : 'Gerçek blockchain işlemleri aktif'}
                </Text>
                
                <Button 
                  size="xs" 
                  colorScheme="red" 
                  variant="outline" 
                  mt={2}
                  onClick={() => {
                    localStorage.removeItem('selected_wallet_address');
                    window.location.reload();
                  }}
                >
                  Wallet Temizle
                </Button>
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* NFT-based Access Control Flow */}
        {(currentWallet || isDevnetEnvironment()) && (
          <div className="space-y-6">
            {/* Step 1: Mint Access Token (NFT) */}
            <MintAccessToken />
            
            {/* Step 2: Grant Doctor Access */}
            <GrantAccessForm />
            
            {/* Step 3: Upload Records */}
            <RecordUploadForm />
            
            {/* Step 4: View Records */}
            <ViewRecord />
          </div>
        )}
      </div>
    </main>
  );
}
