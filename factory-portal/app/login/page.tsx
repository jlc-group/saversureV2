"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:30400";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenant_id: "00000000-0000-0000-0000-000000000001", email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        return;
      }

      // Verify this is a factory_user account
      const payload = JSON.parse(atob(data.access_token.split(".")[1]));
      if (payload.role !== "factory_user") {
        setError("บัญชีนี้ไม่ใช่บัญชีโรงงาน กรุณาใช้ระบบ Admin แทน");
        return;
      }

      localStorage.setItem("factory_token", data.access_token);
      localStorage.setItem("factory_refresh_token", data.refresh_token);
      router.replace("/dashboard");
    } catch {
      setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--md-surface-dim)] px-4">
      <div className="w-full max-w-[400px]">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-[var(--md-radius-lg)] bg-[var(--md-primary)] flex items-center justify-center mx-auto mb-4 md-elevation-2">
            <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8">
              <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
            </svg>
          </div>
          <h1 className="text-[24px] font-semibold text-[var(--md-on-surface)]">Factory Portal</h1>
          <p className="text-[14px] text-[var(--md-on-surface-variant)] mt-1">ระบบจัดการม้วนสติ๊กเกอร์ QR Code</p>
        </div>

        {/* Login Card */}
        <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-xl)] md-elevation-2 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-[var(--md-on-surface-variant)] mb-1.5">
                อีเมล
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="factory@example.com"
                required
                className="w-full h-[52px] px-4 border border-[var(--md-outline)] rounded-[var(--md-radius-sm)] text-[15px] text-[var(--md-on-surface)] bg-transparent outline-none focus:border-[var(--md-primary)] focus:border-2 transition-all"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[var(--md-on-surface-variant)] mb-1.5">
                รหัสผ่าน
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full h-[52px] px-4 border border-[var(--md-outline)] rounded-[var(--md-radius-sm)] text-[15px] text-[var(--md-on-surface)] bg-transparent outline-none focus:border-[var(--md-primary)] focus:border-2 transition-all"
              />
            </div>

            {error && (
              <div className="p-3 rounded-[var(--md-radius-sm)] bg-[var(--md-error-light)] text-[var(--md-error)] text-[13px]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[52px] bg-[var(--md-primary)] text-white rounded-[var(--md-radius-xl)] text-[15px] font-semibold hover:opacity-90 disabled:opacity-60 transition-all mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  กำลังเข้าสู่ระบบ...
                </span>
              ) : (
                "เข้าสู่ระบบ"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[12px] text-[var(--md-on-surface-variant)] mt-6">
          ระบบนี้สำหรับโรงงานแปะสติ๊กเกอร์เท่านั้น
        </p>
      </div>
    </div>
  );
}
