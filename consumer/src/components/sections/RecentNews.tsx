"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";

interface NewsItem {
  id: string;
  title: string;
  content?: string;
  image_url?: string;
  link_url?: string;
  type: string;
}

interface RecentNewsProps {
  limit?: number;
  show_image?: boolean;
}

export default function RecentNews({
  limit = 3,
  show_image = true,
}: RecentNewsProps) {
  const [items, setItems] = useState<NewsItem[]>([]);

  useEffect(() => {
    api
      .get<{ data: NewsItem[] }>(
        `/api/v1/public/news?type=news&limit=${limit}`,
      )
      .then((r) => setItems(r.data ?? []))
      .catch(() => {});
  }, [limit]);

  if (!items.length) return null;

  return (
    <div className="px-4 mt-4 space-y-2">
      <p className="text-xs font-semibold text-muted-foreground px-1">
        ข่าวสารล่าสุด
      </p>
      {items.map((item) => (
        <Card key={item.id} className="border-0 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {show_image && item.image_url && (
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-32 object-cover"
              />
            )}
            <div className="p-4">
              <h4 className="text-sm font-bold line-clamp-2">{item.title}</h4>
              {item.content && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {item.content}
                </p>
              )}
              {item.link_url && (
                <Link
                  href={item.link_url}
                  className="text-xs text-[var(--jh-green)] font-semibold mt-2 inline-block"
                >
                  อ่านเพิ่มเติม →
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
