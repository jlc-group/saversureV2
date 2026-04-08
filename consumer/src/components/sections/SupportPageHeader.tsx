"use client";

interface SupportPageHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function SupportPageHeader({
  title = "คำถามที่พบบ่อย",
  subtitle = "รวมคำตอบและวิธีการใช้งานเบื้องต้น",
}: SupportPageHeaderProps) {
  return (
    <div className="bg-[linear-gradient(277.42deg,#3C9B4D_-13.4%,#7DBD48_80.19%)] px-5 pt-8 pb-10 text-white relative overflow-hidden">
      <div className="absolute -right-5 -top-5 h-24 w-24 rounded-full bg-white/10 animate-float" />
      <div className="absolute right-10 bottom-2 h-14 w-14 rounded-full bg-white/5 animate-float-delay-1" />
      <div className="absolute left-8 bottom-0 h-10 w-10 rounded-full bg-white/8 animate-float-delay-2" />

      <div className="relative flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-5 h-5"
          >
            <path d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
          </svg>
        </div>
        <div>
          <h1 className="text-[40px] font-black tracking-tight leading-[1] mb-0 drop-shadow-md">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[17px] font-medium text-white/95 -mt-1.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
