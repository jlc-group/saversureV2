# Jula's Herb Consumer Frontend — V1 vs V2 Summary

> เอกสารนี้จัดทำสำหรับ Designer เพื่อเข้าใจภาพรวม Consumer Frontend ของ Jula's Herb ทั้ง 2 version
> อัปเดตล่าสุด: มีนาคม 2026

---

## ภาพรวมเปรียบเทียบ

| ด้าน | V1 (Legacy) | V2 (Current) |
|------|-------------|--------------|
| **Framework** | Nuxt 2 (Vue 2) | Next.js 14 (React, App Router) |
| **Language** | TypeScript + JavaScript | TypeScript |
| **CSS** | Tailwind + SCSS + Element UI | Tailwind CSS v4 (CSS variables) |
| **State** | Vuex | React Context (TenantProvider) |
| **Deploy** | Firebase | Cloudflare Tunnel → `julasherb.svsu.me` |
| **Folder** | `D:\Dev\apps\saversure-legacy\saversure-frontend\` | `D:\Dev\apps\saversureV2\consumer\src\` |
| **Tenant** | Single-brand (Jula's Herb only) | Multi-tenant (wildcard subdomain) |
| **Auth** | LINE LIFF + OTP | LINE · Google · Email/Password |
| **Design Style** | มี Element UI components, ไม่ consistent | Custom design system, mobile-first glass-morphism |

---

## V1 — Saversure Legacy Frontend

### ข้อมูลทั่วไป
- **Path:** `D:\Dev\apps\saversure-legacy\saversure-frontend\`
- **Framework:** Nuxt 2 (Vue 2), SPA mode (SSR: false)
- **Deploy:** Firebase Hosting
- **Brand:** Jula's Herb Thailand / Julaherb

### Tech Stack
| ด้าน | Technology |
|------|------------|
| Framework | Nuxt 2 (Vue 2), SPA mode |
| Language | TypeScript + JavaScript |
| CSS | Tailwind CSS + SCSS |
| UI Library | Element UI (Vue component library) |
| State Management | Vuex |
| HTTP Client | Axios (@nuxtjs/axios) |
| LINE Integration | @line/liff v2.27.2 |
| QR/Barcode | qrcode.vue, vue-barcode-reader |
| Form Validation | vee-validate v3 |
| Date | dayjs |
| Animation | fireworks-js, swiper |

### หน้าทั้งหมด (Pages)

#### หน้าหลัก & Scan
| Route | คำอธิบาย |
|-------|---------|
| `/` | Home — แสดง rewards/donations ตาม category, popup ads, banner carousel |
| `/scan` | สแกน QR Code / กรอกรหัสด้วยมือ เพื่อสะสมแต้ม |
| `/scan/success` | หน้าสะสมแต้มสำเร็จ (พร้อม fireworks animation) |

#### Reward & Lucky
| Route | คำอธิบาย |
|-------|---------|
| `/privilege/:id` | รายละเอียด reward พร้อมปุ่มแลก |
| `/privilege/:id/confirm` | ยืนยันการแลก reward |
| `/privilege/:id/confirm/address` | เลือก/เพิ่ม delivery address |
| `/lucky/:id` | รายละเอียด lucky draw campaign |
| `/lucky/:id/register` | ลงทะเบียนร่วม lucky draw |
| `/lucky/campaign/jubjaek` | Campaign พิเศษ "จับแจก" |
| `/prize/summer` | Summer prize campaign |
| `/prize/summer-slot` | Slot machine mini-game |

#### History & Account
| Route | คำอธิบาย |
|-------|---------|
| `/history/point` | ประวัติสะสมแต้ม (เหรียญ + เพชร) |
| `/history/redeem` | ประวัติการแลกของรางวัล |
| `/history/donation` | ประวัติการบริจาค |
| `/account` | ข้อมูลส่วนตัว + แต้มคงเหลือ |
| `/account/edit` | แก้ไขข้อมูลส่วนตัว |
| `/donation/:id` | รายละเอียดการบริจาค / แลกแต้ม |

#### Auth & Register
| Route | คำอธิบาย |
|-------|---------|
| `/register` | สมัครสมาชิกด้วยเบอร์โทร |
| `/register/verify` | กรอก OTP ยืนยันเบอร์ |
| `/register/success` | สมัครสำเร็จ |

#### อื่นๆ
| Route | คำอธิบาย |
|-------|---------|
| `/shop` / `/shoponline` | ร้านค้า / ร้านค้าออนไลน์ |
| `/news/:id` | ข่าวสาร/โปรโมชั่น |
| `/support` | ติดต่อ/แจ้งปัญหา (สร้าง + ดู case) |
| `/broadcast-survey/:id` | แบบสำรวจ |
| `/special-campaign/top-spender` | Top Spender campaign |
| `/policy/privacy`, `/policy/pdpa` | นโยบาย |

### ฟีเจอร์หลัก
- **ระบบแต้ม 2 ประเภท:** Point (เหรียญ 🪙) + Diamond Point (เพชร 💎)
- **LINE LIFF Login:** เข้าสู่ระบบผ่าน LINE เท่านั้น
- **QR + Barcode Scan:** สแกนผลิตภัณฑ์เพื่อสะสมแต้ม
- **OTP Verification:** ยืนยันเบอร์โทรศัพท์
- **Reward Redemption:** แลกสิทธิพิเศษ + delivery address
- **Lucky Draw:** ระบบจับรางวัล หลาย campaign
- **Donation:** บริจาคแต้มเพื่อการกุศล
- **Popup Ads/Banners:** โฆษณา campaign ด้วย modal
- **Mini-games:** Slot machine (summer campaign)

### ลักษณะ Design (V1)
- ใช้ **Element UI** components เป็นหลัก (ปุ่ม, form, dialog)
- มี **Tailwind** เสริมเฉพาะ layout
- สีหลัก: เขียวของ Jula's Herb (#1a9444 หรือใกล้เคียง)
- Layout: ไม่ได้ fix max-width อย่างเคร่งครัด — อาจดูไม่สม่ำเสมอบน desktop
- Cards: ส่วนใหญ่ใช้ Element UI card component (มุม radius ต่ำ)
- Navigation: Top bar + Drawer (ไม่มี Bottom Nav ที่ชัดเจน)
- **จุดอ่อน:** ไม่ consistent, responsive มีปัญหา, design เก่า, หลาย page ทำไว้ต่างช่วงเวลา ดูไม่เป็นเนื้อเดียวกัน

---

## V2 — saversureV2 Consumer Frontend

### ข้อมูลทั่วไป
- **Path:** `D:\Dev\apps\saversureV2\consumer\src\`
- **URL:** `https://julasherb.svsu.me` (dev/staging)
- **Framework:** Next.js 14 (App Router)
- **Multi-tenant:** รองรับทุกแบรนด์ผ่าน wildcard subdomain `{brand}.svsu.me`

