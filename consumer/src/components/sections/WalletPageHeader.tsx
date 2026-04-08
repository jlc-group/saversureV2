"use client";

interface WalletPageHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function WalletPageHeader({
  title = "กระเป๋าเงิน",
  subtitle = "ยอดคงเหลือทั้งหมดของคุณ",
}: WalletPageHeaderProps) {
  return (
    <div className="bg-[linear-gradient(277.42deg,#3C9B4D_-13.4%,#7DBD48_80.19%)] px-5 pt-8 pb-10 text-white relative overflow-hidden">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/8" />
      <div className="absolute right-12 bottom-0 h-20 w-20 rounded-full bg-white/5" />
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
