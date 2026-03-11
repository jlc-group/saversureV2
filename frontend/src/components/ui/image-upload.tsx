"use client";

import { useCallback, useState, useRef } from "react";
import { api } from "@/lib/api";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  endpoint?: string;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  className?: string;
  showUrlInput?: boolean;
  compact?: boolean;
  showAiGenerate?: boolean;
}

const MEDIA_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:30400";

function resolvePreviewUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${MEDIA_BASE}/media/${url}`;
}

export function ImageUpload({
  value,
  onChange,
  endpoint = "/api/v1/upload/image",
  accept = "image/jpeg,image/png,image/webp,image/gif",
  maxSizeMB = 5,
  label = "รูปภาพ",
  className = "",
  showUrlInput = true,
  compact = false,
  showAiGenerate = true,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const previewSrc = value ? resolvePreviewUrl(value) : "";

  const handleFile = useCallback(
    async (file: File) => {
      setError("");

      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`ไฟล์ต้องไม่เกิน ${maxSizeMB} MB`);
        return;
      }

      const allowed = accept.split(",").map((t) => t.trim());
      if (!allowed.includes(file.type)) {
        setError("ประเภทไฟล์ไม่รองรับ");
        return;
      }

      try {
        setUploading(true);
        const result = await api.upload(endpoint, file);
        onChange(result.url);
      } catch {
        setError("อัพโหลดล้มเหลว กรุณาลองใหม่");
      } finally {
        setUploading(false);
      }
    },
    [endpoint, maxSizeMB, accept, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setAiError("");
    setAiGenerating(true);
    try {
      const result = await api.post<{ url: string }>(
        "/api/v1/upload/ai-generate",
        { prompt: aiPrompt.trim() }
      );
      onChange(result.url);
      setShowAiModal(false);
      setAiPrompt("");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "AI สร้างรูปไม่สำเร็จ";
      setAiError(msg);
    } finally {
      setAiGenerating(false);
    }
  };

  const dropH = compact ? "py-4" : "py-8";

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div
        className={`
          relative border-2 border-dashed rounded-xl transition-colors cursor-pointer
          ${dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}
          ${uploading ? "pointer-events-none opacity-60" : ""}
        `}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        {previewSrc ? (
          <div className="relative p-3">
            <img
              src={previewSrc}
              alt="Preview"
              className={`mx-auto rounded-lg object-contain ${compact ? "max-h-28" : "max-h-48"}`}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <button
              type="button"
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 shadow"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
            >
              ✕
            </button>
          </div>
        ) : (
          <div className={`flex flex-col items-center ${dropH} px-4 text-gray-500`}>
            <svg
              className={`${compact ? "w-7 h-7 mb-1" : "w-10 h-10 mb-2"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm font-medium">
              {uploading ? "กำลังอัพโหลด..." : "คลิกหรือลากไฟล์มาวาง"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              สูงสุด {maxSizeMB} MB ({accept.replace(/image\//g, "").toUpperCase()})
            </p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      {/* Action buttons row */}
      <div className="flex items-center gap-3 flex-wrap">
        {showAiGenerate && (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors"
            onClick={() => setShowAiModal(true)}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" />
            </svg>
            AI สร้างรูป
          </button>
        )}

        {showUrlInput && (
          <button
            type="button"
            className="text-xs text-blue-600 hover:underline"
            onClick={() => setShowUrl(!showUrl)}
          >
            {showUrl ? "ซ่อนช่อง URL" : "หรือวาง URL"}
          </button>
        )}
      </div>

      {showUrl && showUrlInput && (
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          onClick={(e) => e.stopPropagation()}
        />
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* AI Generate Modal */}
      {showAiModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => !aiGenerating && setShowAiModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                    <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">AI สร้างรูปภาพ</h3>
                  <p className="text-white/70 text-xs">Powered by Gemini</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  อธิบายรูปที่ต้องการ
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="เช่น: แบนเนอร์โปรโมชั่นสินค้าสกินแคร์ สีเขียวธรรมชาติ มีดอกไม้ประดับ..."
                  rows={3}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none resize-none transition-all"
                  disabled={aiGenerating}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAiGenerate();
                    }
                  }}
                />
              </div>

              {/* Suggestion chips */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  "แบนเนอร์โปรโมชั่น",
                  "รูปสินค้า skincare",
                  "ไอคอนรางวัล",
                  "พื้นหลัง gradient",
                ].map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="text-[11px] px-2.5 py-1 rounded-full border border-purple-200 text-purple-600 hover:bg-purple-50 transition-colors"
                    onClick={() => setAiPrompt(s)}
                    disabled={aiGenerating}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {aiError && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3">
                  <p className="text-sm text-red-600">{aiError}</p>
                </div>
              )}

              {aiGenerating && (
                <div className="flex flex-col items-center py-4">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-4 border-purple-200" />
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-600 animate-spin" />
                  </div>
                  <p className="text-sm text-gray-500 mt-3">
                    AI กำลังสร้างรูปภาพ...
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    อาจใช้เวลาสักครู่
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                type="button"
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                onClick={() => setShowAiModal(false)}
                disabled={aiGenerating}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-sm font-bold text-white hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 active:scale-[0.98]"
                onClick={handleAiGenerate}
                disabled={aiGenerating || !aiPrompt.trim()}
              >
                {aiGenerating ? "กำลังสร้าง..." : "สร้างรูป"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
