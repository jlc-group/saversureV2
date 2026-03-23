"use client";

import { useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import StatusBadge from "./StatusBadge";

const QRCodeSVG = dynamic(
  () => import("qrcode.react").then((m) => m.QRCodeSVG),
  { ssr: false }
);

export interface RedeemEntry {
  id: string;
  reward_name: string | null;
  reward_image_url?: string | null;
  status: string;
  tracking: string | null;
  delivery_type: string | null;
  coupon_code: string | null;
  recipient_name: string | null;
  recipient_phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  district: string | null;
  sub_district: string | null;
  province: string | null;
  postal_code: string | null;
  confirmed_at: string | null;
  created_at: string;
}

const mediaUrl = (url?: string | null) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:30400";
  return `${base}/media/${url}`;
};

const deliveryLabels: Record<string, string> = {
  shipping: "จัดส่งถึงบ้าน",
  coupon: "คูปอง",
  digital: "ดิจิทัล",
  ticket: "ตั๋ว",
  pickup: "รับหน้าร้าน",
};

interface RedeemCardProps {
  entry: RedeemEntry;
  compact?: boolean;
  expanded?: boolean;
  onToggleDetail?: (id: string) => void;
}

export default function RedeemCard({
  entry: e,
  compact = false,
  expanded = false,
  onToggleDetail,
}: RedeemCardProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const imgSrc = mediaUrl(e.reward_image_url);
  const deliveryLabel = deliveryLabels[e.delivery_type || ""] || "ทั่วไป";

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addressText = [e.address_line1, e.address_line2, e.sub_district, e.district, e.province, e.postal_code]
    .filter(Boolean)
    .join(" ");

  const actionLabel = e.coupon_code ? "ดูโค้ด" : "ดูรายละเอียด";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden card-green-border">
      {/* Main row */}
      <div className="flex items-center gap-3 p-4">
        {/* Product thumbnail */}
        <div className="relative w-12 h-12 shrink-0 rounded-xl overflow-hidden bg-gray-50 ring-1 ring-gray-100">
          {imgSrc ? (
            <Image src={imgSrc} alt={e.reward_name || "Reward"} fill className="object-cover" sizes="48px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--jh-green)" strokeWidth="1.5" className="w-6 h-6 opacity-50">
                <path d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12" />
              </svg>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold truncate">{e.reward_name || "Reward"}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-muted-foreground">
              {new Date(e.created_at).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
            </span>
            <span className="text-[10px] text-muted-foreground bg-gray-100 rounded px-1.5 py-0.5">{deliveryLabel}</span>
          </div>
        </div>

        {/* Status + Action */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <StatusBadge status={e.status} />
          {!compact && onToggleDetail && (
            <button
              onClick={() => onToggleDetail(e.id)}
              className="text-[11px] font-semibold text-[var(--jh-green)] hover:underline"
            >
              {expanded ? "ซ่อน" : actionLabel}
            </button>
          )}
        </div>
      </div>

      {/* Tracking */}
      {!compact && e.tracking && (
        <div className="px-4 pb-2">
          <p className="text-[11px] text-muted-foreground">
            Tracking: <span className="font-mono text-foreground">{e.tracking}</span>
          </p>
        </div>
      )}

      {/* Expanded detail */}
      {!compact && expanded && (
        <div className="border-t border-gray-100 mx-4 pt-3 pb-4 space-y-3">
          {/* Status detail */}
          <div className="rounded-xl bg-secondary p-3 text-[13px] space-y-1.5">
            {e.confirmed_at && (
              <p><span className="text-muted-foreground">ยืนยันเมื่อ:</span> {new Date(e.confirmed_at).toLocaleString("th-TH")}</p>
            )}
            {e.recipient_name && (
              <p><span className="text-muted-foreground">ชื่อผู้รับ:</span> {e.recipient_name}</p>
            )}
            {e.recipient_phone && (
              <p><span className="text-muted-foreground">เบอร์ผู้รับ:</span> {e.recipient_phone}</p>
            )}
            {addressText && (
              <p><span className="text-muted-foreground">ที่อยู่จัดส่ง:</span> {addressText}</p>
            )}
          </div>

          {/* Coupon code */}
          {e.coupon_code && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 overflow-hidden">
              <button onClick={() => setShowQR(!showQR)} className="w-full p-3 flex items-center justify-between">
                <span className="text-xs font-medium text-blue-700">Coupon Code</span>
                <span className="text-[11px] text-blue-500">{showQR ? "ซ่อน QR" : "แสดง QR"}</span>
              </button>
              {showQR && (
                <div className="flex justify-center pb-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <QRCodeSVG value={e.coupon_code} size={140} />
                  </div>
                </div>
              )}
              <div className="px-3 pb-3 flex items-center justify-between gap-2">
                <p className="text-sm font-bold font-mono text-blue-700 break-all">{e.coupon_code}</p>
                <button
                  onClick={() => handleCopy(e.coupon_code!)}
                  className="shrink-0 rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-medium text-white"
                >
                  {copied ? "✓ คัดลอก" : "คัดลอก"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
