"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { 
  createPatientProfile, 
  getPatientProfileByWallet, 
  checkUserHasPatientProfile,
  assignRole
} from "@/lib/healthchain/operations";
import { useNetwork } from "@/lib/use-network";
import { useCurrentAddress } from "@/hooks/useCurrentAddress";
import RecordUploadForm from "./RecordUploadForm";
import GrantAccessForm from "./GrantAccessForm";

interface PatientData {
  name: string;
  age: string;
  bloodType: string;
  allergies: string;
  emergencyContact: string;
  medicalHistory: string;
}

// Simple UI components
const Card = ({ children, className = "" }: any) => (
  <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, className = "", colorScheme = "blue" }: any) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded text-white font-medium hover:opacity-90 transition-opacity ${
      colorScheme === "emerald" ? "bg-emerald-500" : "bg-blue-500"
    } ${className}`}
  >
    {children}
  </button>
);

const Input = ({ value, onChange, placeholder, type = "text", className = "" }: any) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
  />
);

const Textarea = ({ value, onChange, placeholder, className = "" }: any) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={4}
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
  />
);

export default function PatientProfile() {
  const stxAddress = useCurrentAddress();
  const network = useNetwork();
  const [patientData, setPatientData] = useState<PatientData>({
    name: "",
    age: "",
    bloodType: "",
    allergies: "",
    emergencyContact: "",
    medicalHistory: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Profil durumunu kontrol et
  const checkProfileStatus = async () => {
    if (!stxAddress) return;
    
    setIsLoading(true);
    try {
      const profileExists = await checkUserHasPatientProfile(stxAddress);
      setHasProfile(profileExists);
      
      if (profileExists) {
        const profile = await getPatientProfileByWallet(stxAddress);
        if (profile) {
          setPatientData({
            name: profile.name || "",
            age: profile.age?.toString() || "",
            bloodType: profile.bloodType || "",
            allergies: profile.allergies || "",
            emergencyContact: profile.emergencyContact || "",
            medicalHistory: profile.medicalHistory || "",
          });
        }
      }
    } catch (error) {
      console.error("Profil durumu kontrol edilirken hata:", error);
      setHasProfile(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Profil verilerini yükle
  useEffect(() => {
    if (stxAddress) {
      checkProfileStatus();
    }
  }, [stxAddress]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stxAddress) {
      setStatus("Cüzdan bağlanmalı!");
      return;
    }

    try {
      setIsLoading(true);
      setStatus("Veritabanına kaydediliyor...");
      
      // Önce blockchain'e rol ata
      setStatus("Blockchain'e rol atanıyor...");
      try {
        console.log('🔗 Rol atama başlıyor...');
        console.log('📍 Network:', network);
        console.log('📍 Address:', stxAddress);
        console.log('📍 Role: patient');
        
        const roleResult = await assignRole(network, "patient", stxAddress);
        console.log('✅ Rol atama sonucu:', roleResult);
      } catch (error) {
        console.error('❌ Rol atama hatası:', error);
        
        // Contract deploy edilmemişse kullanıcıya bilgi ver
        if (error instanceof Error && error.message.includes('broadcasting transaction')) {
          setStatus("⚠️ Contract henüz testnet'te deploy edilmemiş. Sadece veritabanına kaydediliyor...");
          console.log('ℹ️ Contract olmadığı için blockchain işlemi atlanıyor, sadece veritabanına kayıt yapılacak');
          // Contract olmadan devam et - return etmiyoruz
        } else {
          setStatus(`Rol atama hatası: ${error}`);
          return;
        }
      }
      
      // Sonra veritabanına kaydet
      setStatus("Veritabanına kaydediliyor...");
      await createPatientProfile(stxAddress, {
        name: patientData.name,
        age: parseInt(patientData.age) || 0,
        bloodType: patientData.bloodType,
        allergies: patientData.allergies,
        emergencyContact: patientData.emergencyContact,
        medicalHistory: patientData.medicalHistory,
      });

      setStatus("Profil veritabanına başarıyla kaydedildi!");
      setIsEditing(false);
      
      // Profil durumunu yenile
      setTimeout(() => {
        checkProfileStatus();
      }, 2000);
    } catch (error) {
      console.error('Profile creation error:', error);
      setStatus("Veritabanına kaydedilirken hata oluştu! Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof PatientData, value: string) => {
    setPatientData(prev => ({ ...prev, [field]: value }));
  };

  if (!stxAddress) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="text-center py-8">
            <h2 className="text-xl font-bold text-gray-600 mb-2">
              🏥 Hasta Profili
            </h2>
            <p className="text-gray-500">Lütfen önce cüzdanınızı bağlayın.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profil Bilgileri */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-emerald-600">
            🏥 Hasta Profili
          </h2>
          <div className="flex space-x-2">
            {hasProfile && (
              <Button
                colorScheme="blue"
                onClick={checkProfileStatus}
                className="text-sm"
              >
                {isLoading ? "Yükleniyor..." : "Yenile"}
              </Button>
            )}
            <Button
              colorScheme="emerald"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "İptal" : "Düzenle"}
            </Button>
          </div>
        </div>
        
        {/* Profil Durumu */}
        <div className="mb-4 p-3 bg-gray-50 rounded text-sm">
          <div className="flex items-center space-x-2">
            <span className="font-semibold">Profil Durumu:</span>
            {hasProfile ? (
              <span className="text-green-600">✅ Veritabanında Kayıtlı</span>
            ) : (
              <span className="text-red-600">❌ Veritabanında Kayıtlı Değil</span>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Adres: {stxAddress}
          </div>
        </div>
        
        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Ad Soyad</label>
                  <Input
                    value={patientData.name}
                    onChange={(e: any) => handleInputChange("name", e.target.value)}
                    placeholder="Ad Soyad"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Yaş</label>
                  <Input
                    type="number"
                    value={patientData.age}
                    onChange={(e: any) => handleInputChange("age", e.target.value)}
                    placeholder="Yaş"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Kan Grubu</label>
                  <Input
                    value={patientData.bloodType}
                    onChange={(e: any) => handleInputChange("bloodType", e.target.value)}
                    placeholder="A+, B-, O+, AB+"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Acil Durum İletişim</label>
                  <Input
                    value={patientData.emergencyContact}
                    onChange={(e: any) => handleInputChange("emergencyContact", e.target.value)}
                    placeholder="Telefon numarası"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Alerjiler</label>
                <Input
                  value={patientData.allergies}
                  onChange={(e: any) => handleInputChange("allergies", e.target.value)}
                  placeholder="Alerjiler (varsa)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tıbbi Geçmiş</label>
                <Textarea
                  value={patientData.medicalHistory}
                  onChange={(e: any) => handleInputChange("medicalHistory", e.target.value)}
                  placeholder="Önemli tıbbi geçmiş bilgileri..."
                />
              </div>

              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  colorScheme="emerald"
                  className={isLoading ? "opacity-50 cursor-not-allowed" : ""}
                >
                  {isLoading ? "Kaydediliyor..." : "Veritabanına Kaydet"}
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="font-bold">Ad Soyad:</span>
              <span>{patientData.name || "Belirtilmemiş"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Yaş:</span>
              <span>{patientData.age || "Belirtilmemiş"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Kan Grubu:</span>
              <span>{patientData.bloodType || "Belirtilmemiş"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Acil Durum İletişim:</span>
              <span>{patientData.emergencyContact || "Belirtilmemiş"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Alerjiler:</span>
              <span>{patientData.allergies || "Yok"}</span>
            </div>
            <div>
              <span className="font-bold">Tıbbi Geçmiş:</span>
              <p className="mt-1 text-sm text-gray-600">{patientData.medicalHistory || "Belirtilmemiş"}</p>
            </div>
          </div>
        )}

        {status && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
            {status}
          </div>
        )}
      </Card>

      {/* Kayıt Yükleme */}
      <RecordUploadForm />

      {/* Doktor Erişimi Ver */}
      <GrantAccessForm />
    </div>
  );
} 