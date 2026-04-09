"use client";

import { useState } from "react";

interface FaqItem {
  q: string;
  a: string;
}

interface SupportFaqListProps {
  items?: FaqItem[];
  empty_text?: string;
}

export default function SupportFaqList({
  items = [],
  empty_text = "ยังไม่มีคำถามที่พบบ่อย",
}: SupportFaqListProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  if (!items.length) {
    return (
      <div className="px-4 relative z-10">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100/80 p-6 text-center">
          <p className="text-[13px] text-gray-500">{empty_text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 -mt-6 relative z-10">
      <div className="animate-slide-up space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm border border-gray-100/80 overflow-hidden transition-all"
          >
            <button
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left bg-white transition hover:bg-gray-50 active:bg-gray-100"
            >
              <div className="w-7 h-7 rounded-full bg-[var(--jh-green)]/10 flex items-center justify-center shrink-0">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--jh-green)"
                  strokeWidth="2"
                  className="w-3.5 h-3.5"
                >
                  <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01" />
                </svg>
              </div>
              <span className="flex-1 text-[13px] font-semibold text-gray-800">
                {item.q}
              </span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${
                  openIdx === i ? "rotate-180" : ""
                }`}
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openIdx === i && (
              <div className="px-4 pb-3.5 pl-14 -mt-1 bg-white">
                <p className="text-[12px] text-gray-500 leading-relaxed whitespace-pre-wrap">
                  {item.a}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
