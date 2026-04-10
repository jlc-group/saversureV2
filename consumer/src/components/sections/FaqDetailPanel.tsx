"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export interface FaqDetailItem {
  q: string;
  a: string;
  image_url?: string;
  _groupTitle?: string;
}

interface FaqDetailPanelProps {
  open: boolean;
  item: FaqDetailItem | null;
  onClose: () => void;
}

export default function FaqDetailPanel({
  open,
  item,
  onClose,
}: FaqDetailPanelProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when panel is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!mounted) return null;

  // Portal to body — escapes all parent stacking contexts
  return createPortal(
    <>
      {/* Backdrop — full screen, above navbar z-[9990] */}
      <div
        className={`fixed inset-0 z-[10000] bg-black/30 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Panel container — centered mobile frame */}
      <div
        className={`fixed inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-[10001] pointer-events-none overflow-hidden`}
      >
        <div
          className={`absolute inset-0 bg-white pointer-events-auto transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {item && (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 shrink-0 bg-white">
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 hover:bg-gray-200 transition"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-4 h-4 text-gray-600"
                  >
                    <path d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-[13px] font-medium text-gray-500 truncate">
                  ศูนย์ช่วยเหลือ
                </span>
              </div>

              {/* Content — full height scrollable */}
              <div className="flex-1 overflow-y-auto bg-white">
                <div className="px-5 py-5">
                  {/* Category hint */}
                  {item._groupTitle && (
                    <p className="text-[11px] font-medium text-[var(--jh-green)] mb-2">
                      {item._groupTitle}
                    </p>
                  )}

                  {/* Question */}
                  <h2 className="text-[18px] font-bold text-gray-900 leading-snug">
                    {item.q}
                  </h2>

                  {/* Divider */}
                  <div className="h-px bg-gray-100 my-4" />

                  {/* Answer */}
                  <div className="text-[14px] text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {item.a}
                  </div>

                  {/* Image */}
                  {item.image_url && (
                    <div className="mt-5">
                      <a
                        href={item.image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src={item.image_url}
                          alt=""
                          className="w-full rounded-xl border border-gray-100 shadow-sm"
                        />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>,
    document.body,
  );
}
