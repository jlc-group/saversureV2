export default function HelpPage() {
  return (
    <div className="w-full flex flex-col min-h-[100dvh] bg-[#F5F7F6] font-sans pb-24 relative overflow-hidden">
      
      {/* Decorative Premium Header */}
      <div className="w-full max-w-[480px] mx-auto bg-gradient-to-b from-[#E8F5E9] to-[#F5F7F6] pt-10 pb-6 px-6 relative overflow-hidden border-b border-gray-200/40">
         <div className="absolute right-[-15%] top-[-30%] w-48 h-48 bg-[#4CAF50] opacity-[0.06] rounded-full blur-2xl pointer-events-none"></div>
         <div className="absolute left-[-10%] bottom-[10%] w-32 h-32 bg-yellow-400 opacity-[0.04] rounded-full blur-xl pointer-events-none"></div>
         
         <div className="relative z-10 flex flex-col">
            <div className="bg-white w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border border-green-100 mb-3 text-[20px]">💬</div>
            <h1 className="text-[24px] font-black text-gray-900 tracking-tight leading-none mb-1.5">ศูนย์ช่วยเหลือ</h1>
            <p className="text-[12.5px] font-medium text-gray-500">ติดต่อสอบถามปัญหา แจ้งปัญหาการใช้งาน หรือติดตามสถานะกับทีมงาน</p>
         </div>
      </div>

      {/* Main Content Card */}
      <div className="px-4 mt-4 w-full max-w-[480px] mx-auto">
        <div className="bg-white rounded-[24px] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col gap-3.5">
           
           <div className="text-center py-2 mb-1">
              <h2 className="text-[15px] font-black text-gray-800">ช่องทางการติดต่อ</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">ทีมงาน Jula's Herb พร้อมช่วยเหลือคุณทุกวัน</p>
           </div>
           
           {/* LINE Official Action */}
           <a href="#" className="bg-[#f0f9f0] rounded-[20px] p-3.5 pr-5 flex items-center gap-4 border border-[#00C300]/20 shadow-sm hover:border-[#00C300]/50 active:scale-[0.98] transition-all w-full group">
              <div className="w-[46px] h-[46px] bg-[#00C300] rounded-[14px] shrink-0 shadow-sm flex items-center justify-center relative">
                <div className="bg-white w-[24px] h-[24px] rounded-lg rounded-bl-sm flex items-center justify-center text-[#00C300] font-black text-[12px] leading-none pb-0.5 shadow-sm">LINE</div>
              </div>
              <div className="flex-1 flex flex-col">
                 <span className="text-[14px] font-black text-gray-800 tracking-tight leading-snug mb-0.5">แจ้งปัญหาผ่านแอดมิน</span>
                 <span className="text-[11px] text-[#00C300] font-bold">@JulasHerb (มี @ ด้วย)</span>
              </div>
              <svg className="w-4 h-4 text-[#00C300]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
           </a>

           {/* FAQ Action */}
           <a href="/profile/faq" className="bg-[#fcfdfc] rounded-[20px] p-3.5 pr-5 flex items-center gap-4 border border-gray-100 shadow-sm hover:border-[#4CAF50]/30 active:scale-[0.98] transition-all w-full group">
              <div className="w-[46px] h-[46px] bg-[#E8F5E9] border border-green-100 rounded-[14px] shrink-0 shadow-sm flex items-center justify-center text-[20px]">
                🧐
              </div>
              <div className="flex-1 flex flex-col">
                 <span className="text-[14px] font-black text-gray-800 tracking-tight leading-snug mb-0.5">คำถามที่พบบ่อย (FAQ)</span>
                 <span className="text-[11px] text-gray-400 font-medium">ค้นหาคำตอบด้วยตัวเองได้ที่นี่</span>
              </div>
              <svg className="w-4 h-4 text-gray-300 group-hover:text-[#4CAF50]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
           </a>

           <div className="mt-4 pt-4 border-t border-dashed border-gray-100 text-center">
              <div className="text-[10px] text-gray-400 font-bold tracking-widest uppercase opacity-70">เวลาทำการ จ.-ศ. 09:00 - 18:00 น.</div>
           </div>
        </div>
      </div>
    </div>
  );
}
