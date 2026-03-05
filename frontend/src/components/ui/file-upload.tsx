"use client";

import { useCallback, useState, useRef } from "react";
import { api } from "@/lib/api";

interface FileUploadProps {
  onUpload: (result: Record<string, unknown>) => void;
  endpoint: string;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  buttonText?: string;
  className?: string;
}

export function FileUpload({
  onUpload,
  endpoint,
  accept = ".csv",
  maxSizeMB = 10,
  label = "อัพโหลดไฟล์",
  buttonText = "เลือกไฟล์",
  className = "",
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError("");
      setFileName(file.name);

      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`ไฟล์ต้องไม่เกิน ${maxSizeMB} MB`);
        return;
      }

      try {
        setUploading(true);
        const form = new FormData();
        form.append("file", file);
        const result = await api.uploadForm<Record<string, unknown>>(endpoint, form);
        onUpload(result);
      } catch {
        setError("อัพโหลดล้มเหลว กรุณาลองใหม่");
      } finally {
        setUploading(false);
      }
    },
    [endpoint, maxSizeMB, onUpload]
  );

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={uploading}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "กำลังอัพโหลด..." : buttonText}
        </button>
        {fileName && (
          <span className="text-sm text-gray-500 truncate max-w-[200px]">
            {fileName}
          </span>
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
