"use client";

interface MissionsPageHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function MissionsPageHeader({
  title = "ภารกิจ",
  subtitle = "ทำภารกิจรับคะแนนและ Badge",
}: MissionsPageHeaderProps) {
  return (
    <div className="bg-[linear-gradient(277.42deg,#3C9B4D_-13.4%,#7DBD48_80.19%)] px-5 pt-8 pb-10 text-white relative overflow-hidden">
      {/* Abstract Leaf Graphics Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <svg
          viewBox="0 0 200 200"
          fill="none"
          className="absolute top-0 right-0 w-64 h-64 opacity-20"
        >
          <path
            d="M100 10 C 150 10, 190 50, 190 100 C 190 150, 100 190, 10 100 C 10 50, 50 10, 100 10 Z"
            fill="#ffffff"
          />
        </svg>
        <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 animate-float" />
        <div className="absolute left-10 bottom-2 h-16 w-16 rounded-full bg-white/5 animate-float-delay-1" />
      </div>

      <div className="relative z-10 flex flex-col items-start">
        <h1 className="text-[40px] font-black tracking-tight leading-[1] mb-0 drop-shadow-md">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[17px] font-medium text-white/95 -mt-1.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
