"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

function SideDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const mainMenus: { id: string; label: string; link: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'home', label: 'หน้าแรก', link: '/', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
    { id: 'profile', label: 'บัญชีของฉัน', link: '/profile', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
    { id: 'history', label: 'ประวัติกิจกรรมทั้งหมด', link: '/history', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg> },
  ];

  const supportMenus = [
    { id: 'faq', label: 'ศูนย์ช่วยเหลือและคำถาม (FAQ)', link: '#', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { id: 'settings', label: 'ตั้งค่าระบบ', link: '#', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    { id: 'support', label: 'ติดต่อแอดมิน', link: '/help', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg> },
  ];

  return (
    <div className={`fixed inset-0 z-[100] flex justify-center pointer-events-none transition-all duration-300 ${isOpen ? 'visible' : 'invisible delay-300'}`}>
       <div className="w-full max-w-[480px] h-full relative pointer-events-auto overflow-hidden">
          {/* Dark Overlay */}
          <div 
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 cursor-pointer ${isOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={onClose}
          />
          
          {/* Drawer Panel */}
          <div className={`absolute top-0 bottom-0 left-0 w-[82%] max-w-[320px] bg-[#F5F7F6] shadow-[10px_0_30px_rgba(0,0,0,0.2)] transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
             
             {/* Profile Header Block */}
             <div className="p-6 pb-6 pt-12 bg-white rounded-br-[36px] shadow-[0_4px_24px_rgba(0,0,0,0.03)] relative z-10">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors active:scale-95">
                   <svg className="w-[20px] h-[20px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <div className="flex flex-col gap-3">
                   <div className="w-[68px] h-[68px] rounded-full bg-white border-[3px] border-[#4CAF50] shadow-sm overflow-hidden shrink-0">
                      <img src="https://i.pravatar.cc/150?img=1" alt="avatar" className="w-full h-full object-cover" />
                   </div>
                   <div className="flex-1 mt-1">
                      <div className="text-gray-900 font-black text-[22px] tracking-tight leading-none mb-2 flex items-center gap-1.5">
                         ฉัตรธิดา สุขสบาย
                         <svg className="w-5 h-5 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-gradient-to-r from-[#FFD700] to-[#FFA000] text-yellow-950 text-[10px] font-black px-2.5 py-0.5 rounded-[6px] uppercase tracking-[0.1em] shadow-sm">Jula VIP</span>
                        <span className="text-[12px] text-gray-500 font-bold bg-gray-100 px-2 py-0.5 rounded-md">145 Point</span>
                      </div>
                   </div>
                </div>
             </div>

             {/* Functional Links (Scrollable) */}
             <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-none pb-24">
                
                {/* Promo CTA Action */}
                <Link href="/scan" onClick={onClose} className="bg-gradient-to-r from-[#4CAF50] to-[#2E7D32] hover:bg-[#388E3C] text-white rounded-[18px] p-4 flex items-center justify-between shadow-[0_4px_16px_rgba(76,175,80,0.3)] transition-all active:scale-[0.98]">
                   <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/20 shadow-inner">
                         <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8V5a2 2 0 012-2h3m10 0h3a2 2 0 012 2v3M3 16v3a2 2 0 002 2h3m10 0h3a2 2 0 002-2v-3M7 7h1m-1 3h1m3-3h1m-1 3h1m3-3h1m-1 3h1m-8 4v1m3-1v1m3-1v1" /></svg>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-[15px] tracking-wide leading-tight drop-shadow-sm">สแกนรับแต้มเพิ่ม</span>
                        <span className="text-[10px] text-green-50 font-medium tracking-wide">สแกนง่าย แลกฟรี ทันใจ</span>
                      </div>
                   </div>
                </Link>

                <div className="bg-white rounded-[20px] shadow-[0_2px_16px_rgba(0,0,0,0.03)] border border-gray-100/60 overflow-hidden divide-y divide-gray-50">
                  <div className="text-[10px] text-gray-400 font-black px-4 pt-3.5 pb-2.5 tracking-[0.15em] uppercase">บริการส่วนตัว</div>
                  {mainMenus.map((item, idx) => (
                    <Link href={item.link} onClick={onClose} key={item.id} className="w-full flex items-center justify-between p-3.5 px-4 hover:bg-green-50 active:bg-green-100 transition-colors group">
                       <div className="flex items-center gap-3.5">
                          <div className="w-9 h-9 rounded-xl bg-[#E8F5E9] flex items-center justify-center group-hover:scale-105 transition-transform text-[#4CAF50] border border-green-50 shadow-sm">
                             {item.icon}
                          </div>
                          <span className="text-gray-700 font-black text-[13.5px] tracking-tight">{item.label}</span>
                       </div>
                       <div className="flex items-center gap-2">
                          {item.badge && (
                            <span className="bg-[#FFD700] text-yellow-900 border border-yellow-400 shadow-sm text-[9px] font-black px-2 py-[2px] rounded-full tracking-wide">{item.badge}</span>
                          )}
                          <svg className="w-[14px] h-[14px] text-gray-300 group-hover:text-gray-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                       </div>
                    </Link>
                  ))}
                </div>

                <div className="bg-white rounded-[20px] shadow-[0_2px_16px_rgba(0,0,0,0.03)] border border-gray-100/60 overflow-hidden divide-y divide-gray-50">
                  <div className="text-[10px] text-gray-400 font-black px-4 pt-3.5 pb-2.5 tracking-[0.15em] uppercase">ช่วยเหลือและการตั้งค่า</div>
                  {supportMenus.map((item, idx) => (
                    <Link href={item.link} onClick={onClose} key={item.id} className="w-full flex items-center justify-between p-3.5 px-4 hover:bg-gray-50 active:bg-gray-100 transition-colors group">
                       <div className="flex items-center gap-3.5">
                          <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200 group-hover:bg-gray-200 transition-colors text-gray-600 shadow-sm">
                             {item.icon}
                          </div>
                          <span className="text-gray-600 font-black text-[13.5px] tracking-tight">{item.label}</span>
                       </div>
                       <svg className="w-[14px] h-[14px] text-gray-300 group-hover:text-gray-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </Link>
                  ))}
                </div>

             </div>

             {/* Footer / Logout Button at the bottom fixed */}
             <div className="p-4 px-6 mt-auto">
                 <button className="flex items-center justify-center gap-2 text-red-500 hover:text-red-600 bg-white hover:bg-red-50 border border-transparent hover:border-red-100 shadow-[0_2px_12px_rgba(0,0,0,0.05)] font-black text-[13.5px] transition-colors w-full p-3.5 rounded-[18px]">
                    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    ออกจากระบบ
                 </button>
             </div>

          </div>
       </div>
    </div>
  );
}

function UnifiedNavbar({ pathname, onMenuClick }: { pathname: string, onMenuClick: () => void }) {
  return (
    <header className="fixed top-0 z-[50] w-full max-w-[480px] left-1/2 -translate-x-1/2 bg-[#F5F7F6] h-14">
      <div className="flex h-14 items-center justify-between px-4 w-full relative">
        <button 
          onClick={onMenuClick}
          type="button" 
          className="text-gray-600 hover:bg-gray-200 p-2 rounded-full transition-colors flex items-center justify-center -ml-2"
        >
          <svg className="h-[24px] w-[24px]" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth={2} strokeLinecap="round">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
            <img src="/logo.png" alt="Jula's Herb Logo" className="h-[36px] mt-1 object-contain drop-shadow-sm" />
        </div>
        <div className="flex items-center gap-2">
           <Link href="/profile" className="h-[32px] w-[32px] rounded-full bg-gray-200 overflow-hidden border-[2.2px] border-[#4CAF50] shadow-sm active:scale-95 transition-transform block">
             <img src="https://i.pravatar.cc/150?img=1" alt="avatar" className="w-full h-full object-cover"/>
           </Link>
        </div>
      </div>
    </header>
  );
}

function UnifiedPointsBar() {
  return (
    <div className="bg-gradient-to-r from-[#4CAF50] to-[#2E7D32] text-white px-5 py-4 pb-6 rounded-b-[24px] flex items-center justify-between shadow-md relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full transform translate-x-10 -translate-y-10"></div>
      <div className="relative z-10 w-full flex justify-between items-center">
        <div>
          <div className="text-[11px] font-medium text-white/80 tracking-wide uppercase">อัตรา Points</div>
          <div className="text-sm font-bold mt-0.5 opacity-90">ฉัตรธิดา</div>
        </div>
        <div className="flex items-center gap-3 font-bold bg-black/15 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10 shadow-inner">
          <span className="flex items-center gap-1.5 text-base">125 <span className="text-[#FFD700] drop-shadow-md text-lg">🪙</span></span>
          <span className="text-white/20 px-0.5">|</span>
          <span className="flex items-center gap-1.5 text-base">0 <span className="text-cyan-300 drop-shadow-md text-lg">💎</span></span>
        </div>
      </div>
    </div>
  );
}

function BottomNav({ pathname }: { pathname: string }) {
  const tabs = [
    { id: 'home', icon: <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>, label: "หน้าหลัก", link: "/" },
    { id: 'missions', icon: <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, label: "ภารกิจ", link: "/missions" },
    { id: 'scan', isPrimary: true, icon: <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className="w-6 h-6"><path d="M9.5 6.5v3h-3v-3h3M11 5H5v6h6V5zm-1.5 9.5v3h-3v-3h3M11 13H5v6h6v-6zm6.5-6.5v3h-3v-3h3M19 5h-6v6h6V5z" /></svg>, label: "สะสมแต้ม", link: "/scan" },
    { id: 'shop', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><path d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>, label: "ช้อปออนไลน์", link: "/shop" },
    { id: 'profile', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>, label: "ฉัน", link: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 z-[50] w-full max-w-[480px] left-1/2 -translate-x-1/2 bg-white shadow-[0_-8px_20px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)] pt-1 rounded-t-[20px] border-t border-gray-100">
      <div className="flex h-16 items-center justify-around px-2 relative">
        {tabs.map(tab => {
          const isActive = pathname === tab.link;
          return (
            <Link key={tab.id} href={tab.link} className="flex flex-col items-center flex-1 justify-center relative group">
              {tab.isPrimary ? (
                /* Primary SCAN button ALWAYS Gamification Green, regardless of tab! */
                <div className={`-mt-8 mb-1 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_8px_16px_rgba(76,175,80,0.3)] ring-[6px] ring-[#F5F7F6] relative hover:scale-105 transition-transform bg-gradient-to-br from-[#4CAF50] to-[#2E7D32]`}>
                  <div className={`absolute inset-0 rounded-full bg-white transition-opacity ${isActive ? 'opacity-20' : 'opacity-0 group-hover:opacity-10'}`}></div>
                  <div className="text-white relative z-10">{tab.icon}</div>
                </div>
              ) : (
                 <div className={`mb-1 transition-colors ${isActive ? 'text-[#4CAF50]' : 'text-gray-400 group-hover:text-gray-600'}`}>
                   {tab.icon}
                 </div>
              )}
              <span className={`text-[10px] font-bold transition-colors ${isActive || tab.isPrimary ? 'text-[#4CAF50]' : 'text-gray-400'}`}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Hide the green Points bar on inner pages to save space, but ALWAYS keep Header/Footer
  const hidePointsBar = pathname.startsWith('/shop/product') || pathname.startsWith('/shop/cart') || pathname.startsWith('/shop/checkout') || pathname.startsWith('/reward') || (pathname.startsWith('/profile/') && pathname !== '/profile') || pathname.startsWith('/user/purchase') || pathname.startsWith('/history/tracking');

  return (
    <div className="min-h-[100dvh] bg-[#F5F7F6] font-sans max-w-[480px] w-full mx-auto shadow-[0_0_40px_rgba(0,0,0,0.05)] relative overflow-x-hidden">
      {/* Universal Top Navbar */}
      <UnifiedNavbar pathname={pathname} onMenuClick={() => setIsDrawerOpen(true)} />
      
      <div className="pt-14 relative w-full flex flex-col min-h-screen pb-[105px]">
        {/* Optional Universal Points Status Bar */}
        {!hidePointsBar && <UnifiedPointsBar />}
        
        {/* Content Wrapper */}
        <div className={`${hidePointsBar ? '' : '-mt-3'} relative w-full flex flex-col items-center flex-1`}>
          {children}
        </div>
      </div>
      
      {/* Universal Bottom Navigation */}
      <BottomNav pathname={pathname} />

      {/* Side Drawer */}
      <SideDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
}
