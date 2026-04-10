"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { isLoggedIn, getToken } from "@/lib/auth";
import { getTenantId } from "@/lib/tenant";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:30400";

interface UploadConfig {
  max_size_bytes: number;
  allowed_types: string[];
}

const UPLOAD_FALLBACK: UploadConfig = {
  max_size_bytes: 5 * 1024 * 1024,
  allowed_types: ["image/jpeg", "image/png", "image/gif", "image/webp"],
};

interface CategoryOption {
  value: string;
  label: string;
}

const CATEGORY_FALLBACK: CategoryOption[] = [
  { value: "general", label: "ทั่วไป" },
];

function formatBytes(n: number): string {
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(0)} MB`;
  if (n >= 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${n} B`;
}

interface SupportTicketFormProps {
  /** Section heading */
  title?: string;
  /** Subtitle text */
  description?: string;
  /** Submit button label */
  submit_label?: string;
  /** Success message */
  success_text?: string;
  /** Login prompt heading */
  login_title?: string;
  /** Login prompt text */
  login_text?: string;
}

export default function SupportTicketForm({
  title = "แจ้งปัญหาใหม่",
  description = "ส่งตั๋วคำร้องถึงทีมงาน",
  submit_label = "ส่งเรื่องแจ้งปัญหา",
  success_text = "ส่งเรื่องเรียบร้อยแล้ว ทีมงานจะตอบกลับโดยเร็ว",
  login_title = "กรุณาเข้าสู่ระบบ",
  login_text = "เข้าสู่ระบบเพื่อแจ้งปัญหาและติดตามสถานะ",
}: SupportTicketFormProps) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>(CATEGORY_FALLBACK);
  const [uploadConfig, setUploadConfig] = useState<UploadConfig>(UPLOAD_FALLBACK);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("general");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Image upload state
  const [attachedUrl, setAttachedUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoggedIn(isLoggedIn());

    // Fetch categories from API (single source of truth)
    api
      .get<{ data: CategoryOption[] }>("/api/v1/public/support/categories")
      .then((d) => {
        if (d.data?.length) setCategories(d.data);
      })
      .catch(() => {});

    // Fetch upload config from API (no hardcode)
    api
      .get<UploadConfig>("/api/v1/public/upload/config")
      .then((cfg) => {
        if (cfg && Array.isArray(cfg.allowed_types)) setUploadConfig(cfg);
      })
      .catch(() => {});
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadError("");
    if (!uploadConfig.allowed_types.includes(file.type)) {
      setUploadError(
        `รองรับเฉพาะ: ${uploadConfig.allowed_types.map((t) => t.replace("image/", "").toUpperCase()).join(", ")}`,
      );
      return;
    }
    if (file.size > uploadConfig.max_size_bytes) {
      setUploadError(`ไฟล์ใหญ่เกิน ${formatBytes(uploadConfig.max_size_bytes)}`);
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const token = getToken();
      const tenantId = getTenantId();
      const res = await fetch(`${API_BASE}/api/v1/upload/user-image`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(tenantId ? { "X-Tenant-ID": tenantId } : {}),
        },
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          (data as Record<string, string>).error || "อัปโหลดไม่สำเร็จ",
        );
      }
      const data = (await res.json()) as { url: string };
      setAttachedUrl(data.url);
    } catch (err: unknown) {
      setUploadError(
        err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setError("กรุณากรอกหัวข้อและรายละเอียด");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await api.post("/api/v1/support/my-cases", {
        subject: subject.trim(),
        message: message.trim(),
        category,
        image_url: attachedUrl || undefined,
      });
      setSuccess(true);
      setSubject("");
      setMessage("");
      setCategory("general");
      setAttachedUrl("");
      setUploadError("");
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "เกิดข้อผิดพลาด กรุณาลองใหม่";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Not logged in → show login prompt
  if (!loggedIn) {
    return (
      <div className="px-4 relative z-10">
        <div className="bg-white rounded-2xl shadow-sm p-10 flex flex-col items-center">
          <div className="w-14 h-14 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--jh-green)" strokeWidth="1.5" className="w-7 h-7">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h3 className="text-[15px] font-bold text-gray-800">{login_title}</h3>
          <p className="text-[12px] text-gray-400 mt-1 mb-5 text-center">{login_text}</p>
          <Link
            href="/login"
            className="rounded-full bg-[linear-gradient(135deg,var(--jh-green)_0%,var(--jh-teal)_100%)] px-7 py-2 text-[13px] font-bold text-white shadow-md shadow-green-200/50"
          >
            เข้าสู่ระบบ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 relative z-10">
      {/* Section heading */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-[var(--jh-green)]/10 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--jh-green)" strokeWidth="2" className="w-3.5 h-3.5">
            <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
          </svg>
        </div>
        <div>
          <p className="text-[13px] font-bold text-gray-700">{title}</p>
          {description && (
            <p className="text-[11px] text-gray-400">{description}</p>
          )}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border border-gray-100/80 p-4 space-y-3"
      >
        {/* Category */}
        <div>
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1 block">
            หมวดหมู่
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--jh-green)]/30 focus:border-[var(--jh-green)] transition"
          >
            {categories.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Subject */}
        <div>
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1 block">
            หัวข้อ <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="เช่น สแกนแล้วไม่ได้แต้ม"
            maxLength={200}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-[13px] text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--jh-green)]/30 focus:border-[var(--jh-green)] transition"
          />
        </div>

        {/* Message */}
        <div>
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1 block">
            รายละเอียด <span className="text-red-400">*</span>
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="อธิบายปัญหาที่พบ..."
            rows={4}
            maxLength={2000}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-[13px] text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--jh-green)]/30 focus:border-[var(--jh-green)] transition resize-none"
          />
        </div>

        {/* Image upload */}
        <div>
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1 block">
            แนบรูปภาพ (ไม่บังคับ)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept={uploadConfig.allowed_types.join(",")}
            onChange={handleFileChange}
            className="hidden"
          />
          {attachedUrl ? (
            <div className="relative inline-block">
              <img
                src={attachedUrl}
                alt=""
                className="w-24 h-24 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => {
                  setAttachedUrl("");
                  setUploadError("");
                }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[12px] leading-none"
              >
                x
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 py-3 text-[12px] text-gray-400 hover:border-[var(--jh-green)]/40 hover:text-gray-500 transition disabled:opacity-50"
            >
              {uploading ? "กำลังอัปโหลด..." : "📎 เลือกรูปภาพ"}
            </button>
          )}
          {uploadError && (
            <p className="text-[10px] text-red-500 mt-1">{uploadError}</p>
          )}
          <p className="text-[10px] text-gray-400 mt-1">
            รองรับ{" "}
            {uploadConfig.allowed_types
              .map((t) => t.replace("image/", "").toUpperCase())
              .join(", ")}{" "}
            สูงสุด {formatBytes(uploadConfig.max_size_bytes)}
          </p>
        </div>

        {/* Error / Success */}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-[12px] text-red-600">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg bg-green-50 border border-green-100 px-3 py-2 text-[12px] text-green-600">
            {success_text}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || uploading}
          className="w-full rounded-xl bg-[linear-gradient(135deg,var(--jh-green)_0%,var(--jh-teal)_100%)] py-3 text-[14px] font-bold text-white shadow-md shadow-green-200/50 disabled:opacity-50 transition-all active:scale-[0.98]"
        >
          {submitting ? "กำลังส่ง..." : submit_label}
        </button>
      </form>
    </div>
  );
}
