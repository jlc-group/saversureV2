-- Seed default page_config for /badges page
-- Idempotent: ON CONFLICT DO NOTHING skips tenants that already have a config

INSERT INTO page_configs (tenant_id, page_slug, sections, status, version)
SELECT t.id, 'badges', '[
  {
    "id": "badges-page-header-default",
    "type": "badges_page_header",
    "order": 1,
    "visible": true,
    "props": {
      "title": "Badge",
      "subtitle": "สะสม Badge จากภารกิจและกิจกรรม"
    }
  },
  {
    "id": "badges-grid-default",
    "type": "badges_grid",
    "order": 2,
    "visible": true,
    "props": {
      "login_required_text": "เข้าสู่ระบบเพื่อดู Badge ที่ได้รับ",
      "login_label": "เข้าสู่ระบบ",
      "login_href": "/login",
      "empty_text": "ยังไม่มี Badge",
      "error_fallback_text": "โหลดไม่สำเร็จ",
      "earned_label": "ได้รับแล้ว",
      "not_earned_label": "ยังไม่ได้รับ"
    }
  }
]'::jsonb, 'published', 1
FROM tenants t
ON CONFLICT (tenant_id, page_slug) DO NOTHING;
