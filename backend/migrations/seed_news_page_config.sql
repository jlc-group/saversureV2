-- Seed default page_config for /news page
-- Idempotent: ON CONFLICT DO NOTHING skips tenants that already have a wallet config
-- (e.g. created manually via /page-builder admin UI)

INSERT INTO page_configs (tenant_id, page_slug, sections, status, version)
SELECT t.id, 'news', '[
  {
    "id": "news-page-header-default",
    "type": "news_page_header",
    "order": 1,
    "visible": true,
    "props": {
      "title": "ข่าวสาร",
      "subtitle": "โปรโมชั่นและข่าวสารล่าสุด",
      "icon_emoji": "📰"
    }
  },
  {
    "id": "news-list-default",
    "type": "news_list",
    "order": 2,
    "visible": true,
    "props": {
      "limit": 50,
      "empty_title": "ยังไม่มีข่าวสารใหม่",
      "empty_text": "ติดตามโปรโมชั่น แคมเปญพิเศษ\nและกิจกรรมดีๆ ได้ที่นี่ เร็วๆ นี้",
      "empty_cta_label": "กลับหน้าหลัก",
      "empty_cta_link": "/",
      "error_title": "ไม่สามารถโหลดข่าวสารได้",
      "error_text": "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
      "retry_label": "ลองใหม่",
      "read_more_label": "อ่านเพิ่มเติม",
      "collapse_label": "ย่อ",
      "show_banner_badge": true
    }
  }
]'::jsonb, 'published', 1
FROM tenants t
ON CONFLICT (tenant_id, page_slug) DO NOTHING;
