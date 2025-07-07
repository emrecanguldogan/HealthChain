"use client";

import React, { useState, useEffect } from "react";
import { useNetwork } from "@/lib/use-network";
import { 
  getUserAccessTokens, 
  deleteAccessToken,
  getPatientProfileByWallet,
  getDoctorProfileByWallet,
  checkUserHasPatientProfile,
  checkUserHasDoctorProfile
} from "@/lib/healthchain/operations";
import { useCurrentAddress } from "@/hooks/useCurrentAddress";

interface PatientData {
  name: string;
  age: string | number;
  bloodType: string;
  allergies: string;
  emergencyContact: string;
  medicalHistory: string;
  walletAddress: string;
  timestamp?: string;
  specialization?: string;
  licenseNumber?: string;
}

interface AccessToken {
  tokenId: number;
  owner: string;
  isActive: boolean;
  createdAt: string;
  network: string;
}

// Simple UI components
const Alert = ({ children, status = "info", className = "" }: any) => (
  <div className={`p-4 rounded-md mb-6 ${
    status === "warning" ? "bg-yellow-100 border border-yellow-400 text-yellow-800" :
    status === "success" ? "bg-green-100 border border-green-400 text-green-800" :
    status === "error" ? "bg-red-100 border border-red-400 text-red-800" :
    "bg-blue-100 border border-blue-400 text-blue-800"
  } ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, className = "", variant = "primary" }: any) => (
  <button 
    onClick={onClick}
    className={`px-4 py-2 rounded-md ${
      variant === "primary" ? "bg-blue-500 text-white hover:bg-blue-600" :
      variant === "secondary" ? "bg-gray-500 text-white hover:bg-gray-600" :
      variant === "danger" ? "bg-red-500 text-white hover:bg-red-600" :
      "bg-green-500 text-white hover:bg-green-600"
    } ${className}`}
  >
    {children}
  </button>
);

const Card = ({ children, className = "" }: any) => (
  <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, color = "blue" }: any) => (
  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
    color === "blue" ? "bg-blue-100 text-blue-800" :
    color === "green" ? "bg-green-100 text-green-800" :
    color === "red" ? "bg-red-100 text-red-800" :
    "bg-gray-100 text-gray-800"
  }`}>
    {children}
  </span>
);