### Tech Stack
| ด้าน | Technology |
|------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| CSS | Tailwind CSS v4 + CSS Variables |
| LINE Integration | @line/liff (LIFF SDK) |
| QR Scanner | html5-qrcode |
| Font | DB Heavent (custom woff2/woff) |
| Auth | JWT + localStorage |

### โครงสร้าง Folder

```
consumer/src/
├── app/
│   ├── layout.tsx                  ← Root layout + TenantProvider + Navbar + BottomNav
│   ├── globals.css                 ← Design tokens (CSS variables) + font
│   ├── page.tsx                    ← หน้าหลัก (Portal Dashboard)
│   ├── login/page.tsx              ← Auth Landing (LINE / Google / Email)
│   ├── register/
│   │   ├── page.tsx                ← สมัครสมาชิก 3 ขั้นตอน
│   │   └── complete/page.tsx       ← กรอกโปรไฟล์เพิ่มเติม (หลัง social login)
│   ├── scan/page.tsx               ← Canonical scan page (QR + กรอกรหัส)
│   ├── s/[code]/page.tsx           ← QR short-link redirect handler (bootstrap only)
│   ├── profile/page.tsx            ← ข้อมูลสมาชิก
│   ├── history/
│   │   ├── page.tsx                ← ประวัติสะสมแต้ม
│   │   └── redeems/page.tsx        ← ประวัติการแลกแต้ม
│   ├── auth/line/callback/page.tsx ← LINE OAuth callback
│   ├── forgot-password/page.tsx    ← รีเซ็ตรหัสผ่านด้วย OTP
│   ├── rewards/page.tsx            ← แลกแต้ม/ของรางวัล (scaffold)
│   ├── missions/page.tsx           ← Missions/Challenge (scaffold)
│   ├── news/page.tsx               ← ข่าวสาร (scaffold)
│   ├── support/page.tsx            ← แจ้งปัญหา (scaffold)
│   └── privacy/page.tsx            ← นโยบายความเป็นส่วนตัว
│
├── components/
│   ├── Navbar.tsx                  ← Top bar (logo + hamburger + avatar/login)
│   ├── BottomNav.tsx               ← Bottom tab bar (5 tabs + floating scan)
│   ├── Drawer.tsx                  ← Side menu slide-in จากซ้าย
│   ├── TenantProvider.tsx          ← Multi-tenant context (branding + CSS vars)
│   └── QrScanner.tsx               ← Camera QR scanner (html5-qrcode)
│
└── lib/
    ├── api.ts                      ← Fetch wrapper (JWT + X-Tenant-ID header)
    ├── auth.ts                     ← JWT decode + localStorage token
    ├── tenant.ts                   ← Tenant resolver (subdomain → API branding)
    ├── pendingScan.ts              ← Pending scan context (localStorage buffer)
    └── liff.ts                     ← LINE LIFF init/wrapper
```

