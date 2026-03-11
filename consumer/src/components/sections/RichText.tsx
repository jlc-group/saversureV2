"use client";

import { Card, CardContent } from "@/components/ui/card";

interface RichTextProps {
  content?: string;
  alignment?: "left" | "center" | "right";
  title?: string;
}

export default function RichText({
  content = "",
  alignment = "left",
  title,
}: RichTextProps) {
  if (!content && !title) return null;

  const alignClass =
    alignment === "center"
      ? "text-center"
      : alignment === "right"
        ? "text-right"
        : "text-left";

  return (
    <div className="px-4 mt-4">
      <Card className="border-0 shadow-sm">
        <CardContent className={`p-5 ${alignClass}`}>
          {title && (
            <h3 className="text-base font-bold mb-2">{title}</h3>
          )}
          <div
            className="prose prose-sm max-w-none text-foreground/80"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
