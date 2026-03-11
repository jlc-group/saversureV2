"use client";

import { useCallback, useEffect, useState } from "react";

interface CarouselItem {
  image_url: string;
  link?: string;
  alt?: string;
}

interface BannerCarouselProps {
  items?: CarouselItem[];
  auto_play?: boolean;
  interval_ms?: number;
}

export default function BannerCarousel({
  items = [],
  auto_play = true,
  interval_ms = 5000,
}: BannerCarouselProps) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    if (items.length <= 1) return;
    setCurrent((c) => (c + 1) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (!auto_play || items.length <= 1) return;
    const timer = setInterval(next, interval_ms);
    return () => clearInterval(timer);
  }, [auto_play, interval_ms, next, items.length]);

  if (!items.length) return null;

  const Wrapper = items[current]?.link ? "a" : "div";
  const wrapperProps = items[current]?.link
    ? { href: items[current].link, target: "_self" as const }
    : {};

  return (
    <div className="px-4 mt-4">
      <div className="relative overflow-hidden rounded-2xl shadow-sm">
        <Wrapper {...wrapperProps} className="block">
          <img
            src={items[current].image_url}
            alt={items[current].alt || `Banner ${current + 1}`}
            className="w-full h-40 sm:h-48 object-cover transition-opacity duration-500"
          />
        </Wrapper>

        {items.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === current
                    ? "w-6 bg-white"
                    : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
