"use client";

import React, { useState, useEffect } from "react";
import { 
  checkUserAccess, 
  getPatientProfileByWallet,
  checkDoctorAuthorizationInDatabase,
  getPatientRecordsFromDatabase
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

export default function ViewRecord() {
  const stxAddress = useCurrentAddress();
  const network = useNetwork();
  const [patientAddress, setPatientAddress] = useState("");
  const [record, setRecord] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [patientProfile, setPatientProfile] = useState<any | null>(null);

  const handleViewRecord = async () => {
    if (!stxAddress) {
      setStatus("Cüzdan bağlanmalı!");
      return;
    }

    if (!patientAddress.trim()) {
      setStatus("Hasta adresi gerekli!");
      return;
    }

    setLoading(true);
    setStatus("Erişim kontrol ediliyor...");

    try {
      // Blockchain'den erişim kontrolü
      const access = await checkUserAccess(patientAddress, stxAddress, network);
      setHasAccess(access);

      if (access) {
        // Hasta profilini al
        const profile = await getPatientProfileByWallet(patientAddress);
        setPatientProfile(profile);

        // Veritabanından erişim kontrolü
        const dbAccess = await checkDoctorAuthorizationInDatabase(patientAddress, stxAddress);
        
        if (dbAccess) {
          // Sağlık kayıtlarını veritabanından al
          setStatus("Sağlık kayıtları veritabanından alınıyor...");
          
          const records = await getPatientRecordsFromDatabase(patientAddress);
          
          const recordsData = {
            patientAddress: patientAddress,
            patientName: profile?.name || "Bilinmeyen",
            recordCount: records.length,
            records: records.map((record: any) => ({
              id: record.id,
              type: record.recordType,
              description: record.description,
              createdAt: record.createdAt,
              data: JSON.parse(record.data || '{}')
            })),
            accessGrantedBy: stxAddress,
            network: network
          };

          setRecord(JSON.stringify(recordsData, null, 2));
          setStatus(`✅ ${records.length} adet sağlık kaydı başarıyla alındı!`);
        } else {
          setStatus("❌ Veritabanında bu hasta için erişim yetkiniz bulunmuyor!");
          setRecord("");
          setPatientProfile(null);
        }
      } else {
        setStatus("❌ Blockchain'de bu hasta için erişim yetkiniz bulunmuyor!");
        setRecord("");
        setPatientProfile(null);
      }
    } catch (error) {
      console.error('Error viewing record:', error);
      setStatus("❌ Kayıt görüntülenirken hata oluştu: " + (error as Error).message);
      setRecord("");
      setPatientProfile(null);
    } finally {
      setLoading(false);
    }
  };

  if (!stxAddress) {
    return (
      <Card>
        <h3 className="text-lg font-semibold text-blue-600 mb-4">
          📋 Hasta Kayıtlarını Görüntüle
        </h3>
        <p className="text-gray-600">Lütfen önce cüzdanınızı bağlayın.</p>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold text-blue-600 mb-4">
        📋 Hasta Kayıtlarını Görüntüle
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Hasta Adresi</label>
          <Input
            value={patientAddress}
            onChange={(e: any) => setPatientAddress(e.target.value)}
            placeholder="ST1M2X1WBC60W09W91W4ESDRHM94H75VGXGDNCQE8"
          />
          <p className="text-xs text-gray-500 mt-1">
            Görüntülemek istediğiniz hastanın Stacks cüzdan adresini girin
          </p>
        </div>

        <Button
          onClick={handleViewRecord}
          colorScheme="blue"
          className="w-full"
          disabled={loading}
        >
          {loading ? "Kontrol Ediliyor..." : "Kayıtları Görüntüle"}
        </Button>

        {/* Erişim Durumu */}
        {hasAccess !== null && (
          <div className={`p-3 rounded text-sm ${
            hasAccess ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {hasAccess ? (
              <div className="flex items-center space-x-2">
                <span>✅</span>
                <span>Bu hasta için erişim yetkiniz bulunuyor</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span>❌</span>
                <span>Bu hasta için erişim yetkiniz bulunmuyor</span>
              </div>
            )}
          </div>
        )}

        {/* Hasta Profil Bilgisi */}
        {patientProfile && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
            <strong>Hasta Bilgileri:</strong>
            <div>Ad: {patientProfile.name || 'Belirtilmemiş'}</div>
            <div>Rol: {patientProfile.role || 'Hasta'}</div>
            <div>Adres: {patientAddress}</div>
          </div>
        )}

        {/* Sağlık Kayıtları */}
        {record && (
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-700">Sağlık Kayıtları:</h4>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
              {record}
            </pre>
          </div>
        )}

        {/* Durum Mesajı */}
        {status && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
            {status}
          </div>
        )}
      </div>
    </Card>
  );
} 