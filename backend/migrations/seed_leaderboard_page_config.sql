-- Seed default page_config for /leaderboard page
-- Idempotent: ON CONFLICT DO NOTHING skips tenants that already have a config

INSERT INTO page_configs (tenant_id, page_slug, sections, status, version)
SELECT t.id, 'leaderboard', '[
  {
    "id": "leaderboard-page-header-default",
    "type": "leaderboard_page_header",
    "order": 1,
    "visible": true,
    "props": {
      "title": "อันดับ",
      "subtitle": "ดูอันดับการสแกน"
    }
  },
  {
    "id": "leaderboard-list-default",
    "type": "leaderboard_list",
    "order": 2,
    "visible": true,
    "props": {
      "category": "scan",
      "limit": 20,
      "weekly_label": "รายสัปดาห์",
      "monthly_label": "รายเดือน",
      "all_time_label": "ตลอดกาล",
      "score_suffix": "pts",
      "you_suffix": " (คุณ)",
      "login_required_text": "เข้าสู่ระบบเพื่อดูอันดับของคุณ",
      "login_label": "เข้าสู่ระบบ",
      "login_href": "/login",
      "empty_text": "ยังไม่มีข้อมูลอันดับ",
      "error_fallback_text": "โหลดไม่สำเร็จ"
    }
  }
]'::jsonb, 'published', 1
FROM tenants t
ON CONFLICT (tenant_id, page_slug) DO NOTHING;
