"use client";

import React, { useState } from "react";
import { useNetwork } from "@/lib/use-network";
import { useCurrentAddress } from "@/hooks/useCurrentAddress";
import PatientProfile from "@/components/healthchain/PatientProfile";
import DoctorProfile from "@/components/healthchain/DoctorProfile";

// Basit UI bileşenleri
const Container = ({ children, className = "" }: any) => (
  <div className={`max-w-6xl mx-auto px-4 py-8 ${className}`}>
    {children}
  </div>
);

const Heading = ({ children, className = "" }: any) => (
  <h1 className={`text-2xl font-bold text-emerald-600 mb-4 ${className}`}>
    {children}
  </h1>
);

const Text = ({ children, className = "" }: any) => (
  <p className={`text-gray-600 ${className}`}>
    {children}
  </p>
);

const Button = ({ children, onClick, className = "", disabled = false }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded font-medium transition-colors ${className} ${
      disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'
    }`}
  >
    {children}
  </button>
);

const Card = ({ children, className = "" }: any) => (
  <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, className = "" }: any) => (
  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${className}`}>
    {children}
  </span>
);

export default function ProfilePage() {
  const stxAddress = useCurrentAddress();
  const network = useNetwork();
  const [userType, setUserType] = useState<"patient" | "doctor" | null>(null);

  if (!stxAddress) {
    return (
      <Container>
        <div className="text-center py-10">
          <Heading>Profil Sayfası</Heading>
          <Text>Lütfen cüzdanınızı bağlayın.</Text>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="space-y-8">
        <div className="text-center">
          <Heading>Profil Yönetimi</Heading>
          <Text>Adres: {stxAddress}</Text>
        </div>

        {!userType ? (
          <Card>
            <div className="mb-4">
              <Heading className="text-xl">Kullanıcı Tipini Seçin</Heading>
            </div>
            <div className="space-y-4">
              <Button
                className="w-full bg-emerald-600 text-white py-3 text-lg"
                onClick={() => setUserType("patient")}
              >
                🏥 Hasta Profili Oluştur
              </Button>
              <Button
                className="w-full bg-blue-600 text-white py-3 text-lg"
                onClick={() => setUserType("doctor")}
              >
                👨‍⚕️ Doktor Profili Oluştur
              </Button>
            </div>
          </Card>
        ) : (
          <>
            <div className="flex justify-center items-center gap-4 mb-4">
              <Badge className={
                userType === "patient" 
                  ? "bg-emerald-100 text-emerald-800" 
                  : "bg-blue-100 text-blue-800"
              }>
                {userType === "patient" ? "🏥 Hasta" : "👨‍⚕️ Doktor"}
              </Badge>
              <Button
                className="border border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => setUserType(null)}
              >
                Değiştir
              </Button>
            </div>

            {userType === "patient" ? (
              <PatientProfile />
            ) : (
              <DoctorProfile />
            )}
          </>
        )}
      </div>
    </Container>
  );
} 