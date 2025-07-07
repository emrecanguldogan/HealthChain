"use client";

import React, { useState, FormEvent } from "react";
import { 
  checkHasAccessToken,
  saveHealthRecordToDatabase
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

const Textarea = ({ value, onChange, placeholder, className = "" }: any) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={4}
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
  />
);

export default function RecordUploadForm() {
  const stxAddress = useCurrentAddress();
  const network = useNetwork();
  const [recordData, setRecordData] = useState({
    title: "",
    description: "",
    recordType: "",
    date: "",
    doctor: "",
    notes: ""
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stxAddress) {
      setStatus("Cüzdan bağlanmalı!");
      return;
    }

    setLoading(true);
    setStatus("Kayıt yükleniyor...");

    try {
      // Önce kullanıcının access token'ı olup olmadığını kontrol et
      const hasToken = await checkHasAccessToken(stxAddress, network);
      if (!hasToken) {
        setStatus("❌ Önce bir erişim token'ı oluşturmanız gerekiyor.");
        setLoading(false);
        return;
      }

      // Veritabanına kayıt yükleme işlemi
      setStatus("Veritabanına kayıt yükleniyor...");
      
      const recordId = await saveHealthRecordToDatabase({
        patientWalletAddress: stxAddress,
        doctorWalletAddress: recordData.doctor, // Doktor adresi olarak kullanıyoruz
        recordType: recordData.recordType,
        description: `${recordData.title} - ${recordData.description}`,
        data: JSON.stringify({
          title: recordData.title,
          description: recordData.description,
          recordType: recordData.recordType,
          date: recordData.date,
          doctor: recordData.doctor,
          notes: recordData.notes
        })
      });
      
      setStatus(`✅ Sağlık kaydı veritabanına başarıyla yüklendi! Kayıt ID: ${recordId}`);
      
      // Formu temizle
      setRecordData({
        title: "",
        description: "",
        recordType: "",
        date: "",
        doctor: "",
        notes: ""
      });
    } catch (error) {
      console.error('Record upload error:', error);
      setStatus("❌ Kayıt yüklenirken hata oluştu: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setRecordData(prev => ({ ...prev, [field]: value }));
  };

  if (!stxAddress) {
    return (
      <Card>
        <h3 className="text-lg font-semibold text-blue-600 mb-4">
          📤 Sağlık Kaydı Yükle
        </h3>
        <p className="text-gray-600">Lütfen önce cüzdanınızı bağlayın.</p>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold text-blue-600 mb-4">
        📤 Sağlık Kaydı Yükle
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Kayıt Başlığı</label>
            <Input
              value={recordData.title}
              onChange={(e: any) => handleInputChange("title", e.target.value)}
              placeholder="Kontrol, Tedavi, Test sonucu..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Kayıt Türü</label>
            <Input
              value={recordData.recordType}
              onChange={(e: any) => handleInputChange("recordType", e.target.value)}
              placeholder="Muayene, Laboratuvar, Radyoloji..."
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tarih</label>
            <Input
              type="date"
              value={recordData.date}
              onChange={(e: any) => handleInputChange("date", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Doktor</label>
            <Input
              value={recordData.doctor}
              onChange={(e: any) => handleInputChange("doctor", e.target.value)}
              placeholder="Dr. Ad Soyad"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Açıklama</label>
          <Textarea
            value={recordData.description}
            onChange={(e: any) => handleInputChange("description", e.target.value)}
            placeholder="Kayıt detayları..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notlar</label>
          <Textarea
            value={recordData.notes}
            onChange={(e: any) => handleInputChange("notes", e.target.value)}
            placeholder="Ek notlar..."
          />
        </div>

        <Button
          type="submit"
          colorScheme="blue"
          className="w-full"
          disabled={loading}
        >
          {loading ? "Yükleniyor..." : "Veritabanına Yükle"}
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