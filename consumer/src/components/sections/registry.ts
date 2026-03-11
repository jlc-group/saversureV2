import dynamic from "next/dynamic";
import type { ComponentType } from "react";

const HeroBanner = dynamic(() => import("./HeroBanner"));
const BannerCarousel = dynamic(() => import("./BannerCarousel"));
const FeatureMenu = dynamic(() => import("./FeatureMenu"));
const PointsSummary = dynamic(() => import("./PointsSummary"));
const PromoBanner = dynamic(() => import("./PromoBanner"));
const RichText = dynamic(() => import("./RichText"));
const RecentNews = dynamic(() => import("./RecentNews"));
const Spacer = dynamic(() => import("./Spacer"));
const FeatureList = dynamic(() => import("./FeatureList"));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sectionRegistry: Record<string, ComponentType<any>> = {
  hero_banner: HeroBanner,
  banner_carousel: BannerCarousel,
  feature_menu: FeatureMenu,
  points_summary: PointsSummary,
  promo_banner: PromoBanner,
  rich_text: RichText,
  recent_news: RecentNews,
  spacer: Spacer,
  feature_list: FeatureList,
};

export interface SectionDefinition {
  id: string;
  type: string;
  order: number;
  visible: boolean;
  props: Record<string, unknown>;
}

export const sectionMeta: Record<
  string,
  { label: string; icon: string; description: string }
> = {
  hero_banner: {
    label: "Hero Banner",
    icon: "🖼️",
    description: "แบนเนอร์ใหญ่หัวหน้า พร้อมรูปภาพหรือ gradient",
  },
  banner_carousel: {
    label: "Banner Carousel",
    icon: "🎠",
    description: "Slideshow แบนเนอร์หลายรูป เลื่อนอัตโนมัติ",
  },
  feature_menu: {
    label: "Feature Menu",
    icon: "🔲",
    description: "Grid ไอคอนเมนูลัด เช่น สแกน, แลกรางวัล",
  },
  points_summary: {
    label: "Points Summary",
    icon: "🪙",
    description: "แสดงคะแนนสะสมและข้อมูลผู้ใช้",
  },
  promo_banner: {
    label: "Promo Banner",
    icon: "🎉",
    description: "แถบโปรโมชั่นพร้อมปุ่ม CTA",
  },
  rich_text: {
    label: "Rich Text",
    icon: "📝",
    description: "เนื้อหา HTML/ข้อความอิสระ",
  },
  recent_news: {
    label: "Recent News",
    icon: "📰",
    description: "ข่าวสารล่าสุดจากระบบ",
  },
  spacer: {
    label: "Spacer",
    icon: "↕️",
    description: "ช่องว่างระหว่าง section",
  },
  feature_list: {
    label: "Feature List",
    icon: "📋",
    description: "รายการ feature พร้อมไอคอนและคำอธิบาย",
  },
};
