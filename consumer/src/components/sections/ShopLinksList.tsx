"use client";

import Link from "next/link";
import { mediaUrl } from "@/lib/media";

type IconType =
  | "shopee"
  | "lazada"
  | "line"
  | "line_admin"
  | "website"
  | "emoji"
  | "image";

interface ShopLinkItem {
  icon_type?: IconType;
  icon_value?: string;
  title?: string;
  link?: string;
  border_color?: string;
}

interface ShopLinksListProps {
  items?: ShopLinkItem[];
}

/* ------------------------------------------------------------------ */
/*  Brand icon renderers                                               */
/*  SVGs ย้ายมาจาก consumer/src/app/shop/page.tsx เดิม                 */
/*  (เป็น brand asset ไม่ใช่ข้อมูล — ข้อมูลมาจาก props `items[]`)      */
/* ------------------------------------------------------------------ */

function ShopeeIcon() {
  return (
    <div className="w-12 h-12 bg-[#EE4D2D] rounded-xl flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden">
      <div className="absolute inset-0 bg-white/20 mt-6 rounded-full blur-sm" />
      <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7 relative z-10">
        <path d="M6.5 8.5C6.5 5.5 8.5 3.5 12 3.5C15.5 3.5 17.5 5.5 17.5 8.5L20.5 8.5C21.05 8.5 21.5 8.95 21.5 9.5L19.5 20.5C19.5 21.05 19.05 21.5 18.5 21.5L5.5 21.5C4.95 21.5 4.5 21.05 4.5 20.5L2.5 9.5C2.5 8.95 2.95 8.5 3.5 8.5L6.5 8.5ZM12 5.5C10 5.5 8.5 7 8.5 8.5L15.5 8.5C15.5 7 14 5.5 12 5.5ZM13 11.5C13 12.05 12.55 12.5 12 12.5C11.45 12.5 11 12.05 11 11.5L11 10.5C11 9.95 11.45 9.5 12 9.5C12.55 9.5 13 9.95 13 10.5L13 11.5ZM12 13.5C12.55 13.5 13 13.95 13 14.5L13 15.5C13 16.05 12.55 16.5 12 16.5C11.45 16.5 11 16.05 11 15.5L11 14.5C11 13.95 11.45 13.5 12 13.5Z" />
      </svg>
    </div>
  );
}

function LazadaIcon() {
  return (
    <div className="w-12 h-12 bg-gradient-to-br from-[#0F146D] to-[#1a237e] rounded-xl flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden">
      <div className="absolute -left-2 -bottom-2 w-10 h-10 bg-[#f57c00] rounded-full blur-md opacity-80" />
      <div className="absolute -right-2 -top-2 w-10 h-10 bg-[#e91e63] rounded-full blur-md opacity-80" />
      <span className="text-white font-black text-[15px] tracking-tighter relative z-10 italic drop-shadow-md">
        Laz
      </span>
    </div>
  );
}

function WebsiteIcon() {
  return (
    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(26,148,68,0.15)] relative overflow-hidden border border-gray-100">
      <svg viewBox="0 0 24 24" fill="var(--jh-green)" className="w-8 h-8">
        <path d="M17 8C8 10 5.9 16.1 5.1 19l1.4 1.3C7.4 14.2 13.4 12 17 8z" />
        <path
          d="M17 8c-3-2.6-8.9-3.4-12.7-1.1L5.6 8A13.4 13.4 0 0117 8z"
          opacity="0.6"
        />
        <path d="M17 8c1.7 4 1 9.7-2 12.8A13.8 13.8 0 0017 8z" opacity="0.8" />
      </svg>
    </div>
  );
}

function LineIcon() {
  return (
    <div className="w-12 h-12 bg-[#00B900] rounded-xl flex items-center justify-center shrink-0 shadow-sm">
      <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7">
        <path d="M21.5 10.3c0-4.6-4.3-8.3-9.5-8.3-5.2 0-9.5 3.7-9.5 8.3 0 4.1 3.4 7.6 8.1 8.2.3 0 .8.1 1 .3.1.2.1.8 0 1.2L11 21.6c0 .3.2.4.4.3 2.1-1.3 6.9-4.2 8.7-6.5 1-1.4 1.4-3.2 1.4-5.1z" />
      </svg>
    </div>
  );
}

function LineAdminIcon() {
  return (
    <div className="w-12 h-12 bg-[#00B900] rounded-xl flex flex-col items-center justify-center shrink-0 shadow-sm">
      <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6 -mb-1">
        <path d="M21.5 10.3c0-4.6-4.3-8.3-9.5-8.3-5.2 0-9.5 3.7-9.5 8.3 0 4.1 3.4 7.6 8.1 8.2.3 0 .8.1 1 .3.1.2.1.8 0 1.2L11 21.6c0 .3.2.4.4.3 2.1-1.3 6.9-4.2 8.7-6.5 1-1.4 1.4-3.2 1.4-5.1z" />
      </svg>
      <span className="text-white font-extrabold text-[9px] tracking-wider mt-0.5">
        LINE
      </span>
    </div>
  );
}

function renderIcon(type: IconType | undefined, value?: string) {
  switch (type) {
    case "shopee":
      return <ShopeeIcon />;
    case "lazada":
      return <LazadaIcon />;
    case "line":
      return <LineIcon />;
    case "line_admin":
      return <LineAdminIcon />;
    case "website":
      return <WebsiteIcon />;
    case "emoji":
      return (
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-gray-100">
          <span className="text-[28px] leading-none">{value || "🛒"}</span>
        </div>
      );
    case "image": {
      const src = value ? mediaUrl(value) : "";
      return (
        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-sm bg-white border border-gray-100">
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt="" className="w-full h-full object-cover" />
          ) : (
            <WebsiteIcon />
          )}
        </div>
      );
    }
    default:
      return <WebsiteIcon />;
  }
}

export default function ShopLinksList({ items = [] }: ShopLinksListProps) {
  if (!items || items.length === 0) {
    return (
      <div className="px-5 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl p-6 text-center text-muted-foreground shadow-sm">
          ยังไม่มีช่องทางช้อปออนไลน์
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 -mt-6 relative z-10">
      <div className="w-full flex flex-col gap-3.5">
        {items.map((item, i) => {
          const href = item.link || "#";
          const title = item.title || "";
          const borderColor = item.border_color || "#3C9B4D";

          return (
            <Link
              key={`${i}-${href}`}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-[20px] p-2 flex items-center pr-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border-[2px] transition-transform active:scale-[0.97] animate-slide-up hover:shadow-[0_8px_16px_rgba(0,0,0,0.08)]"
              style={{
                borderColor,
                animationDelay: `${i * 60}ms`,
              }}
            >
              {renderIcon(item.icon_type, item.icon_value)}
              <span className="font-extrabold text-[16px] text-gray-800 ml-4 flex-1">
                {title}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
