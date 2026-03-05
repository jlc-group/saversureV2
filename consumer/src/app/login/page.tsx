"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { setToken } from "@/lib/auth";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "register") {
        await api.post("/api/v1/auth/register", {
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          phone,
        });
      }
      const data = await api.post<{ access_token: string }>("/api/v1/auth/login", { email, password });
      setToken(data.access_token);
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full h-[48px] px-4 border border-[var(--outline)] rounded-[var(--radius-md)] text-[14px] text-[var(--on-surface)] bg-transparent outline-none focus:border-[var(--primary)] focus:border-2 transition-all";

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 bg-[var(--surface-dim)]">
      <div className="text-center mb-8">
        <div className="w-14 h-14 mx-auto rounded-[var(--radius-lg)] bg-[var(--primary)] flex items-center justify-center mb-4">
          <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
          </svg>
        </div>
        <h1 className="text-[22px] font-semibold text-[var(--on-surface)]">Saversure</h1>
        <p className="text-[13px] text-[var(--on-surface-variant)] mt-1">Scan & Earn Rewards</p>
      </div>

      {/* Mode toggle */}
      <div className="flex bg-[var(--surface-container)] rounded-[var(--radius-xl)] p-1 mb-6">
        <button
          onClick={() => setMode("login")}
          className={`flex-1 h-[36px] rounded-[var(--radius-xl)] text-[13px] font-medium transition-all ${
            mode === "login" ? "bg-white elevation-1 text-[var(--primary)]" : "text-[var(--on-surface-variant)]"
          }`}
        >
          Login
        </button>
        <button
          onClick={() => setMode("register")}
          className={`flex-1 h-[36px] rounded-[var(--radius-xl)] text-[13px] font-medium transition-all ${
            mode === "register" ? "bg-white elevation-1 text-[var(--primary)]" : "text-[var(--on-surface-variant)]"
          }`}
        >
          Register
        </button>
      </div>

      <div className="bg-white rounded-[var(--radius-lg)] elevation-2 p-6">
        {error && (
          <div className="mb-4 p-3 bg-[var(--error-light)] rounded-[var(--radius-sm)] text-[13px] text-[var(--error)]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <>
              <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} />
              <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} />
              <input type="tel" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
            </>
          )}
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} required minLength={6} />
          <button
            type="submit"
            disabled={loading}
            className="w-full h-[48px] bg-[var(--primary)] text-white rounded-[var(--radius-xl)] text-[15px] font-medium disabled:opacity-50 active:scale-[0.98] transition-all"
          >
            {loading ? "..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>
      </div>

      <div className="flex justify-center gap-4 mt-4">
        <Link href="/otp" className="text-[13px] text-[var(--primary)]">
          ยืนยันหมายเลขโทรศัพท์ด้วย OTP
        </Link>
        <Link href="/register" className="text-[13px] text-[var(--primary)]">
          ลงทะเบียนสมาชิกใหม่
        </Link>
      </div>
      <p className="text-center text-[11px] text-[var(--on-surface-variant)] mt-6 opacity-60">
        Powered by Saversure v2.0
      </p>
    </div>
  );
}
