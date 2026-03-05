"use client";

import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import { api } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";

interface ScanResult {
  status: string;
  points_earned?: number;
  campaign_id?: string;
  message: string;
}

export default function ScanPage() {
  const [mode, setMode] = useState<"qr" | "manual">("manual");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");
  const [locationStatus, setLocationStatus] = useState<"idle" | "getting" | "ok" | "denied">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn()) {
      setError("กรุณาเข้าสู่ระบบก่อน");
      return;
    }
    const trimmed = code.trim();
    if (!trimmed) {
      setError("กรุณากรอกรหัส");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    let latitude: number | undefined;
    let longitude: number | undefined;

    try {
      const coords = await new Promise<{ lat: number; lng: number } | null>((resolve) => {
        setLocationStatus("getting");
        if (!navigator.geolocation) {
          setLocationStatus("denied");
          resolve(null);
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setLocationStatus("ok");
            resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          },
          () => {
            setLocationStatus("denied");
            resolve(null);
          },
          { timeout: 5000, enableHighAccuracy: false }
        );
      });

      if (coords) {
        latitude = coords.lat;
        longitude = coords.lng;
      }

      const body: { code?: string; ref1?: string; latitude?: number; longitude?: number } = {
        code: trimmed,
        ref1: trimmed,
      };
      if (latitude != null) body.latitude = latitude;
      if (longitude != null) body.longitude = longitude;

      const data = await api.post<ScanResult>("/api/v1/scan", body);
      setResult(data);
      setCode("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "สแกนไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-20">
      <div className="bg-gradient-to-br from-[var(--primary)] to-[#1557b0] text-white px-5 pt-12 pb-6 rounded-b-[24px]">
        <h1 className="text-[22px] font-semibold">Scan QR Code</h1>
        <p className="text-[13px] opacity-80 mt-1">Scan or enter code to earn points</p>
      </div>

      <div className="px-5 mt-6">
        {/* Mode toggle */}
        <div className="flex bg-[var(--surface-container)] rounded-[var(--radius-xl)] p-1 mb-6">
          <button
            onClick={() => setMode("qr")}
            className={`flex-1 h-[36px] rounded-[var(--radius-xl)] text-[13px] font-medium transition-all ${
              mode === "qr" ? "bg-white elevation-1 text-[var(--primary)]" : "text-[var(--on-surface-variant)]"
            }`}
          >
            สแกน QR
          </button>
          <button
            onClick={() => setMode("manual")}
            className={`flex-1 h-[36px] rounded-[var(--radius-xl)] text-[13px] font-medium transition-all ${
              mode === "manual" ? "bg-white elevation-1 text-[var(--primary)]" : "text-[var(--on-surface-variant)]"
            }`}
          >
            กรอกรหัส
          </button>
        </div>

        {mode === "qr" ? (
          <div className="bg-white rounded-[var(--radius-lg)] elevation-1 p-8 text-center">
            <div className="w-48 h-48 mx-auto bg-[var(--surface-container)] rounded-[var(--radius-lg)] flex items-center justify-center mb-4">
              <svg viewBox="0 0 24 24" fill="var(--on-surface-variant)" className="w-16 h-16 opacity-30">
                <path d="M9.5 6.5v3h-3v-3h3M11 5H5v6h6V5zm-1.5 9.5v3h-3v-3h3M11 13H5v6h6v-6zm6.5-6.5v3h-3v-3h3M19 5h-6v6h6V5z" />
              </svg>
            </div>
            <p className="text-[14px] text-[var(--on-surface-variant)]">
              สแกนด้วยกล้องต้องใช้ LINE LIFF หรือ Native API
            </p>
            <p className="text-[12px] text-[var(--on-surface-variant)] mt-1 opacity-70">
              เร็วๆ นี้ — ใช้ &quot;กรอกรหัส&quot; ก่อน
            </p>
            <a
              href="#"
              className="mt-4 inline-block text-[13px] text-[var(--primary)] font-medium underline"
              onClick={(e) => {
                e.preventDefault();
                setMode("manual");
              }}
            >
              ไปที่กรอกรหัสด้วยตนเอง
            </a>
          </div>
        ) : (
          <div className="bg-white rounded-[var(--radius-lg)] elevation-1 p-5">
            <form onSubmit={handleSubmit}>
              <label className="block text-[12px] font-medium text-[var(--on-surface-variant)] mb-2 uppercase tracking-wider">
                รหัส QR หรือ Ref1
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. A1B2C3D4E5"
                className="w-full h-[52px] px-4 border-2 border-[var(--outline)] rounded-[var(--radius-md)] text-[16px] font-mono text-center tracking-[2px] outline-none focus:border-[var(--primary)] transition-colors"
                required
                autoFocus
              />
              {locationStatus === "getting" && (
                <p className="text-[12px] text-[var(--on-surface-variant)] mt-2">กำลังขอตำแหน่ง...</p>
              )}
              <button
                type="submit"
                disabled={loading || !code.trim()}
                className="w-full h-[48px] mt-4 bg-[var(--primary)] text-white rounded-[var(--radius-xl)] text-[15px] font-medium disabled:opacity-50 active:scale-[0.98] transition-all"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    กำลังสแกน...
                  </span>
                ) : (
                  "สแกน"
                )}
              </button>
            </form>
            <p className="text-[12px] text-[var(--on-surface-variant)] mt-3 text-center">
              <button
                type="button"
                onClick={() => setMode("qr")}
                className="text-[var(--primary)] underline"
              >
                สแกนด้วยกล้อง (เร็วๆ นี้)
              </button>
            </p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="mt-4 bg-[var(--success-light)] border border-[var(--success)] rounded-[var(--radius-lg)] p-5 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-[var(--success)] flex items-center justify-center mb-3">
              <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
            {result.points_earned != null && result.points_earned > 0 && (
              <p className="text-[18px] font-semibold text-[var(--success)]">+{result.points_earned} คะแนน!</p>
            )}
            <p className="text-[13px] text-[var(--on-surface-variant)] mt-1">{result.message}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 bg-[var(--error-light)] border border-[var(--error)] rounded-[var(--radius-lg)] p-4 text-center">
            <p className="text-[14px] font-medium text-[var(--error)]">{error}</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
