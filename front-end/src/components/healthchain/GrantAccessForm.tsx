"use client";

import React, { useState, FormEvent } from "react";
import { 
  authorizeDoctor, 
  checkHasAccessToken,
  saveDoctorAuthorizationToDatabase,
  checkDoctorAuthorizationInDatabase
} from "@/lib/healthchain/operations";
import { useNetwork } from "@/lib/use-network";
import { useCurrentAddress } from "@/hooks/useCurrentAddress";

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

const Input = ({ value, onChange, placeholder, className = "" }: any) => (
  <input
    type="text"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
  />
);

const Checkbox = ({ checked, onChange, label }: any) => (
  <label className="flex items-center space-x-2">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
    />
    <span className="text-sm">{label}</span>
  </label>
);

export default function GrantAccessForm() {
  const stxAddress = useCurrentAddress();
  const network = useNetwork();
  const [doctor, setDoctor] = useState("");
  const [permissions, setPermissions] = useState<string[]>(["read"]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stxAddress) {
      setStatus("Cüzdan bağlanmalı!");
      return;
    }

    if (!doctor.trim()) {
      setStatus("Doktor adresi gerekli!");
      return;
    }

    setLoading(true);
    setStatus("Yetkilendirme işlemi başlatılıyor...");

    try {
      // Önce kullanıcının access token'ı olup olmadığını kontrol et
      const hasToken = await checkHasAccessToken(stxAddress, network);
      if (!hasToken) {
        setStatus("❌ Önce bir erişim token'ı oluşturmanız gerekiyor.");
        setLoading(false);
        return;
      }

      // Doktorun zaten yetkili olup olmadığını kontrol et
      const isAlreadyAuthorized = await checkDoctorAuthorizationInDatabase(stxAddress, doctor);
      if (isAlreadyAuthorized) {
        setStatus("❌ Bu doktor zaten yetkilendirilmiş.");
        setLoading(false);
        return;
      }

      // Veritabanına yetkilendirme kaydet
      setStatus("Veritabanına yetkilendirme kaydediliyor...");
      await saveDoctorAuthorizationToDatabase({
        patientWalletAddress: stxAddress,
        doctorWalletAddress: doctor,
        permissions: permissions,
      });

      // Blockchain'e yetkilendirme işlemi gönder
      setStatus("Blockchain'e yetkilendirme işlemi gönderiliyor...");
      await authorizeDoctor(doctor, permissions, network);
      
      setStatus("✅ Doktor yetkilendirme işlemi tamamlandı! Hem veritabanına hem blockchain'e kaydedildi.");
      
      // Formu temizle
      setDoctor("");
      setPermissions(["read"]);
    } catch (err) {
      console.error('Error:', err);
      setStatus("❌ Doktor yetkilendirilirken hata oluştu: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (checked) {
      setPermissions(prev => [...prev, permission]);
    } else {
      setPermissions(prev => prev.filter(p => p !== permission));
    }
  };

  if (!stxAddress) {
    return (
      <Card>
        <h3 className="text-lg font-semibold text-blue-600 mb-4">
          🔐 Doktor Erişimi Ver
        </h3>
        <p className="text-gray-600">Lütfen önce cüzdanınızı bağlayın.</p>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold text-blue-600 mb-4">
        🔐 Doktor Erişimi Ver
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Doktor Adresi</label>
          <Input
            value={doctor}
            onChange={(e: any) => setDoctor(e.target.value)}
            placeholder="ST1M2X1WBC60W09W91W4ESDRHM94H75VGXGDNCQE8"
          />
          <p className="text-xs text-gray-500 mt-1">
            Doktorun Stacks cüzdan adresini girin
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">İzinler</label>
          <div className="space-y-2">
            <Checkbox
              checked={permissions.includes("read")}
              onChange={(e: any) => handlePermissionChange("read", e.target.checked)}
              label="Sağlık verilerini görüntüleme"
            />
            <Checkbox
              checked={permissions.includes("write")}
              onChange={(e: any) => handlePermissionChange("write", e.target.checked)}
              label="Sağlık verilerini güncelleme"
            />
            <Checkbox
              checked={permissions.includes("delete")}
              onChange={(e: any) => handlePermissionChange("delete", e.target.checked)}
              label="Sağlık verilerini silme"
            />
          </div>
        </div>

        <Button
          type="submit"
          colorScheme="blue"
          className="w-full"
          disabled={loading}
        >
          {loading ? "İşlem Yapılıyor..." : "Doktoru Yetkilendir"}
        </Button>
      </form>

      {status && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
          {status}
        </div>
      )}
    </Card>
  );
} 