### หน้าทั้งหมด (Pages)

#### หน้าหลัก & Navigation
| Route | คำอธิบาย | สถานะ |
|-------|---------|--------|
| `/` | Portal Dashboard: แต้มคงเหลือ, สถานะสมาชิก, Quick Actions | ✅ พร้อม |
| `/login` | Auth Landing: LINE / Google / Email login, ลิงก์ register/forgot-pw | ✅ พร้อม |
| `/profile` | ข้อมูลสมาชิก, สถานะ profile_completed, ลิงก์ shortcut | ✅ พร้อม |

#### Scan & Auth Flow
| Route | คำอธิบาย | สถานะ |
|-------|---------|--------|
| `/scan` | สแกน QR (กล้อง/LIFF/กรอกรหัส), แสดงผล inline, แต้มปัจจุบัน | ✅ พร้อม |
| `/s/[code]` | QR bootstrap handler: บันทึก pending code แล้ว redirect | ✅ พร้อม |
| `/auth/line/callback` | รับ LINE OAuth code → exchange token → redirect | ✅ พร้อม |
| `/register` | สมัคร 3 ขั้นตอน (เบอร์ → OTP+ข้อมูล → สรุป) | ✅ พร้อม |
| `/register/complete` | กรอกข้อมูลเพิ่มหลัง social login | ✅ พร้อม |
| `/forgot-password` | รีเซ็ตรหัสผ่านด้วย OTP SMS | ✅ พร้อม |

#### History & Rewards
| Route | คำอธิบาย | สถานะ |
|-------|---------|--------|
| `/history` | ประวัติสะสมแต้ม (credit/debit) | ✅ พร้อม |
| `/history/redeems` | ประวัติการแลกแต้ม | ✅ พร้อม |
| `/rewards` | แลกแต้ม/ของรางวัล | 🚧 Scaffold |
| `/missions` | Missions/Challenge | 🚧 Scaffold |
| `/news` | ข่าวสาร/โปรโมชั่น | 🚧 Scaffold |
| `/support` | แจ้งปัญหา | 🚧 Scaffold |

### ฟีเจอร์หลัก (V2)
- **Auth-first flow:** ลูกค้าสแกน QR → ถ้ายังไม่ login จะพาไปหน้า login ก่อน → หลัง login สำเร็จ scan code ไม่หาย
- **3 วิธี Login:** LINE OAuth, Google (GSI), Email/Password
- **Forgot Password:** ขอ OTP ทาง SMS → reset รหัสผ่านใหม่
- **Pending Scan Context:** เก็บ code ใน localStorage ระหว่าง auth flow → resume scan อัตโนมัติ
- **3 วิธี Scan:** กล้องมือถือ (html5-qrcode), กรอกรหัสเอง, LIFF scanCodeV2 (ใน LINE app)
- **LIFF Integration:** detect LINE environment, ใช้ native QR scanner ใน LINE
- **Multi-tenant Branding:** CSS variables inject runtime จาก API ตาม subdomain
- **Portal Dashboard:** แสดงแต้ม, quick actions, สถานะสมาชิก

