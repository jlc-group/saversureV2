"use client";

import Link from "next/link";

interface FeatureItem {
  label: string;
  href: string;
  description: string;
  capabilities: string[];
}

interface FeatureGroup {
  label: string;
  summary: string;
  items: FeatureItem[];
}

const featureGroups: FeatureGroup[] = [
  {
    label: "หน้าหลัก",
    summary: "ดูภาพรวมธุรกิจ, operational health และ analytics เชิงลึกที่ pre-compute มาแล้วจาก V2",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        description: "ภาพรวม campaign, scans, points และ recent activity",
        capabilities: ["summary KPI", "scan charts", "conversion funnel", "recent activity"],
      },
      {
        label: "Ops Center",
        href: "/ops-center",
        description: "เฝ้าดู health ของระบบ, alerts และสถานะ live sync/migration",
        capabilities: ["ops digest", "alerts", "health monitor"],
      },
      {
        label: "Analytics",
        href: "/analytics",
        description: "customer analytics และ advanced CRM analytics",
        capabilities: ["RFM distribution", "cohort retention", "top products/rewards", "CLV", "product affinity", "campaign ROI"],
      },
    ],
  },
  {
    label: "แคมเปญ & QR",
    summary: "จัดการสินค้าต้นทาง, campaign, batches, rolls, factory export และ QC ครบ flow การผลิต QR",
    items: [
      {
        label: "Campaigns",
        href: "/campaigns",
        description: "จัดการ campaign หลักของระบบสะสมแต้ม",
        capabilities: ["campaign config", "active/inactive control", "campaign detail"],
      },
      {
        label: "Products",
        href: "/products",
        description: "จัดการสินค้าและรูปภาพสินค้า",
        capabilities: ["product CRUD", "image upload", "import support"],
      },
      {
        label: "Batches / Rolls / Factories / QC",
        href: "/batches",
        description: "วางแผน batch, ส่งออกไฟล์โรงงาน, track rolls และตรวจ QC",
        capabilities: ["batch planning", "factory export", "roll tracking", "QC verification"],
      },
      {
        label: "Promotions",
        href: "/promotions",
        description: "จัดการ promo bonus และ campaign incentives",
        capabilities: ["promotion config", "bonus logic", "campaign linking"],
      },
    ],
  },
  {
    label: "ลูกค้า & ธุรกรรม",
    summary: "ดู profile ลูกค้า, scan/redeem history, point movement, fulfillment และ CRM เชิงรุก/เชิงรับ",
    items: [
      {
        label: "Customers",
        href: "/customers",
        description: "ค้นหา/ดูรายละเอียดลูกค้า พร้อมแท็บ scan history, redeem history และ point ledger",
        capabilities: ["customer profile", "legacy + v2 history", "admin notes", "sorting/filtering"],
      },
      {
        label: "CRM",
        href: "/crm",
        description: "ฐาน CRM ครบตั้งแต่ segment ไปถึง export",
        capabilities: [
          "tags + segments",
          "RFM snapshots + CLV",
          "guarded LINE broadcasts",
          "triggers + lifecycle automation",
          "survey/NPS",
          "referral program",
          "segment CSV export",
        ],
      },
      {
        label: "Scan History / Transactions / Fulfillment",
        href: "/scan-history",
        description: "ติดตาม scan, point/redeem transactions และงานจัดส่ง",
        capabilities: ["legacy scan visibility", "transaction export", "shipment workflow"],
      },
    ],
  },
  {
    label: "รางวัล & แต้ม",
    summary: "จัดการ reward catalog, tier, point currencies และเศรษฐกิจแต้มของแบรนด์",
    items: [
      {
        label: "Rewards",
        href: "/rewards",
        description: "ดูแล reward catalog และ stock การแลกรางวัล",
        capabilities: ["reward CRUD", "image upload", "redeem support"],
      },
      {
        label: "Reward Tiers",
        href: "/tiers",
        description: "กำหนดระดับสมาชิกและสิทธิ์ตาม tier",
        capabilities: ["tier thresholds", "tier visuals", "tier rules"],
      },
      {
        label: "Point Currencies",
        href: "/currencies",
        description: "จัดการหลายสกุลแต้ม/คูปองในระบบ",
        capabilities: ["currency config", "conversion", "balance rules"],
      },
    ],
  },
  {
    label: "หน้าลูกค้า (Consumer)",
    summary: "ควบคุมประสบการณ์ฝั่งลูกค้า ตั้งแต่ branding ไปถึง content, lucky draw, donation และ gamification",
    items: [
      {
        label: "Branding / Page Builder / Popup / Menu / News",
        href: "/branding",
        description: "จัดหน้าและคอนเทนต์ของ consumer app",
        capabilities: ["branding", "page builder", "popup manager", "menu editor", "news & banners"],
      },
      {
        label: "Lucky Draw / Donations / Gamification",
        href: "/lucky-draw",
        description: "จัดกิจกรรม engagement ฝั่งลูกค้า",
        capabilities: ["lucky draw campaigns", "donation campaigns", "missions + badges"],
      },
    ],
  },
  {
    label: "ระบบ & อินทิเกรชัน",
    summary: "ดูแล staff, settings, API/webhooks, migration และ tenant control",
    items: [
      {
        label: "Support / API Keys / Webhooks",
        href: "/support",
        description: "เครื่องมือ support และ external integration",
        capabilities: ["support cases", "API key management", "webhook config/logs"],
      },
      {
        label: "Staff / Settings",
        href: "/settings/staff",
        description: "จัดการสิทธิ์ผู้ใช้งานภายในและ system settings",
        capabilities: ["staff management", "tenant settings", "code export settings"],
      },
      {
        label: "Migration Center / Tenants / Audit Log",
        href: "/migration-center",
        description: "งานระดับ platform สำหรับ migration, multi-tenant และ audit trail",
        capabilities: ["migration jobs", "tenant switching", "audit visibility"],
      },
    ],
  },
];

