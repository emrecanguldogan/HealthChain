"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { 
  createDoctorProfile, 
  getDoctorProfileByWallet, 
  checkUserHasDoctorProfile,
  assignRole
} from "@/lib/healthchain/operations";
import { useNetwork } from "@/lib/use-network";
import { useCurrentAddress } from "@/hooks/useCurrentAddress";
import ViewRecord from "./ViewRecord";

interface DoctorData {
  name: string;
  specialization: string;
  licenseNumber: string;
  hospital: string;
  experience: string;
}

interface PatientAccess {
  patientAddress: string;
  patientName: string;
  lastAccess: string;
  status: "active" | "pending" | "expired";
}

// Basit UI bileşenleri
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

const Badge = ({ children, colorScheme = "blue" }: any) => (
  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
    colorScheme === "blue" ? "bg-blue-100 text-blue-800" :
    colorScheme === "green" ? "bg-green-100 text-green-800" :
    colorScheme === "yellow" ? "bg-yellow-100 text-yellow-800" :
    colorScheme === "red" ? "bg-red-100 text-red-800" :
    "bg-gray-100 text-gray-800"
  }`}>
    {children}
  </span>
);

export default function DoctorProfile() {
  const stxAddress = useCurrentAddress();
  const network = useNetwork();
  const [doctorData, setDoctorData] = useState<DoctorData>({
    name: "",
    specialization: "",
    licenseNumber: "",
    hospital: "",
    experience: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [patientAccesses, setPatientAccesses] = useState<PatientAccess[]>([]);

  // Profil durumunu kontrol et
  const checkProfileStatus = async () => {
    if (!stxAddress) return;
    
    setIsLoading(true);
    try {
      const profileExists = await checkUserHasDoctorProfile(stxAddress);
      setHasProfile(profileExists);
      
      if (profileExists) {
        const profile = await getDoctorProfileByWallet(stxAddress);
        if (profile) {
          setDoctorData({
            name: profile.name || "",
            specialization: profile.specialization || "",
            licenseNumber: profile.licenseNumber || "",
            hospital: "", // Hospital field not in database schema
            experience: profile.experience?.toString() || "",
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
      await assignRole(network, "doctor", stxAddress);
      
      // Sonra veritabanına kaydet
      setStatus("Veritabanına kaydediliyor...");
      await createDoctorProfile(stxAddress, {
        name: doctorData.name,
        specialization: doctorData.specialization,
        licenseNumber: doctorData.licenseNumber,
        experience: parseInt(doctorData.experience) || 0,
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

  const handleInputChange = (field: keyof DoctorData, value: string) => {
    setDoctorData(prev => ({ ...prev, [field]: value }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "green";
      case "pending": return "yellow";
      case "expired": return "red";
      default: return "gray";
    }
  };

  if (!stxAddress) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="text-center py-8">
            <h2 className="text-xl font-bold text-gray-600 mb-2">
              👨‍⚕️ Doktor Profili
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
            👨‍⚕️ Doktor Profili
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
                    value={doctorData.name}
                    onChange={(e: any) => handleInputChange("name", e.target.value)}
                    placeholder="Dr. Ad Soyad"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Uzmanlık Alanı</label>
                  <Input
                    value={doctorData.specialization}
                    onChange={(e: any) => handleInputChange("specialization", e.target.value)}
                    placeholder="Kardiyoloji, Nöroloji, vb."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Lisans Numarası</label>
                  <Input
                    value={doctorData.licenseNumber}
                    onChange={(e: any) => handleInputChange("licenseNumber", e.target.value)}
                    placeholder="Lisans numarası"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hastane/Klinik</label>
                  <Input
                    value={doctorData.hospital}
                    onChange={(e: any) => handleInputChange("hospital", e.target.value)}
                    placeholder="Hastane adı"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Deneyim (Yıl)</label>
                <Input
                  type="number"
                  value={doctorData.experience}
                  onChange={(e: any) => handleInputChange("experience", e.target.value)}
                  placeholder="Deneyim yılı"
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
              <span>{doctorData.name || "Belirtilmemiş"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Uzmanlık:</span>
              <span>{doctorData.specialization || "Belirtilmemiş"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Lisans No:</span>
              <span>{doctorData.licenseNumber || "Belirtilmemiş"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Hastane:</span>
              <span>{doctorData.hospital || "Belirtilmemiş"}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-bold">Deneyim:</span>
              <span>{doctorData.experience ? `${doctorData.experience} yıl` : "Belirtilmemiş"}</span>
            </div>
          </div>
        )}

        {status && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
            {status}
          </div>
        )}
      </Card>

      {/* Hasta Erişim Listesi */}
      <Card>
        <h3 className="text-lg font-bold text-blue-600 mb-4">
          👥 Hasta Erişim Listesi
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Hasta</th>
                <th className="text-left py-2">Adres</th>
                <th className="text-left py-2">Son Erişim</th>
                <th className="text-left py-2">Durum</th>
              </tr>
            </thead>
            <tbody>
              {patientAccesses.map((access, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">{access.patientName}</td>
                  <td className="py-2 text-sm text-gray-600">
                    {access.patientAddress.substring(0, 8)}...{access.patientAddress.substring(access.patientAddress.length - 8)}
                  </td>
                  <td className="py-2">{access.lastAccess}</td>
                  <td className="py-2">
                    <Badge colorScheme={getStatusColor(access.status)}>
                      {access.status === "active" ? "Aktif" : 
                       access.status === "pending" ? "Beklemede" : "Süresi Dolmuş"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Hasta Kayıtları Görüntüleme */}
      <ViewRecord />
    </div>
  );
} 