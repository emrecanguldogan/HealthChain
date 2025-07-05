"use client";

import React, { useState, FormEvent } from "react";
import { useDevnetWallet } from "@/lib/devnet-wallet-context";
import { authorizeDoctor, checkHasAccessToken } from "@/lib/healthchain/operations";
import { useNetwork } from "@/lib/use-network";

export default function GrantAccessForm() {
  const { currentWallet } = useDevnetWallet();
  const network = useNetwork();
  const [doctor, setDoctor] = useState("");
  const [permissions, setPermissions] = useState<string[]>(["read"]);
  const [status, setStatus] = useState<null | string>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    
    if (!doctor.trim()) {
      setStatus("Doktor adresi giriniz.");
      setLoading(false);
      return;
    }

    if (!currentWallet) {
      setStatus("Lütfen cüzdanınızı bağlayın.");
      setLoading(false);
      return;
    }

    try {
      // Önce kullanıcının access token'ı olup olmadığını kontrol et
      const hasToken = await checkHasAccessToken(currentWallet.stxAddress, network);
      if (!hasToken) {
        setStatus("❌ Önce bir erişim token'ı (NFT) oluşturmanız gerekiyor.");
        setLoading(false);
        return;
      }

      // Tüm cüzdanlar için blockchain işlemi
      setStatus("Hiro Wallet ile doktor yetkilendirin...");
      
      await authorizeDoctor(doctor, permissions, network);
      setStatus("✅ Doktor yetkilendirildi! İşlem blockchain'e gönderildi.");
    } catch (err) {
      console.error('Error:', err);
      setStatus("❌ Doktor yetkilendirilirken hata oluştu: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded p-6 shadow mb-6">
      <h2 className="text-xl font-bold mb-2 text-emerald-600">Doktor Yetkilendir</h2>
      
      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
        <p className="text-sm text-green-700">
          <strong>🔗 Blockchain İşlemi:</strong> Hiro Wallet ile gerçek işlem yapılacak.
        </p>
      </div>
      
      <input
        className="w-full border rounded p-2 mb-2"
        type="text"
        placeholder="Doktorun Stacks adresi"
        value={doctor}
        onChange={e => setDoctor(e.target.value)}
        required
        disabled={loading}
      />
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          İzinler:
        </label>
        <div className="space-y-2">
          {["read", "write", "delete"].map((permission) => (
            <label key={permission} className="flex items-center">
              <input
                type="checkbox"
                checked={permissions.includes(permission)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setPermissions([...permissions, permission]);
                  } else {
                    setPermissions(permissions.filter(p => p !== permission));
                  }
                }}
                className="mr-2"
                disabled={loading}
              />
              <span className="text-sm">{permission}</span>
            </label>
          ))}
        </div>
      </div>
      
      <button
        type="submit"
        className={`bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={loading}
      >
        {loading ? 'İşleniyor...' : 'Doktor Yetkilendir'}
      </button>
      {status && <div className="mt-2 text-sm">{status}</div>}
    </form>
  );
} 