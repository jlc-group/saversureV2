"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { api } from "@/lib/api";

interface NewsItem {
  id: string;
  title: string;
  content: string | null;
  image_url: string | null;
  link_url: string | null;
  type: string;
  published_at: string | null;
}

export default function NewsPage() {
  const [banners, setBanners] = useState<NewsItem[]>([]);
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<NewsItem | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get<{ data: NewsItem[] }>("/api/v1/public/news");
        const all = res.data || [];
        setBanners(all.filter((n) => n.type === "banner"));
        setArticles(all.filter((n) => n.type === "news"));
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (selected) {
    return (
      <div className="pb-20">
        <div className="bg-white sticky top-0 z-10 border-b border-[var(--outline-variant)]">
          <div className="max-w-[480px] mx-auto flex items-center h-14 px-4 gap-3">
            <button onClick={() => setSelected(null)} className="text-[var(--on-surface)]">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
            </button>
            <h1 className="text-[16px] font-medium text-[var(--on-surface)] truncate">{selected.title}</h1>
          </div>
        </div>
        <div className="max-w-[480px] mx-auto px-5 py-5">
          {selected.image_url && (
            <img src={selected.image_url} alt="" className="w-full rounded-[var(--radius-lg)] mb-4 object-cover max-h-[240px]" />
          )}
          <h2 className="text-[20px] font-semibold text-[var(--on-surface)] mb-2">{selected.title}</h2>
          {selected.published_at && (
            <p className="text-[12px] text-[var(--on-surface-variant)] mb-4">
              {new Date(selected.published_at).toLocaleDateString()}
            </p>
          )}
          <div className="text-[14px] text-[var(--on-surface)] leading-relaxed whitespace-pre-wrap">
            {selected.content || "No content"}
          </div>
          {selected.link_url && (
            <a
              href={selected.link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 h-[44px] px-6 leading-[44px] bg-[var(--primary)] text-white rounded-[var(--radius-xl)] text-[14px] font-medium"
            >
              Read More
            </a>
          )}
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="bg-white sticky top-0 z-10 border-b border-[var(--outline-variant)]">
        <div className="max-w-[480px] mx-auto flex items-center h-14 px-4 gap-3">
          <Link href="/" className="text-[var(--on-surface)]">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
          </Link>
          <h1 className="text-[18px] font-semibold text-[var(--on-surface)]">News & Updates</h1>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <svg className="animate-spin w-6 h-6 text-[var(--primary)]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : (
        <div className="max-w-[480px] mx-auto px-5 py-4">
          {banners.length > 0 && (
            <div className="mb-6">
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                {banners.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => b.link_url ? window.open(b.link_url, "_blank") : setSelected(b)}
                    className="flex-shrink-0 w-[280px] rounded-[var(--radius-lg)] overflow-hidden elevation-1 bg-white"
                  >
                    {b.image_url ? (
                      <img src={b.image_url} alt={b.title} className="w-full h-[140px] object-cover" />
                    ) : (
                      <div className="w-full h-[140px] bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] flex items-center justify-center">
                        <p className="text-white text-[16px] font-semibold px-4 text-center">{b.title}</p>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {articles.length === 0 && banners.length === 0 ? (
            <div className="text-center py-16 text-[var(--on-surface-variant)]">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 mx-auto mb-3 opacity-30">
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
              </svg>
              <p className="text-[14px]">No news yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {articles.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setSelected(a)}
                  className="w-full bg-white rounded-[var(--radius-lg)] elevation-1 overflow-hidden flex text-left"
                >
                  {a.image_url && (
                    <img src={a.image_url} alt="" className="w-[100px] h-[80px] object-cover flex-shrink-0" />
                  )}
                  <div className="p-3 flex-1 min-w-0">
                    <h3 className="text-[14px] font-medium text-[var(--on-surface)] line-clamp-2">{a.title}</h3>
                    {a.published_at && (
                      <p className="text-[11px] text-[var(--on-surface-variant)] mt-1">
                        {new Date(a.published_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
