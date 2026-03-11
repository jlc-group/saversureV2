"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

interface PromoBannerProps {
  title?: string;
  description?: string;
  image_url?: string;
  link?: string;
  bg_color?: string;
  emoji?: string;
}

export default function PromoBanner({
  title = "โปรโมชั่น",
  description,
  image_url,
  link = "/rewards",
  bg_color,
  emoji = "🎉",
}: PromoBannerProps) {
  const bgStyle = bg_color
    ? { background: bg_color }
    : undefined;

  return (
    <div className="px-4 mt-4">
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {image_url ? (
            <Link href={link} className="block">
              <img
                src={image_url}
                alt={title}
                className="w-full h-36 sm:h-44 object-cover"
              />
            </Link>
          ) : (
            <div
              className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 relative"
              style={bgStyle}
            >
              <div className="absolute right-3 top-3 text-4xl opacity-30">
                {emoji}
              </div>
              <p className="text-xs font-semibold text-amber-700/60 uppercase tracking-wider">
                โปรโมชั่น
              </p>
              <h3 className="text-base font-bold text-amber-900 mt-1">
                {title}
              </h3>
              {description && (
                <p className="text-xs text-amber-800/70 mt-1">{description}</p>
              )}
              <Link
                href={link}
                className="mt-3 inline-block rounded-full bg-amber-600 px-4 py-1.5 text-xs font-bold text-white"
              >
                ดูรายละเอียด
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
