"use client";

interface LeaderboardPageHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function LeaderboardPageHeader({
  title = "อันดับ",
  subtitle = "ดูอันดับการสแกน",
}: LeaderboardPageHeaderProps) {
  return (
    <div className="bg-[linear-gradient(277.42deg,#3C9B4D_-13.4%,#7DBD48_80.19%)] text-white px-5 pt-12 pb-6 rounded-b-[24px]">
      <h1 className="text-[22px] font-semibold">{title}</h1>
      {subtitle && <p className="text-[13px] opacity-80 mt-1">{subtitle}</p>}
    </div>
  );
}