export default function MyProfile() {
  const stxAddress = useCurrentAddress();
  const network = useNetwork();
  const [profileData, setProfileData] = useState<PatientData | null>(null);
  const [accessTokens, setAccessTokens] = useState<AccessToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingToken, setDeletingToken] = useState<number | null>(null);

  useEffect(() => {
    if (stxAddress) {
      loadProfile();
      loadAccessTokens();
    } else {
      setLoading(false);
      setError("Cüzdan bağlanmalı");
    }
  }, [stxAddress]);

  const loadProfile = async () => {
    if (!stxAddress) return;

    try {
      // Check if user has patient profile in database
      const hasPatientProfile = await checkUserHasPatientProfile(stxAddress);
      
      if (hasPatientProfile) {
        // Get patient profile from database
        const patientProfile = await getPatientProfileByWallet(stxAddress);
        if (patientProfile) {
          setProfileData({
            name: patientProfile.name,
            age: patientProfile.age,
            bloodType: patientProfile.bloodType,
            allergies: patientProfile.allergies,
            emergencyContact: patientProfile.emergencyContact,
            medicalHistory: patientProfile.medicalHistory,
            walletAddress: stxAddress,
            timestamp: patientProfile.createdAt?.toISOString()
          });
          return;
        }
      }

      // Check if user has doctor profile in database
      const hasDoctorProfile = await checkUserHasDoctorProfile(stxAddress);
      
      if (hasDoctorProfile) {
        // Get doctor profile from database
        const doctorProfile = await getDoctorProfileByWallet(stxAddress);
        if (doctorProfile) {
          setProfileData({
            name: doctorProfile.name,
            age: 0, // Doctors don't have age in our schema
            bloodType: "", // Doctors don't have blood type
            allergies: "", // Doctors don't have allergies
            emergencyContact: "", // Doctors don't have emergency contact
            medicalHistory: "", // Doctors don't have medical history
            walletAddress: stxAddress,
            timestamp: doctorProfile.createdAt?.toISOString(),
            specialization: doctorProfile.specialization,
            licenseNumber: doctorProfile.licenseNumber
          });
          return;
        }
      }

      // No profile found
      setError("Henüz profil oluşturulmamış");
    } catch (error) {
      console.error('Error loading profile:', error);
      setError("Profil yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const loadAccessTokens = async () => {
    if (!stxAddress || !network) return;

    try {
      const tokens = await getUserAccessTokens(network, stxAddress);
      setAccessTokens(tokens);
    } catch (error) {
      console.error('Error loading access tokens:', error);
    }
  };

  const handleDeleteToken = async (tokenId: number) => {
    if (!stxAddress || !network) return;

    setDeletingToken(tokenId);
    try {
      const success = await deleteAccessToken(network, stxAddress);
      if (success) {
        // Refresh the token list
        await loadAccessTokens();
      }
    } catch (error) {
      console.error('Error deleting token:', error);
    } finally {
      setDeletingToken(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-200">Profil yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center py-12">
        <div className="max-w-md w-full">
          <Alert status="warning">
            {error}
          </Alert>
          <Button 
            className="w-full"
            onClick={() => window.location.href = '/profile'}
          >
            Profil Oluştur
          </Button>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center py-12">
        <div className="max-w-md w-full">
          <Alert status="info">
            Henüz profil oluşturulmamış
          </Alert>
          <Button 
            className="w-full"
            onClick={() => window.location.href = '/profile'}
          >
            Profil Oluştur
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Profilim</h1>
          <p className="text-slate-400">Cüzdan Adresi: {stxAddress}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Profil Bilgileri */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {profileData.specialization ? "Doktor Profili" : "Hasta Profili"}
            </h2>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">İsim:</span>
                <span className="ml-2 text-gray-900">{profileData.name}</span>
              </div>
              
              {profileData.specialization ? (
                // Doctor profile fields
                <>
                  <div>
                    <span className="font-medium text-gray-700">Uzmanlık:</span>
                    <span className="ml-2 text-gray-900">{profileData.specialization}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Lisans No:</span>
                    <span className="ml-2 text-gray-900">{profileData.licenseNumber}</span>
                  </div>
                </>
              ) : (
                // Patient profile fields
                <>
                  <div>
                    <span className="font-medium text-gray-700">Yaş:</span>
                    <span className="ml-2 text-gray-900">{profileData.age}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Kan Grubu:</span>
                    <span className="ml-2 text-gray-900">{profileData.bloodType}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Alerjiler:</span>
                    <span className="ml-2 text-gray-900">{profileData.allergies}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Acil Durum İletişimi:</span>
                    <span className="ml-2 text-gray-900">{profileData.emergencyContact}</span>
                  </div>
                </>
              )}
              
              {profileData.timestamp && (
                <div>
                  <span className="font-medium text-gray-700">Oluşturulma Tarihi:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(profileData.timestamp).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Erişim Tokenları */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Erişim Tokenları</h2>
            {!Array.isArray(accessTokens) || accessTokens.length === 0 ? (
              <p className="text-gray-500">Henüz erişim tokeni yok</p>
            ) : (
              <div className="space-y-3">
                {accessTokens.map((token) => (
                  <div key={token.tokenId} className="border rounded p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Token #{token.tokenId}</span>
                      <Badge color={token.isActive ? "green" : "red"}>
                        {token.isActive ? "Aktif" : "Pasif"}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>Oluşturulma: {new Date(token.createdAt).toLocaleDateString()}</div>
                      <div>Ağ: {token.network}</div>
                    </div>
                    <Button
                      variant="danger"
                      className="mt-2 text-sm"
                      onClick={() => handleDeleteToken(token.tokenId)}
                      disabled={deletingToken === token.tokenId}
                    >
                      {deletingToken === token.tokenId ? "Siliniyor..." : "Sil"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Tıbbi Geçmiş - Sadece hasta profilleri için */}
        {!profileData.specialization && profileData.medicalHistory && (
          <Card className="mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Tıbbi Geçmiş</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{profileData.medicalHistory}</p>
          </Card>
        )}
      </div>
    </div>
  );
} 