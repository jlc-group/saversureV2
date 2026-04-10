"use client";

import { useState } from "react";
import FaqDetailPanel from "./FaqDetailPanel";
import type { FaqDetailItem } from "./FaqDetailPanel";

interface FaqItem {
  q: string;
  a: string;
  image_url?: string;
}

interface SupportFaqListProps {
  items?: FaqItem[];
  empty_text?: string;
  /** Category title — used as collapsible group header */
  title?: string;
  /** Kept for backward compat */
  icon?: string;
}

export default function SupportFaqList({
  items = [],
  empty_text = "ยังไม่มีคำถามที่พบบ่อย",
  title,
}: SupportFaqListProps) {
  const [groupOpen, setGroupOpen] = useState(true);
  const [selectedItem, setSelectedItem] = useState<FaqDetailItem | null>(null);

  const openDetail = (item: FaqItem) => {
    setSelectedItem({
      ...item,
      _groupTitle: title || undefined,
    });
  };

  // No title → render flat (backward compat)
  if (!title) {
    return (
      <div className="px-4 relative z-10">
        {items.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
            <p className="text-[13px] text-gray-500">{empty_text}</p>
          </div>
        ) : (
          <FaqRows items={items} onSelect={openDetail} />
        )}
        <FaqDetailPanel
          open={!!selectedItem}
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      </div>
    );
  }

  // Shopee-style: collapsible group
  return (
    <div className="px-4 py-1 relative z-10">
      <button
        onClick={() => setGroupOpen(!groupOpen)}
        className="w-full flex items-center justify-between py-3.5 border-b border-gray-200 text-left transition hover:bg-gray-50/50 -mx-1 px-1 rounded"
      >
        <span className="text-[14px] font-semibold text-gray-800">{title}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${
            groupOpen ? "rotate-180" : ""
          }`}
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {groupOpen && (
        <div className="mt-1">
          {items.length === 0 ? (
            <div className="py-4 text-center">
              <p className="text-[13px] text-gray-400">{empty_text}</p>
            </div>
          ) : (
            <FaqRows items={items} onSelect={openDetail} />
          )}
        </div>
      )}

      <FaqDetailPanel
        open={!!selectedItem}
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
}

/** Question rows — click opens slide-in panel */
function FaqRows({
  items,
  onSelect,
}: {
  items: FaqItem[];
  onSelect: (item: FaqItem) => void;
}) {
  return (
    <div>
      {items.map((item, i) => (
        <div key={i} className="border-b border-gray-100 last:border-b-0">
          <button
            onClick={() => onSelect(item)}
            className="w-full flex items-center gap-3 py-3 text-left transition hover:bg-gray-50/50"
          >
            <span className="flex-1 text-[13px] text-gray-700 leading-snug">
              {item.q}
            </span>
            {item.image_url && (
              <span className="text-[10px] text-gray-300 shrink-0">📷</span>
            )}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-4 h-4 text-gray-300 shrink-0"
            >
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