### Components

#### Navbar (Top Bar)
- Fixed ด้านบน, backdrop-blur, border-bottom
- ซ้าย: ปุ่ม Hamburger → เปิด Drawer
- กลาง: Brand Logo (จาก TenantProvider) + ชื่อแบรนด์ → คลิกไปหน้าแรก
- ขวา: Avatar (ถ้า login) หรือปุ่ม "Login" → ไปหน้า profile

#### BottomNav (Bottom Tab Bar)
- 5 tabs: **หน้าหลัก** · **ประวัติ** · **สะสมแต้ม** (กลาง, ลอย) · **แลกแต้ม** · **โปรไฟล์**
- Tab กลาง (Scan): ลอยเหนือ bar 28px, gradient สีเขียว-เหลือง, shadow
- Active indicator: แถบสีเขียว 4px ด้านบน tab

#### Drawer (Side Menu)
- Slide-in จากซ้าย, width 78% (max 320px), backdrop overlay
- Header: brand logo + ชื่อแบรนด์ (gradient สีเขียว)
- User card: avatar + แต้มสะสม (load เมื่อเปิด drawer)
- Menu: หน้าหลัก, สแกน, ประวัติสะสม, ประวัติแลก, แจ้งปัญหา

---

## Design System (V2)

### สี (CSS Variables)
| Variable | ค่า | ใช้งาน |
|----------|-----|--------|
| `--primary` | `#1a9444` | ปุ่มหลัก, active state, icon |
| `--primary-dark` | `#3C9B4D` | gradient end, hover state |
| `--primary-light` | `rgba(148,201,69,0.15)` | background ไอคอน |
| `--success` | `#94c945` | scan success badge, scan button |
| `--error` | `#FD3642` | error state, ปุ่ม logout |
| `--on-surface` | `#333333` | text หลัก |
| `--on-surface-variant` | `rgba(0,0,0,0.45)` | text รอง/subtitle |
| `--surface-dim` | `#f8f8f8` | background หน้า |
| `--green-gradient` | `linear-gradient(277deg, #3C9B4D, #7DBD48)` | header history |
| `--scan-btn-gradient` | `linear-gradient(166deg, #cce7a5, #94c945)` | ปุ่ม scan กลาง |
| `--j-brown` | `#603814` | สีน้ำตาล brand accent |

> หมายเหตุ: ค่าเหล่านี้ inject ตาม tenant จาก API ทำให้แต่ละแบรนด์มีสีต่างกันได้

### Typography
- **Font:** DB Heavent (custom woff2/woff files ใน `public/assets/fonts/`)
  - DBHeaventt-Light (300)
  - DBHeavent (400)
  - DBHeavent-Bold (700)
- **Fallback:** `-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif`
- **Base:** 16px, line-height: 1, word-spacing: 1px

### Layout
- **Mobile-first:** max-width `560px` centered
- ป้องกัน pinch-zoom: `userScalable: false`
- Cards: `rounded-[28-32px]`, `bg-white/90`, `backdrop-blur`, `border border-white/60`
- Glass-morphism: shadow + backdrop-blur + semi-transparent background
- Hero banners: `linear-gradient(135deg, var(--primary) 0%, #245c31 100%)`

### Radius Scale
| ขนาด | ค่า |
|------|-----|
| sm | 8px |
| md | 12px |
| lg | 16px |
| xl | 28–32px |

---

## Auth & Scan Flow (V2)

### Auth Flow
```
[User สแกน QR → /s/{code}]
        │
        ├─ Login อยู่แล้ว ──────────────────────────→ /scan?code=...&auto=1
        │
        └─ ยังไม่ login → ลอง LIFF silent login
                    │
                    ├─ LIFF login สำเร็จ → exchange token → /scan
                    │
                    └─ ไม่สำเร็จ → /login?code={code}
                                        │
                              ┌─────────┼─────────┐
                              │         │         │
                           LINE      Google    Email
                              │
                         finishAuth(tokens)
                              │
                   profile_completed?
                    NO → /register/complete
                    YES → getPendingScanTarget() → /scan?code=...&auto=1
```

