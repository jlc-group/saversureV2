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
}

export function ImageUpload({
  value,
  onChange,
  endpoint = "/api/v1/upload/image",
  accept = "image/jpeg,image/png,image/webp",
  maxSizeMB = 5,
  label = "อัพโหลดรูปภาพ",
  className = "",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
        {value ? (
          <div className="relative p-3">
            <img
              src={value}
              alt="Preview"
              className="mx-auto max-h-48 rounded-lg object-contain"
            />
            <button
              type="button"
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center py-8 px-4 text-gray-500">
            <svg
              className="w-10 h-10 mb-2"
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

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
