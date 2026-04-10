"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface FaqSection {
  id: string;
  type: string;
  visible: boolean;
  props: { title?: string; icon?: string; items?: unknown[] };
}

interface PageConfig {
  sections?: FaqSection[];
}

/**
 * Horizontal scrollable category navigation for the Help Center.
 * Auto-reads other `support_faq_list` sections from the same page config
 * to build the nav — admin adds/removes FAQ sections in page-builder,
 * this nav updates automatically. No hardcoding.
 *
 * Props:
 *   page_slug — which page config to read (default "support")
 */
export default function SupportCategoryNav({
  page_slug = "support",
}: {
  page_slug?: string;
}) {
  const [categories, setCategories] = useState<
    Array<{ id: string; title: string; icon: string; count: number }>
  >([]);

  useEffect(() => {
    let cancelled = false;
    api
      .get<PageConfig>(`/api/v1/public/page-config/${page_slug}`)
      .then((data) => {
        if (cancelled || !data.sections) return;
        const cats = data.sections
          .filter(
            (s) =>
              s.type === "support_faq_list" && s.visible !== false && s.props.title,
          )
          .map((s) => ({
            id: s.id,
            title: s.props.title || "",
            icon: s.props.icon || "❓",
            count: Array.isArray(s.props.items) ? s.props.items.length : 0,
          }));
        setCategories(cats);
      })
      .catch(() => {
        /* silent — nav just won't show */
      });
    return () => {
      cancelled = true;
    };
  }, [page_slug]);

  if (categories.length === 0) return null;

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="px-4 py-2 relative z-10">
      <div className="relative">
        <div className="flex gap-2.5 overflow-x-auto pb-1 pr-8 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => scrollTo(cat.id)}
              className="px-3.5 py-1.5 rounded-full border border-gray-200 bg-white text-[12px] font-medium text-gray-600 hover:border-[var(--jh-green)] hover:text-[var(--jh-green)] transition-all active:scale-95 shrink-0 whitespace-nowrap"
            >
              {cat.title}
            </button>
          ))}
        </div>
        {/* Fade hint — บอกลูกค้าว่าเลื่อนได้ */}
        <div className="absolute right-0 top-0 bottom-0 w-10 pointer-events-none bg-gradient-to-l from-gray-50 to-transparent rounded-r" />
      </div>
    </div>
  );
}
