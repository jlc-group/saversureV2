"use client";
import { useRouter } from "next/navigation";

export default function AddressPage() {
  const router = useRouter();
  return (
    <div className="bg-[#F5F5F5] min-h-screen w-full font-sans pb-10 relative">
      {/* Header */}
      <div className="bg-white w-full max-w-[480px] fixed top-[56px] z-40 flex items-center justify-between px-2 py-3 shadow-sm border-b border-gray-100">
         <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center text-gray-600 active:bg-gray-50 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
         </button>
         <h1 className="text-[17px] font-bold text-gray-800">ที่อยู่ของฉัน</h1>
         <div className="w-10"></div>
      </div>
      <div className="pt-[60px]"></div>

      {/* Address Item 1 */}
      <div className="bg-white p-4 mb-2 shadow-sm relative">
         <div className="absolute top-4 right-4 bg-orange-100 text-[#ee4d2d] text-[10px] font-bold px-2.5 py-0.5 rounded-[4px] uppercase tracking-wide">ค่าเริ่มต้น</div>
         <div className="flex items-center gap-2 mb-1.5 pt-1">
            <span className="font-bold text-[14.5px] text-gray-800">ฉัตรธิดา สุขสบาย</span>
            <span className="text-gray-400 font-medium text-[13px]">| 089-123-4567</span>
         </div>
         <p className="text-[12px] text-gray-600 leading-relaxed pr-10 mb-3 mt-1 font-medium">
           123/45 ถนนสุขุมวิท 71 แขวงคลองตันเหนือ<br/>เขตวัฒนา กรุงเทพมหานคร 10110
         </p>
         <button className="text-[#ee4d2d] text-[12px] font-bold border border-[#ee4d2d] px-4 py-1.5 rounded-[6px] active:bg-orange-50 transition-colors">แก้ไข</button>
      </div>

      {/* Address Item 2 */}
      <div className="bg-white p-4 mb-2 shadow-sm relative">
         <div className="absolute top-4 right-4 bg-gray-100 text-gray-500 text-[10px] font-bold px-2.5 py-0.5 rounded-[4px] uppercase tracking-wide">ที่ทำงาน</div>
         <div className="flex items-center gap-2 mb-1.5 pt-1">
            <span className="font-bold text-[14.5px] text-gray-800">ฉัตรธิดา สุขสบาย</span>
            <span className="text-gray-400 font-medium text-[13px]">| 089-123-4567</span>
         </div>
         <p className="text-[12px] text-gray-600 leading-relaxed pr-10 mb-3 mt-1 font-medium">
           อาคารสาทรสแควร์ ชั้น 25 ถนนสาทรเหนือ<br/>แขวงสีลม เขตบางรัก กรุงเทพมหานคร 10500
         </p>
         <button className="text-gray-600 text-[12px] font-bold border border-gray-300 px-4 py-1.5 rounded-[6px] active:bg-gray-50 transition-colors">แก้ไข</button>
      </div>

      {/* Fixed bottom add button */}
      <div className="fixed bottom-[env(safe-area-inset-bottom)] left-1/2 -translate-x-1/2 w-full max-w-[480px] p-4 bg-white border-t border-gray-100 pb-6 z-40 shadow-[0_-4px_16px_rgba(0,0,0,0.03)]">
         <button className="w-full bg-[#ee4d2d] text-white py-3.5 rounded-[12px] font-bold text-[14px] active:scale-[0.98] transition-transform flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(238,77,45,0.3)] border border-[#d44327]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            เพิ่มที่อยู่ใหม่
         </button>
      </div>
    </div>
  );
}
