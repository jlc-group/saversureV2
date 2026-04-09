"use client";

import Link from "next/link";

interface SupportContactCtaProps {
  text?: string;
  cta_label?: string;
  cta_href?: string;
}

export default function SupportContactCta({
  text = "ไม่พบคำตอบที่ต้องการ หรือต้องการแจ้งปัญหา?",
  cta_label = "ไปหน้าแจ้งปัญหา",
  cta_href = "/support/history?tab=ticket",
}: SupportContactCtaProps) {
  return (
    <div className="px-4 mt-4 relative z-10">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100/80 p-5 text-center">
        <p className="text-[13px] text-gray-600">{text}</p>
        <Link
          href={cta_href}
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,var(--jh-green)_0%,var(--jh-teal)_100%)] px-5 py-2.5 text-[13px] font-bold text-white shadow-md shadow-green-200/50 transition-all active:scale-[0.98]"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-4 h-4"
          >
            <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
          </svg>
          {cta_label}
        </Link>
      </div>
    </div>
  );
}
