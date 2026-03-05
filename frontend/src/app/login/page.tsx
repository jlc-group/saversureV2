"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--md-surface-dim)]">
      <div className="w-full max-w-[400px] px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-[var(--md-radius-xl)] bg-[var(--md-primary)] mb-4">
            <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
            </svg>
          </div>
          <h1 className="text-[28px] font-normal text-[var(--md-on-surface)] tracking-[-0.5px]">
            Saversure
          </h1>
          <p className="text-[14px] text-[var(--md-on-surface-variant)] mt-1">
            Sign in to Admin Panel
          </p>
        </div>

        {/* Card */}
        <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-xl)] md-elevation-2 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-3 bg-[var(--md-error-light)] text-[var(--md-error)] px-4 py-3 rounded-[var(--md-radius-md)] text-[13px]">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 flex-shrink-0">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                {error}
              </div>
            )}

            {/* Email */}
            <div className="relative">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder=" "
                className="
                  peer w-full px-4 pt-5 pb-2 border border-[var(--md-outline)]
                  rounded-[var(--md-radius-sm)] text-[14px] text-[var(--md-on-surface)]
                  bg-transparent outline-none
                  focus:border-[var(--md-primary)] focus:border-2
                  transition-all duration-200
                "
              />
              <label
                htmlFor="email"
                className="
                  absolute left-4 top-1/2 -translate-y-1/2
                  text-[14px] text-[var(--md-on-surface-variant)]
                  pointer-events-none transition-all duration-200
                  peer-focus:top-3 peer-focus:text-[11px] peer-focus:text-[var(--md-primary)]
                  peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:text-[11px]
                "
              >
                Email
              </label>
            </div>

            {/* Password */}
            <div className="relative">
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder=" "
                className="
                  peer w-full px-4 pt-5 pb-2 border border-[var(--md-outline)]
                  rounded-[var(--md-radius-sm)] text-[14px] text-[var(--md-on-surface)]
                  bg-transparent outline-none
                  focus:border-[var(--md-primary)] focus:border-2
                  transition-all duration-200
                "
              />
              <label
                htmlFor="password"
                className="
                  absolute left-4 top-1/2 -translate-y-1/2
                  text-[14px] text-[var(--md-on-surface-variant)]
                  pointer-events-none transition-all duration-200
                  peer-focus:top-3 peer-focus:text-[11px] peer-focus:text-[var(--md-primary)]
                  peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:text-[11px]
                "
              >
                Password
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full h-[48px] bg-[var(--md-primary)] text-white
                rounded-[var(--md-radius-xl)] text-[14px] font-medium
                tracking-[0.1px]
                hover:bg-[var(--md-primary-dark)] hover:md-elevation-1
                disabled:opacity-60 disabled:cursor-not-allowed
                active:scale-[0.98]
                transition-all duration-200
              "
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-[12px] text-[var(--md-on-surface-variant)] mt-6">
          Saversure QR Management System &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
