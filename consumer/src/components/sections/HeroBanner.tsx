"use client";

import Link from "next/link";

interface HeroBannerProps {
  title?: string;
  subtitle?: string;
  image_url?: string;
  cta_text?: string;
  cta_link?: string;
}

export default function HeroBanner({
  title = "ยินดีต้อนรับ",
  subtitle,
  image_url,
  cta_text,
  cta_link = "/scan",
}: HeroBannerProps) {
  return (
    <div className="relative overflow-hidden">
      {image_url ? (
        <div className="relative h-48 sm:h-56 md:h-64">
          <img
            src={image_url}
            alt={title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
            <h2 className="text-xl font-bold leading-tight">{title}</h2>
            {subtitle && (
              <p className="mt-1 text-sm text-white/80">{subtitle}</p>
            )}
            {cta_text && (
              <Link
                href={cta_link}
                className="mt-3 inline-block rounded-full bg-white px-5 py-2 text-sm font-bold text-gray-900 transition hover:bg-white/90"
              >
                {cta_text}
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-[linear-gradient(135deg,var(--jh-green)_0%,var(--jh-green-dark)_100%)] px-5 pt-8 pb-10 text-white relative">
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 -left-4 h-24 w-24 rounded-full bg-white/5" />
          <div className="relative">
            <h2 className="text-xl font-bold leading-tight">{title}</h2>
            {subtitle && (
              <p className="mt-1 text-sm text-white/70">{subtitle}</p>
            )}
            {cta_text && (
              <Link
                href={cta_link}
                className="mt-4 inline-block rounded-full bg-white px-5 py-2 text-sm font-bold text-[var(--jh-green-dark)] transition hover:bg-white/90"
              >
                {cta_text}
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
