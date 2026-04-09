"use client";

import PageHeader from "@/components/PageHeader";

interface PageHeaderBasicProps {
  title?: string;
  subtitle?: string;
  back_href?: string;
}

export default function PageHeaderBasic({
  title = "",
  subtitle = "",
  back_href = "",
}: PageHeaderBasicProps) {
  if (!title) return null;
  return (
    <PageHeader
      title={title}
      subtitle={subtitle || undefined}
      backHref={back_href || undefined}
    />
  );
}
