"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

const inputClass =
  "w-full h-[48px] px-4 border border-[var(--outline)] rounded-[var(--radius-md)] text-[14px] text-[var(--on-surface)] bg-transparent outline-none focus:border-[var(--primary)] focus:border-2 transition-all";

export default function OTPPage() {
  const [phone, setPhone] = useState("");
  const [otpId, setOtpId] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState<"phone" | "verify">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await api.post<{ otp_id: string; ref_code: string; expires_in: number }>(
        "/api/v1/otp/request",
        { phone }
      );
      setOtpId(data.otp_id);
      setStep("verify");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/api/v1/otp/verify", { otp_id: otpId, otp_code: otpCode });
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col justify-center px-6 bg-[var(--surface-dim)]">
        <div className="bg-white rounded-[var(--radius-lg)] elevation-2 p-6 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-[var(--success-light)] flex items-center justify-center mb-4">
            <svg viewBox="0 0 24 24" fill="var(--success)" className="w-7 h-7">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </div>
          <h2 className="text-[18px] font-semibold text-[var(--on-surface)]">ยืนยันสำเร็จ</h2>
          <p className="text-[14px] text-[var(--on-surface-variant)] mt-2">หมายเลขโทรศัพท์ได้รับการยืนยันแล้ว</p>
          <Link
            href="/login"
            className="mt-6 inline-block w-full h-[44px] bg-[var(--primary)] text-white rounded-[var(--radius-xl)] text-[15px] font-medium flex items-center justify-center"
          >
            ไปหน้า Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 bg-[var(--surface-dim)]">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-[var(--on-surface-variant)] text-[14px] mb-4">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
          กลับ
        </Link>
        <h1 className="text-[22px] font-semibold text-[var(--on-surface)]">ยืนยันหมายเลขโทรศัพท์</h1>
        <p className="text-[13px] text-[var(--on-surface-variant)] mt-1">
          {step === "phone" ? "กรอกเบอร์โทรศัพท์เพื่อรับรหัส OTP" : "กรอกรหัส OTP ที่ได้รับทาง SMS"}
        </p>
      </div>

      <div className="bg-white rounded-[var(--radius-lg)] elevation-2 p-6">
        {error && (
          <div className="mb-4 p-3 bg-[var(--error-light)] rounded-[var(--radius-sm)] text-[13px] text-[var(--error)]">
            {error}
          </div>
        )}

        {step === "phone" ? (
          <form onSubmit={handleRequestOTP} className="space-y-4">
            <input
              type="tel"
              placeholder="เบอร์โทรศัพท์ (เช่น 0812345678)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[48px] bg-[var(--primary)] text-white rounded-[var(--radius-xl)] text-[15px] font-medium disabled:opacity-50 active:scale-[0.98] transition-all"
            >
              {loading ? "กำลังส่ง..." : "ส่งรหัส OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <p className="text-[13px] text-[var(--on-surface-variant)]">
              ส่งรหัสไปที่ <strong>{phone}</strong>
            </p>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="รหัส 6 หลัก"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
              className={`${inputClass} text-center text-[20px] tracking-[0.5em]`}
              required
            />
            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className="w-full h-[48px] bg-[var(--primary)] text-white rounded-[var(--radius-xl)] text-[15px] font-medium disabled:opacity-50 active:scale-[0.98] transition-all"
            >
              {loading ? "กำลังตรวจสอบ..." : "ยืนยันรหัส"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setOtpCode("");
                setOtpId("");
              }}
              className="w-full h-[40px] text-[var(--on-surface-variant)] text-[14px]"
            >
              เปลี่ยนเบอร์โทรศัพท์
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
