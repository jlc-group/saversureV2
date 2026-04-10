"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { api } from "@/lib/api";
import { isLoggedIn, getToken } from "@/lib/auth";
import { getTenantId } from "@/lib/tenant";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:30400";

interface SupportCase {
  id: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  created_at: string;
}

interface Message {
  id: string;
  sender_role: "customer" | "admin";
  message: string;
  image_url: string | null;
  created_at: string;
}

interface UploadConfig {
  max_size_bytes: number;
  allowed_types: string[];
}

const UPLOAD_FALLBACK: UploadConfig = {
  max_size_bytes: 5 * 1024 * 1024,
  allowed_types: ["image/jpeg", "image/png", "image/gif", "image/webp"],
};

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  open:             { label: "เปิด",          color: "text-blue-600",   bg: "bg-blue-50" },
  in_progress:      { label: "กำลังดำเนินการ", color: "text-amber-600",  bg: "bg-amber-50" },
  waiting_customer: { label: "รอลูกค้าตอบ",   color: "text-purple-600", bg: "bg-purple-50" },
  resolved:         { label: "แก้ไขแล้ว",      color: "text-green-600",  bg: "bg-green-50" },
  closed:           { label: "ปิดแล้ว",        color: "text-gray-500",   bg: "bg-gray-100" },
};

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function formatBytes(n: number): string {
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(0)} MB`;
  return `${(n / 1024).toFixed(0)} KB`;
}

export default function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sc, setSc] = useState<SupportCase | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  // Upload
  const [uploadConfig, setUploadConfig] = useState<UploadConfig>(UPLOAD_FALLBACK);
  const [attachedUrl, setAttachedUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchCase = async () => {
    try {
      const data = await api.get<{ case: SupportCase; messages: Message[] }>(
        `/api/v1/support/my-cases/${id}`,
      );
      setSc(data.case);
      setMessages(data.messages || []);
    } catch {
      setError("ไม่พบคำร้องนี้");
    }
  };

  useEffect(() => {
    const li = isLoggedIn();
    setLoggedIn(li);
    if (!li) {
      setLoading(false);
      return;
    }

    Promise.all([
      fetchCase(),
      api
        .get<UploadConfig>("/api/v1/public/upload/config")
        .then((cfg) => {
          if (cfg?.allowed_types) setUploadConfig(cfg);
        })
        .catch(() => {}),
    ]).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadError("");
    if (!uploadConfig.allowed_types.includes(file.type)) {
      setUploadError("ไฟล์ประเภทนี้ไม่รองรับ");
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
      if (!res.ok) throw new Error("อัปโหลดไม่สำเร็จ");
      const data = (await res.json()) as { url: string };
      setAttachedUrl(data.url);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ");
    } finally {
      setUploading(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = reply.trim();
    if (!trimmed && !attachedUrl) return;
    setSending(true);
    setSendError("");
    try {
      await api.post(`/api/v1/support/my-cases/${id}/reply`, {
        message: trimmed,
        image_url: attachedUrl || undefined,
      });
      setReply("");
      setAttachedUrl("");
      setUploadError("");
      await fetchCase();
    } catch (err: unknown) {
      setSendError(err instanceof Error ? err.message : "ส่งไม่สำเร็จ");
    } finally {
      setSending(false);
    }
  };

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <Navbar />
        <div className="pt-24 flex flex-col items-center justify-center px-6 py-20">
          <p className="text-[14px] text-gray-500">กรุณาเข้าสู่ระบบ</p>
          <Link
            href="/login"
            className="mt-4 rounded-full bg-[linear-gradient(135deg,var(--jh-green)_0%,var(--jh-teal)_100%)] px-7 py-2 text-[13px] font-bold text-white"
          >
            เข้าสู่ระบบ
          </Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 flex flex-col">
      <Navbar />

      <div className="pt-24 flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link
              href="/support"
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-600">
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="h-4 bg-gray-100 rounded w-2/3 animate-pulse" />
              ) : sc ? (
                <>
                  <p className="text-[14px] font-bold text-gray-800 truncate">
                    {sc.subject}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${(STATUS_MAP[sc.status] || STATUS_MAP.open).color} ${(STATUS_MAP[sc.status] || STATUS_MAP.open).bg}`}
                    >
                      {(STATUS_MAP[sc.status] || STATUS_MAP.open).label}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {formatDate(sc.created_at)}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-[13px] text-red-500">{error}</p>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-[var(--jh-green)] rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-[13px] text-gray-400">
              {error}
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-[13px] text-gray-400">
              ยังไม่มีข้อความ
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.sender_role === "customer" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
                    m.sender_role === "customer"
                      ? "bg-[linear-gradient(135deg,var(--jh-green)_0%,var(--jh-teal)_100%)] text-white"
                      : "bg-white border border-gray-100 text-gray-800"
                  }`}
                >
                  {m.message && (
                    <p className="text-[13px] whitespace-pre-wrap leading-relaxed">
                      {m.message}
                    </p>
                  )}
                  {m.image_url && (
                    <a
                      href={m.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block mt-2"
                    >
                      <img
                        src={m.image_url}
                        alt=""
                        className="rounded-lg max-w-[200px] max-h-[200px] object-cover"
                      />
                    </a>
                  )}
                  <p
                    className={`text-[10px] mt-1 ${
                      m.sender_role === "customer"
                        ? "text-white/70"
                        : "text-gray-400"
                    }`}
                  >
                    {m.sender_role === "admin" ? "ทีมงาน · " : ""}
                    {formatDate(m.created_at)}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply form */}
        {sc && sc.status !== "closed" && (
          <form
            onSubmit={handleSendReply}
            className="bg-white border-t border-gray-100 px-4 py-3 space-y-2"
          >
            {/* Attached preview */}
            {attachedUrl && (
              <div className="relative inline-block">
                <img
                  src={attachedUrl}
                  alt=""
                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => setAttachedUrl("")}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center"
                >
                  x
                </button>
              </div>
            )}
            {uploadError && (
              <p className="text-[10px] text-red-500">{uploadError}</p>
            )}
            {sendError && (
              <p className="text-[10px] text-red-500">{sendError}</p>
            )}
            <div className="flex gap-2 items-end">
              {/* Attach button */}
              <input
                ref={fileInputRef}
                type="file"
                accept={uploadConfig.allowed_types.join(",")}
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || sending}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 text-gray-500 hover:bg-gray-200 disabled:opacity-50 transition"
              >
                {uploading ? (
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                )}
              </button>
              {/* Text input */}
              <input
                type="text"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="พิมพ์ข้อความ..."
                className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-[13px] text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-[var(--jh-green)] transition"
              />
              {/* Send */}
              <button
                type="submit"
                disabled={sending || uploading || (!reply.trim() && !attachedUrl)}
                className="w-10 h-10 rounded-full bg-[linear-gradient(135deg,var(--jh-green)_0%,var(--jh-teal)_100%)] flex items-center justify-center shrink-0 text-white disabled:opacity-50 transition active:scale-95"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                </svg>
              </button>
            </div>
          </form>
        )}

        {/* Closed status */}
        {sc && sc.status === "closed" && (
          <div className="bg-gray-100 border-t border-gray-200 px-4 py-3 text-center">
            <p className="text-[12px] text-gray-500">คำร้องนี้ปิดแล้ว</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
