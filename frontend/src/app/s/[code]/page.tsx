"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

function getApiBase() {
  if (typeof window === "undefined") return "http://localhost:30400";
  const host = window.location.hostname;
  return `http://${host}:30400`;
}


interface ScanResult {
  status: string;
  points_earned: number;
  bonus_points: number;
  total_points: number;
  bonus_currency?: string;
  bonus_currency_amount?: number;
  campaign_id: string;
  message: string;
}

export default function ScanPage() {
  const params = useParams();
  const code = params.code as string;

  const [phase, setPhase] = useState<"ready" | "login" | "scanning" | "success" | "error">("ready");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [phone, setPhone] = useState("");
  const [registering, setRegistering] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("consumer_token") : null;

  useEffect(() => {
    if (token) {
      doScan(token);
    }
  }, []);

  const doScan = async (authToken: string) => {
    setPhase("scanning");
    try {
      const res = await fetch(`${getApiBase()}/api/v1/scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPhase("error");
        setErrorMsg(data.message || "Scan failed");
        return;
      }
      setResult(data as ScanResult);
      setPhase("success");
    } catch {
      setPhase("error");
      setErrorMsg("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    }
  };

  const handleQuickRegister = async () => {
    if (!phone || phone.length < 10) return;
    setRegistering(true);
    try {
      const res = await fetch(`${getApiBase()}/api/v1/auth/register-consumer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.message?.includes("already exists")) {
          const loginRes = await fetch(`${getApiBase()}/api/v1/auth/login-phone`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone }),
          });
          const loginData = await loginRes.json();
          if (!loginRes.ok) {
            setErrorMsg(loginData.message || "Login failed");
            setPhase("error");
            return;
          }
          localStorage.setItem("consumer_token", loginData.access_token);
          doScan(loginData.access_token);
          return;
        }
        setErrorMsg(data.message || "Registration failed");
        setPhase("error");
        return;
      }
      localStorage.setItem("consumer_token", data.access_token);
      doScan(data.access_token);
    } catch {
      setErrorMsg("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
      setPhase("error");
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-blue-600">
                <path d="M3 11h2V9H3v2zm0 4h2v-2H3v2zm0-8h2V5H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 5v2h14V5H7z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Saversure</h1>
            <p className="text-sm text-gray-500 mt-1">สแกน QR Code เพื่อสะสมแต้ม</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 mb-5 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Code</p>
            <p className="font-mono text-sm text-gray-800 break-all mt-1">{code}</p>
          </div>

          {phase === "ready" && !token && (
            <div>
              <p className="text-sm text-gray-600 mb-4 text-center">กรอกเบอร์โทรเพื่อสะสมแต้ม</p>
              <input
                type="tel"
                placeholder="เบอร์โทรศัพท์ เช่น 0812345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                maxLength={10}
                className="w-full h-12 px-4 border border-gray-300 rounded-xl text-center text-lg tracking-widest focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              />
              <button
                onClick={handleQuickRegister}
                disabled={phone.length < 10 || registering}
                className="w-full h-12 mt-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {registering ? "กำลังดำเนินการ..." : "สแกนรับแต้ม"}
              </button>
            </div>
          )}

          {phase === "scanning" && (
            <div className="text-center py-8">
              <svg className="animate-spin w-8 h-8 text-blue-600 mx-auto mb-3" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-gray-600">กำลังตรวจสอบ QR Code...</p>
            </div>
          )}

          {phase === "success" && result && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-green-600">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-green-700">สแกนสำเร็จ!</h2>
              <div className="mt-4 bg-green-50 rounded-xl p-4">
                <p className="text-3xl font-bold text-green-700">{result.total_points}</p>
                <p className="text-sm text-green-600 mt-1">แต้มที่ได้รับ</p>
                {result.bonus_points > 0 && (
                  <p className="text-xs text-green-500 mt-2">
                    (แต้มปกติ {result.points_earned} + โบนัส {result.bonus_points})
                  </p>
                )}
                {result.bonus_currency_amount && result.bonus_currency_amount > 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    + {result.bonus_currency_amount} {result.bonus_currency}
                  </p>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-4">{result.message}</p>
            </div>
          )}

          {phase === "error" && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-red-600">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-red-700">ไม่สำเร็จ</h2>
              <p className="text-sm text-red-600 mt-2">{errorMsg}</p>
              <button
                onClick={() => { setPhase("ready"); setErrorMsg(""); }}
                className="mt-4 h-10 px-6 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 text-sm font-medium transition"
              >
                ลองใหม่
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Powered by Saversure V2 — Dev Testing
        </p>
      </div>
    </div>
  );
}