const capabilityHighlights = [
  "รองรับข้อมูล V1 + V2 พร้อมกันใน customer, scan และ analytics flows",
  "มี pre-compute / scheduler สำหรับ RFM, cohorts, advanced CRM analytics และ export queue",
  "มี safety guard สำหรับ LINE broadcast เช่น preview, confirmation phrase และ high-risk acknowledgment",
  "มี consumer-facing survey/referral flows แล้ว ไม่ได้ค้างอยู่แค่หลังบ้าน",
];

export default function FeatureSummaryPage() {
  const totalModules = featureGroups.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-normal text-[var(--md-on-surface)] tracking-[-0.5px]">Feature Summary</h1>
          <p className="mt-1 text-[14px] text-[var(--md-on-surface-variant)]">
            สรุปความสามารถทั้งหมดที่มีอยู่ใน `admin.svsu.me` ณ ตอนนี้ พร้อมลิงก์เข้าหน้าจริงของแต่ละ module
          </p>
        </div>
        <div className="rounded-[18px] bg-[var(--md-surface)] px-5 py-4 md-elevation-1">
          <p className="text-[12px] uppercase tracking-wide text-[var(--md-on-surface-variant)]">Modules</p>
          <p className="mt-1 text-[28px] font-bold text-[var(--md-primary)]">{totalModules.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {capabilityHighlights.map((item) => (
          <div key={item} className="rounded-[18px] bg-[var(--md-surface)] p-4 md-elevation-1">
            <p className="text-[13px] text-[var(--md-on-surface)]">{item}</p>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {featureGroups.map((group) => (
          <section key={group.label} className="bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] p-5 md-elevation-1">
            <div className="mb-4">
              <h2 className="text-[20px] font-medium text-[var(--md-on-surface)]">{group.label}</h2>
              <p className="mt-1 text-[13px] text-[var(--md-on-surface-variant)]">{group.summary}</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {group.items.map((item) => (
                <div key={item.href} className="rounded-[16px] border border-[var(--md-outline-variant)] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-[16px] font-medium text-[var(--md-on-surface)]">{item.label}</h3>
                      <p className="mt-1 text-[13px] text-[var(--md-on-surface-variant)]">{item.description}</p>
                    </div>
                    <Link href={item.href} className="text-[12px] font-medium text-[var(--md-primary)] hover:underline">
                      เปิดหน้า
                    </Link>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.capabilities.map((capability) => (
                      <span
                        key={capability}
                        className="rounded-full bg-[var(--md-surface-container)] px-2.5 py-1 text-[11px] text-[var(--md-on-surface-variant)]"
                      >
                        {capability}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
