"use client";

import MintAccessToken from "@/components/healthchain/MintAccessToken";
import GrantAccessForm from "@/components/healthchain/GrantAccessForm";
import RecordUploadForm from "@/components/healthchain/RecordUploadForm";
import ViewRecord from "@/components/healthchain/ViewRecord";
import { useState, useEffect } from "react";
import { isTestnetEnvironment } from "@/lib/use-network";
import { useCurrentAddress } from "@/hooks/useCurrentAddress";

// Basit UI bileşenleri
const Alert = ({ children, status = "info", className = "" }: any) => (
  <div className={`p-4 rounded-md mb-6 ${
    status === "warning" ? "bg-yellow-100 border border-yellow-400 text-yellow-800" :
    status === "success" ? "bg-green-100 border border-green-400 text-green-800" :
    "bg-blue-100 border border-blue-400 text-blue-800"
  } ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, className = "", size = "md" }: any) => (
  <button 
    onClick={onClick}
    className={`px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 ${
      size === "xs" ? "px-2 py-1 text-xs" : ""
    } ${className}`}
  >
    {children}
  </button>
);

function HomeContent() {
  const stxAddress = useCurrentAddress();

  const formatAddress = (address: string) => {
    return `${address.substring(0, 8)}...${address.substring(address.length - 8)}`;
  };

  return (
    <main className="min-h-screen bg-slate-900 flex flex-col items-center justify-center py-12">
      <div className="max-w-xl w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
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

        {!stxAddress && (
          <Alert status="warning">
            <div>
              <h3 className="font-semibold">Cüzdanınızı Bağlayın!</h3>
              <p className="text-sm mt-1">
                Hiro Wallet ile bağlanın ve testnet'te işlem yapın.
              </p>
            </div>
          </Alert>
        )}

        {stxAddress && (
          <Alert status="success">
            <div>
              <h3 className="font-semibold">Hiro Wallet Bağlandı!</h3>
              <p className="text-sm mt-1">
                <strong>Testnet Address:</strong>
              </p>
              <p className="text-xs mt-1 opacity-75">
                {formatAddress(stxAddress)}
              </p>
            </div>
          </Alert>
        )}

        {/* NFT-based Access Control Flow */}
        {stxAddress && (
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

export default function Home() {
  return <HomeContent />;
}
