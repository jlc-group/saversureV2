-- Seed default page_config for /donations page
-- Idempotent: ON CONFLICT DO NOTHING skips tenants that already have a config

INSERT INTO page_configs (tenant_id, page_slug, sections, status, version)
SELECT t.id, 'donations', '[
  {
    "id": "donations-page-header-default",
    "type": "donations_page_header",
    "order": 1,
    "visible": true,
    "props": {
      "title": "ประวัติการบริจาค",
      "subtitle": ""
    }
  },
  {
    "id": "donations-history-list-default",
    "type": "donations_history_list",
    "order": 2,
    "visible": true,
    "props": {
      "stat_count_label": "ครั้งที่บริจาค",
      "stat_points_label": "แต้มที่บริจาค",
      "browse_title": "ดูโครงการบริจาคทั้งหมด",
      "browse_subtitle": "หน้าแรก → แท็บบริจาค",
      "browse_href": "/",
      "login_title": "กรุณาเข้าสู่ระบบ",
      "login_text": "เข้าสู่ระบบเพื่อดูประวัติการบริจาคของคุณ",
      "login_label": "เข้าสู่ระบบ",
      "login_href": "/login",
      "empty_title": "ยังไม่มีประวัติการบริจาค",
      "empty_text": "ร่วมบริจาคแต้มเพื่อสนับสนุนโครงการดีๆ",
      "empty_cta_label": "ดูโครงการบริจาค",
      "empty_cta_href": "/",
      "today_label": "วันนี้",
      "yesterday_label": "เมื่อวาน",
      "items_suffix": "รายการ",
      "points_suffix": "แต้ม"
    }
  }
]'::jsonb, 'published', 1
FROM tenants t
ON CONFLICT (tenant_id, page_slug) DO NOTHING;
