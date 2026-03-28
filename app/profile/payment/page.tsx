"use client";
import { useRouter } from "next/navigation";

export default function PaymentPage() {
  const router = useRouter();
  return (
    <div className="bg-[#F5F5F5] min-h-screen w-full font-sans pb-10">
      <div className="bg-white w-full max-w-[480px] fixed top-[56px] z-40 flex items-center justify-between px-2 py-3 shadow-sm border-b border-gray-100">
         <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center text-gray-600 active:bg-gray-50 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
         </button>
         <h1 className="text-[17px] font-bold text-gray-800">ช่องทางการชำระเงิน</h1>
         <div className="w-10"></div>
      </div>
      <div className="pt-[60px]"></div>

      <div className="p-4 px-5 text-[12px] font-bold tracking-[0.1em] text-gray-500 uppercase">บัตรเครดิต/เดบิตของฉัน</div>
      
      <div className="bg-white p-4 py-5 mb-2 shadow-sm flex items-center justify-between border-b border-gray-100/50">
         <div className="flex items-center gap-4">
            <div className="w-[50px] h-[34px] bg-[#1a1f71] rounded-[4px] relative overflow-hidden flex items-center justify-center text-white font-bold italic text-[14px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] border border-[#0d1454]">
               VISA
            </div>
            <div className="flex flex-col">
               <span className="font-bold text-[14.5px] text-gray-800">**** **** **** 4589</span>
               <span className="text-[11px] text-[#4CAF50] font-bold tracking-tight">✔️ เชื่อมต่อแล้ว</span>
            </div>
         </div>
         <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
      </div>

      <div className="bg-white p-4 py-4.5 shadow-sm flex items-center gap-3.5 text-[#1b5e20] active:bg-green-50 transition-colors cursor-pointer pl-5">
         <div className="w-[45px] h-[30px] rounded-[4px] border-[1.5px] border-dashed border-[#4CAF50] flex items-center justify-center text-[#4CAF50] bg-green-50/50">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
         </div>
         <span className="font-bold text-[13.5px]">เพิ่มบัตรเครดิต/เดบิตใบใหม่</span>
      </div>

      <div className="p-4 px-5 text-[12px] font-bold tracking-[0.1em] text-gray-500 uppercase mt-4">ช่องทางอื่นๆ</div>
      <div className="bg-white p-4 shadow-sm flex items-center justify-between border-y border-gray-100/50 cursor-pointer active:bg-gray-50 transition-colors">
         <div className="flex items-center gap-4 pl-1">
            <div className="w-[45px] h-[45px] rounded-[10px] bg-[#113566] border border-[#0d2a52] flex flex-col items-center justify-center shadow-inner">
               <div className="text-white text-[10px] font-black text-center leading-none tracking-tight">Prompt<br/>Pay</div>
            </div>
            <span className="font-bold text-[14px] text-gray-800">โอนสแกนผ่าน QR Code</span>
         </div>
         <svg className="w-5 h-5 text-[#4CAF50]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
      </div>
    </div>
  );
}