### Scan Flow
```
[เปิดหน้า /scan]
      │
      ├─ มี code ใน URL → auto scan ถ้า login
      └─ ไม่มี code → รอให้ user กดสแกนหรือกรอก

[กดปุ่ม "สแกน QR"]
      │
      ├─ ยังไม่ login → /login?code=...
      ├─ อยู่ใน LINE App (iOS) → liff.openWindow(QRCodeReader)
      ├─ อยู่ใน LINE App (Android) → liff.scanCodeV2()
      └─ บน Browser → เปิดกล้อง html5-qrcode

[submit scan]
      │
      ├─ ขอ Geolocation (timeout 5s)
      ├─ POST /api/v1/scan
      ├─ SUCCESS → แสดง +{points} แต้มได้รับ → อัปเดตยอดแต้ม
      └─ ERROR
            ├─ profile_incomplete → /register/complete
            ├─ already_scanned → แจ้งซ้ำ (สีแดง)
            └─ อื่นๆ → แสดง error card
```

---

## จุดที่ควรพัฒนาต่อ (V2 Backlog)

### สิ่งที่ยังเป็น Scaffold (หน้าว่าง)
- `/rewards` — แลกแต้ม/ของรางวัล
- `/missions` — ภารกิจ/challenge สะสมแต้ม
- `/news` — ข่าวสาร/โปรโมชั่น
- `/support` — แจ้งปัญหา/ติดต่อเรา

### ฟีเจอร์ที่มีใน V1 แต่ยังไม่มีใน V2
- Lucky Draw campaigns (ลุ้นรางวัล)
- Donation (บริจาคแต้ม)
- แก้ไขข้อมูลส่วนตัว (account/edit)
- ระบบแต้ม 2 ประเภท (Diamond Point ใน V1)
- Pop-up Ads / Banner carousel
- Mini-games (slot machine)
- Shop / Online ordering
- Survey / แบบสำรวจ

### จุดที่ควรปรับปรุง Design
- หน้า `/scan` — background image + form layout ยังดู busy อยู่
- หน้า `/` (Home) — Quick action grid ยังเรียบเกินไป ไม่ดึงดูด
- Result card หลังสแกน — ยังไม่มีรูปสินค้า/animation ที่สวยงาม
- หน้า `/profile` — ข้อมูลน้อย ยังไม่มี tier/badge แสดงระดับสมาชิก
- หน้า Rewards — ยังไม่ได้ implement
- BottomNav — icon ยังใช้ emoji แทน SVG icon จริง

---

## สรุปเปรียบเทียบ V1 vs V2

| ฟีเจอร์ | V1 | V2 |
|---------|-----|-----|
| สะสมแต้ม (QR Scan) | ✅ | ✅ |
| Login ผ่าน LINE | ✅ | ✅ |
| Login ผ่าน Email | ❌ | ✅ |
| Login ผ่าน Google | ❌ | ✅ |
| Forgot Password | ❌ | ✅ |
| Multi-tenant | ❌ | ✅ |
| Pending Scan (ไม่หายหลัง login) | ❌ | ✅ |
| ประวัติแต้ม | ✅ | ✅ |
| ประวัติแลก | ✅ | ✅ |
| Reward Redemption | ✅ | 🚧 |
| Lucky Draw | ✅ | ❌ |
| Donation | ✅ | ❌ |
| Leaderboard | ✅ | ❌ |
| Mini-games | ✅ | ❌ |
| Shop/Online Order | ✅ | 🚧 |
| News/Promotion | ✅ | 🚧 |
| Support/Contact | ✅ | 🚧 |
| แต้ม 2 ประเภท (Diamond) | ✅ | ❌ |
| Portal Dashboard | ❌ | ✅ |
| Responsive / Mobile-first | ⚠️ ปัญหา | ✅ |
| Design consistency | ⚠️ ไม่สม่ำเสมอ | ✅ |
| Custom branding per tenant | ❌ | ✅ |

> ✅ = พร้อมใช้งาน · 🚧 = อยู่ระหว่างพัฒนา · ❌ = ยังไม่มี · ⚠️ = มีปัญหา
