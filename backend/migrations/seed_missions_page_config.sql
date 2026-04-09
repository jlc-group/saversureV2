-- Seed default "missions" page_config using Phase 5 sections
-- Pattern: same as Phase 1-4 (profile / history / home / rewards)
-- Safe: uses ON CONFLICT DO NOTHING so existing configs are never overwritten
-- Idempotent: can be re-run safely
--
-- Sections order (matches visual order of old hard-coded /missions page):
--   1. missions_page_header — gradient header + title/subtitle
--   2. missions_tabs_list   — login CTA + tabs (all/completed) + list + claim modal
--
-- Seeds for EVERY existing tenant that does not yet have a 'missions' page_config.

BEGIN;

INSERT INTO page_configs (tenant_id, page_slug, sections, status, version)
SELECT
    t.id,
    'missions',
    '[
      {
        "id": "missions-page-header-default",
        "type": "missions_page_header",
        "order": 1,
        "visible": true,
        "props": {
          "title": "ภารกิจ",
          "subtitle": "ทำภารกิจรับคะแนนและ Badge"
        }
      },
      {
        "id": "missions-tabs-list-default",
        "type": "missions_tabs_list",
        "order": 2,
        "visible": true,
        "props": {
          "show_login_cta": true,
          "login_cta_text": "เข้าสู่ระบบเพื่อดูความคืบหน้าภารกิจ",
          "empty_all_text": "ยังไม่มีภารกิจปัจจุบัน",
          "empty_completed_text": "ยังไม่มีภารกิจที่สำเร็จแล้ว",
          "default_tab": "all",
          "show_claim_modal": true,
          "tabs": [
            { "id": "all",       "label": "ทั้งหมด" },
            { "id": "completed", "label": "สำเร็จแล้ว" }
          ]
        }
      }
    ]'::jsonb,
    'published',
    1
FROM tenants t
ON CONFLICT (tenant_id, page_slug) DO NOTHING;

COMMIT;

-- Rollback note: to reset a specific tenant back to fallback, run:
--   DELETE FROM page_configs WHERE page_slug='missions' AND tenant_id='<tenant-uuid>';
-- Consumer /missions/page.tsx will then render <MissionsFallback /> (old hard-coded layout).
