"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  sectionRegistry,
  type SectionDefinition,
} from "@/components/sections/registry";

interface PageConfigResponse {
  sections: SectionDefinition[];
  version?: number;
}

interface PageRendererProps {
  pageSlug: string;
  fallback?: React.ReactNode;
}

export default function PageRenderer({
  pageSlug,
  fallback,
}: PageRendererProps) {
  const [sections, setSections] = useState<SectionDefinition[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<PageConfigResponse>(
        `/api/v1/public/page-config/${encodeURIComponent(pageSlug)}`,
      )
      .then((res) => {
        if (res.sections?.length) {
          setSections(res.sections);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [pageSlug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--jh-green)] border-t-transparent" />
      </div>
    );
  }

  if (!sections || sections.length === 0) {
    return <>{fallback}</>;
  }

  const visibleSections = sections
    .filter((s) => s.visible !== false)
    .sort((a, b) => a.order - b.order);

  return (
    <>
      {visibleSections.map((section) => {
        const Component = sectionRegistry[section.type];
        if (!Component) {
          return null;
        }
        return (
          <Component
            key={section.id}
            {...(section.props as Record<string, unknown>)}
          />
        );
      })}
    </>
  );
}
