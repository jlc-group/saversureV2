"use client";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  return (
    <div className="bg-[#F5F7F6] min-h-screen w-full font-sans pb-10">
      <div className="bg-white w-full max-w-[480px] fixed top-[56px] z-40 flex items-center justify-between px-2 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)] border-b border-gray-100">
         <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center text-gray-600 active:bg-gray-50 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
         </button>
         <h1 className="text-[17px] font-bold text-gray-800">การตั้งค่าบัญชี</h1>
         <div className="w-10"></div>
      </div>
      <div className="pt-[60px]"></div>

      <div className="p-3 px-5 text-[12px] font-bold tracking-[0.1em] text-gray-500 uppercase mt-1">ข้อมูลส่วนตัว</div>
      <div className="bg-white px-5 divide-y divide-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] border-y border-gray-100">
         <div className="py-4.5 flex items-center justify-between active:bg-gray-50 cursor-pointer">
            <span className="text-[14px] text-gray-800 font-bold">โปรไฟล์ของฉัน</span>
            <div className="flex items-center gap-2 text-gray-400">
               <span className="text-[13px] font-medium text-gray-500">ฉัตรธิดา สุขสบาย</span>
               <svg className="w-[14px] h-[14px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </div>
         </div>
         <div className="py-4.5 flex items-center justify-between active:bg-gray-50 cursor-pointer">
            <span className="text-[14px] text-gray-800 font-bold">หมายเลขโทรศัพท์</span>
            <div className="flex items-center gap-2 text-gray-400">
               <span className="text-[13px] font-medium text-gray-500">089-123-****</span>
               <svg className="w-[14px] h-[14px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </div>
         </div>
         <div className="py-4.5 flex items-center justify-between active:bg-gray-50 cursor-pointer">
            <span className="text-[14px] text-gray-800 font-bold">อีเมล</span>
            <div className="flex items-center gap-2 text-gray-400">
               <span className="text-[13px] font-medium text-gray-500">chat**@gmail.com</span>
               <svg className="w-[14px] h-[14px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </div>
         </div>
         <div className="py-4.5 flex items-center justify-between active:bg-gray-50 cursor-pointer">
            <span className="text-[14px] text-gray-800 font-bold">เปลี่ยนรหัสผ่าน</span>
            <svg className="w-[14px] h-[14px] text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
         </div>
      </div>

      <div className="p-3 px-5 text-[12px] font-bold tracking-[0.1em] text-gray-500 uppercase mt-4">การตั้งค่าการแจ้งเตือน</div>
      <div className="bg-white px-5 divide-y divide-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] border-y border-gray-100">
         <div className="py-4.5 flex items-center justify-between">
            <div className="pr-4">
               <span className="text-[14px] text-gray-800 font-bold leading-tight block">ข่าวสารและโปรโมชั่น</span>
               <span className="text-[11px] text-gray-400 font-medium mt-0.5 block">รับข้อความแคมเปญใหม่ๆ จาก Jula's Herb ทันที</span>
            </div>
            <div className="w-12 h-6 bg-[#4CAF50] rounded-full relative cursor-pointer shadow-inner border border-green-600/30">
               <div className="absolute right-1 top-[2px] w-5 h-5 bg-white rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.2)]"></div>
            </div>
         </div>
         <div className="py-4.5 flex items-center justify-between">
            <div className="pr-4">
               <span className="text-[14px] text-gray-800 font-bold leading-tight block">อัปเดตสถานะการสั่งซื้อ</span>
               <span className="text-[11px] text-gray-400 font-medium mt-0.5 block">แจ้งเตือนสินค้าจัดส่งและคูปองส่วนลด</span>
            </div>
            <div className="w-12 h-6 bg-[#4CAF50] rounded-full relative cursor-pointer shadow-inner border border-green-600/30">
               <div className="absolute right-1 top-[2px] w-5 h-5 bg-white rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.2)]"></div>
            </div>
         </div>
      </div>

      {/* Delete Account */}
      <div className="bg-white px-5 mt-8 shadow-sm border-y border-gray-100">
         <div className="py-4 flex items-center justify-center cursor-pointer active:bg-red-50 transition-colors">
            <span className="text-[14px] text-red-500 font-black">ขอลบบัญชีผู้ใช้ (Delete Account)</span>
         </div>
      </div>
    </div>
  );
}
