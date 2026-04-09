"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const QRCodeSVG = dynamic(() => import("qrcode.react").then((m) => m.QRCodeSVG), { ssr: false });
const Barcode = dynamic(() => import("react-barcode"), { ssr: false });

type Mode = "qr" | "barcode" | "code";

interface CouponSheetProps {
  couponCode: string;
  rewardName: string;
  onClose: () => void;
}

export default function CouponSheet({ couponCode, rewardName, onClose }: CouponSheetProps) {
  const [mode, setMode] = useState<Mode>("qr");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const MODES: { key: Mode; label: string }[] = [
    { key: "qr", label: "QR Code" },
    { key: "barcode", label: "บาร์โค้ด" },
    { key: "code", label: "รหัส" },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9000] bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Popup — centered, compact */}
      <div className="fixed inset-0 z-[9001] flex items-center justify-center px-5 pointer-events-none">
        <div className="w-full max-w-[340px] bg-white rounded-3xl shadow-2xl pointer-events-auto animate-scale-in overflow-hidden">

          {/* Header */}
          <div className="flex items-start justify-between px-5 pt-5 pb-3">
            <div className="flex-1 min-w-0 pr-3">
              <h2 className="text-[16px] font-black text-gray-900 leading-tight truncate">{rewardName}</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">แสดงเพื่อใช้สิทธิ์ที่หน้าร้าน</p>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors shrink-0"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mode switcher */}
          <div className="flex gap-1 mx-5 mb-4 bg-gray-100 rounded-xl p-1">
            {MODES.map((m) => (
              <button
                key={m.key}
                onClick={() => setMode(m.key)}
                className={`flex-1 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
                  mode === m.key
                    ? "bg-white text-[var(--jh-green)] shadow-sm"
                    : "text-gray-400"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Display area — fixed height อิง QR code */}
          <div className="flex flex-col items-center px-5 pb-4">
            <div className="w-full h-[186px] flex items-center justify-center">
              {mode === "qr" && (
                <div className="p-3 bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.08)] border border-gray-100">
                  <QRCodeSVG
                    value={couponCode}
                    size={160}
                    bgColor="#fff"
                    fgColor="#1a1a1a"
                    level="M"
                    includeMargin={false}
                  />
                </div>
              )}

              {mode === "barcode" && (
                <div className="px-5 py-4 bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.08)] border border-gray-100 flex items-center justify-center w-full">
                  <Barcode
                    value={couponCode}
                    width={1.8}
                    height={90}
                    fontSize={11}
                    displayValue={false}
                    background="#fff"
                    lineColor="#1a1a1a"
                    margin={0}
                  />
                </div>
              )}

              {mode === "code" && (
                <div className="w-full h-full bg-gray-50 rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center px-4 gap-2">
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">รหัสคูปอง</p>
                  <p className="text-[20px] font-black font-mono tracking-[0.12em] text-gray-900 break-all text-center leading-snug">
                    {couponCode}
                  </p>
                </div>
              )}
            </div>

            {/* Code line — always render, invisible on "code" tab เพื่อรักษา layout */}
            <p className={`mt-3 font-mono text-[11px] text-gray-400 tracking-widest text-center ${mode === "code" ? "invisible" : ""}`}>
              {couponCode}
            </p>

            {/* Copy button */}
            <button
              onClick={handleCopy}
              className={`mt-4 w-full py-3 rounded-2xl text-[14px] font-bold transition-all active:scale-[0.98] ${
                copied
                  ? "bg-[var(--jh-green)] text-white"
                  : "bg-gray-900 text-white hover:bg-black"
              }`}
            >
              {copied ? "✓ คัดลอกแล้ว!" : "คัดลอกรหัส"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
