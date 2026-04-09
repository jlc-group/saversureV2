"use client";

/**
 * Backward-compatible aliases for legacy header section types.
 * Each wrapper presets variant props on the generic <SectionHeader>
 * so existing DB rows (created before consolidation) still render
 * with their original design.
 *
 * New admin UI should only expose `section_header` — these exist
 * purely so old page_configs rows keep working.
 */

import SectionHeader, { type SectionHeaderProps } from "./SectionHeader";

type LegacyProps = Partial<SectionHeaderProps>;

// rewards_page_header — small title + balance chips
export function RewardsHeaderAlias(props: LegacyProps) {
  return (
    <SectionHeader
      variant="gradient"
      decoration="circles"
      title_size="md"
      show_balance
      title="🎁 แลกรางวัล"
      subtitle="แลกของรางวัลและสิทธิพิเศษ"
      {...props}
    />
  );
}

// missions_page_header — leaf decoration
export function MissionsHeaderAlias(props: LegacyProps) {
  return (
    <SectionHeader
      variant="gradient"
      decoration="leaf"
      title_size="lg"
      title="ภารกิจ"
      subtitle="ทำภารกิจรับคะแนนและ Badge"
      {...props}
    />
  );
}

// shop_page_header — leaf decoration
export function ShopHeaderAlias(props: LegacyProps) {
  return (
    <SectionHeader
      variant="gradient"
      decoration="leaf"
      title_size="lg"
      title="ช้อปออนไลน์"
      subtitle="เลือกซื้อสินค้าออนไลน์กับเราได้ที่นี่เลย"
      {...props}
    />
  );
}

// wallet_page_header — simple 2-circle decoration
export function WalletHeaderAlias(props: LegacyProps) {
  return (
    <SectionHeader
      variant="gradient"
      decoration="simple"
      title_size="lg"
      title="กระเป๋าเงิน"
      subtitle="ยอดคงเหลือทั้งหมดของคุณ"
      {...props}
    />
  );
}

// news_page_header — small title with inline emoji
export function NewsHeaderAlias(props: LegacyProps) {
  return (
    <SectionHeader
      variant="gradient"
      decoration="circles"
      title_size="sm"
      icon_style="emoji_inline"
      icon_emoji="📰"
      title="ข่าวสาร"
      subtitle="โปรโมชั่นและข่าวสารล่าสุด"
      {...props}
    />
  );
}

// notifications_page_header — sticky white bar
export function NotificationsHeaderAlias(props: LegacyProps) {
  return (
    <SectionHeader
      variant="sticky"
      title="Notifications"
      back_href="/"
      {...props}
    />
  );
}

// support_page_header — help-circle icon
export function SupportHeaderAlias(props: LegacyProps) {
  return (
    <SectionHeader
      variant="gradient"
      decoration="circles"
      title_size="lg"
      icon_style="help_circle"
      title="คำถามที่พบบ่อย"
      subtitle="รวมคำตอบและวิธีการใช้งานเบื้องต้น"
      {...props}
    />
  );
}

// settings_page_header — basic PageHeader-like with back button
export function SettingsHeaderAlias(props: LegacyProps) {
  return (
    <SectionHeader
      variant="basic"
      title="การตั้งค่าแอปพลิเคชัน"
      subtitle="จัดการการแจ้งเตือนและความเป็นส่วนตัว"
      back_href="/profile"
      {...props}
    />
  );
}

// history_page_header — scan count subtitle
export function HistoryHeaderAlias(props: LegacyProps) {
  return (
    <SectionHeader
      variant="gradient"
      decoration="circles"
      title_size="lg"
      show_scan_count
      title="ประวัติการสะสมแต้ม"
      {...props}
    />
  );
}

// page_header_basic — uses basic variant
export function PageHeaderBasicAlias(props: LegacyProps) {
  return <SectionHeader variant="basic" {...props} />;
}
