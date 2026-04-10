"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import FaqDetailPanel from "./FaqDetailPanel";
import type { FaqDetailItem } from "./FaqDetailPanel";

interface FaqItem {
  q: string;
  a: string;
  image_url?: string;
  _groupTitle?: string;
}

interface PageConfig {
  sections?: Array<{
    type: string;
    visible: boolean;
    props: { title?: string; items?: FaqItem[] };
  }>;
}

interface SupportSearchBarProps {
  placeholder?: string;
  page_slug?: string;
  empty_text?: string;
}

export default function SupportSearchBar({
  placeholder = "ค้นหาคำถาม...",
  page_slug = "support",
  empty_text = "ไม่พบคำถามที่ตรงกับคำค้นหา",
}: SupportSearchBarProps) {
  const [query, setQuery] = useState("");
  const [allItems, setAllItems] = useState<FaqItem[]>([]);
  const [results, setResults] = useState<FaqItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<FaqDetailItem | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch all FAQ items from page config API (no hardcode)
  useEffect(() => {
    let cancelled = false;
    api
      .get<PageConfig>(`/api/v1/public/page-config/${page_slug}`)
      .then((data) => {
        if (cancelled || !data.sections) return;
        const items: FaqItem[] = [];
        for (const s of data.sections) {
          if (s.type !== "support_faq_list" || !s.visible) continue;
          if (!Array.isArray(s.props.items)) continue;
          for (const item of s.props.items) {
            items.push({
              ...item,
              _groupTitle: s.props.title || undefined,
            });
          }
        }
        setAllItems(items);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [page_slug]);

  // Filter on query change
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setResults([]);
      return;
    }
    setResults(
      allItems.filter(
        (item) =>
          item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q),
      ),
    );
  }, [query, allItems]);

  const showResults = query.trim().length > 0;

  return (
    <div className="px-4 -mt-5 relative z-20">
      {/* Search input */}
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-9 py-3 rounded-full border border-gray-200 bg-white text-[13px] text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[var(--jh-green)] focus:ring-2 focus:ring-[var(--jh-green)]/20 transition shadow-sm"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-[10px] hover:bg-gray-300 transition"
          >
            x
          </button>
        )}
      </div>

      {/* Search results dropdown */}
      {showResults && (
        <div className="mt-2 bg-white rounded-xl border border-gray-100 shadow-lg max-h-[60vh] overflow-y-auto">
          {results.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-[13px] text-gray-400">{empty_text}</p>
            </div>
          ) : (
            <div>
              {results.map((item, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedItem(item)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition flex items-center gap-2 border-b border-gray-50 last:border-b-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-gray-800 leading-snug">
                      {item.q}
                    </p>
                    {item._groupTitle && (
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {item._groupTitle}
                      </p>
                    )}
                  </div>
                  {item.image_url && (
                    <span className="text-[10px] text-gray-300 shrink-0">
                      📷
                    </span>
                  )}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-300 shrink-0">
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
              <div className="px-4 py-2 text-[10px] text-gray-400 text-right border-t border-gray-50">
                พบ {results.length} รายการ
              </div>
            </div>
          )}
        </div>
      )}

      {/* Shared slide-in detail panel */}
      <FaqDetailPanel
        open={!!selectedItem}
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
}
