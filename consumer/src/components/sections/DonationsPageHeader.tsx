"use client";

interface DonationsPageHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function DonationsPageHeader({
  title = "ประวัติการบริจาค",
  subtitle = "",
}: DonationsPageHeaderProps) {
  return (
    <div className="bg-[linear-gradient(277.42deg,#3C9B4D_-13.4%,#7DBD48_80.19%)] px-5 pt-8 pb-10 text-white relative overflow-hidden">
      <div className="absolute -right-5 -top-5 h-24 w-24 rounded-full bg-white/10 animate-float" />
      <div className="absolute right-8 bottom-3 h-16 w-16 rounded-full bg-white/5 animate-float-delay-1" />
      <div className="absolute left-10 bottom-0 h-10 w-10 rounded-full bg-white/8 animate-float-delay-2" />
      <h1 className="text-[40px] font-black tracking-tight leading-[1] mb-0 drop-shadow-md relative">
        {title}
      </h1>
      {subtitle && (
        <p className="text-[17px] font-medium text-white/95 -mt-1.5 relative">
          {subtitle}
        </p>
      )}
    </div>
  );
}
