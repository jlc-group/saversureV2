"use client";

interface NewsPageHeaderProps {
  title?: string;
  subtitle?: string;
  icon_emoji?: string;
}

export default function NewsPageHeader({
  title = "ข่าวสาร",
  subtitle = "โปรโมชั่นและข่าวสารล่าสุด",
  icon_emoji = "📰",
}: NewsPageHeaderProps) {
  return (
    <div className="bg-[linear-gradient(277.42deg,#3C9B4D_-13.4%,#7DBD48_80.19%)] px-5 pt-8 pb-14 text-white relative overflow-hidden">
      <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 animate-float" />
      <div className="absolute right-16 top-12 h-8 w-8 rounded-full bg-white/10 animate-float-delay-1" />
      <div className="absolute left-8 -bottom-4 h-16 w-16 rounded-full bg-white/5 animate-float-delay-2" />

      <h1 className="text-xl font-bold relative animate-slide-up">
        <span className="inline-block mr-1.5 text-[22px] align-middle">
          {icon_emoji}
        </span>
        {title}
      </h1>
      {subtitle && (
        <p
          className="text-[13px] text-white/70 mt-1 relative animate-slide-up"
          style={{ animationDelay: "60ms" }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
