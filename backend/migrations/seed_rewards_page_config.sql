-- Seed default "rewards" page_config using Phase 4 sections
-- Pattern: same as Phase 1-3 (profile / history / home)
-- Safe: uses ON CONFLICT DO NOTHING so existing configs are never overwritten
-- Idempotent: can be re-run safely
--
-- Sections order (matches visual order of old hard-coded /rewards page):
--   1. rewards_page_header  — gradient header + balance pills
--   2. rewards_tabs_grid    — tabs (julaherb/premium/lifestyle) + rewards grid
--   3. rewards_history_cta  — link to /history/redeems (hide if guest)
--
-- Seeds for EVERY existing tenant that does not yet have a 'rewards' page_config.

BEGIN;

INSERT INTO page_configs (tenant_id, page_slug, sections, status, version)
SELECT
    t.id,
    'rewards',
    '[
      {
        "id": "rewards-page-header-default",
        "type": "rewards_page_header",
        "order": 1,
        "visible": true,
        "props": {
          "title": "🎁 แลกรางวัล",
          "subtitle": "แลกของรางวัลและสิทธิพิเศษ",
          "show_balance": true
        }
      },
      {
        "id": "rewards-tabs-grid-default",
        "type": "rewards_tabs_grid",
        "order": 2,
        "visible": true,
        "props": {
          "limit": 50,
          "default_tab": "julaherb",
          "show_flash_badge": true,
          "show_stock_warning": true,
          "empty_message": "ยังไม่มีของรางวัลในหมวดนี้",
          "tabs": [
            { "id": "julaherb",  "label": "สินค้าจุฬาเฮิร์บ", "icon": "🌱",  "filter_type": "product"   },
            { "id": "premium",   "label": "สินค้าพรีเมียม",    "icon": "💎",  "filter_type": "premium"   },
            { "id": "lifestyle", "label": "ไลฟ์สไตล์",          "icon": "🎟️", "filter_type": "lifestyle" }
          ]
        }
      },
      {
        "id": "rewards-history-cta-default",
        "type": "rewards_history_cta",
        "order": 3,
        "visible": true,
        "props": {
          "title": "ประวัติการแลกรางวัล",
          "subtitle": "ดูสถานะการจัดส่งและคูปอง",
          "link": "/history/redeems",
          "hide_if_guest": true
        }
      }
    ]'::jsonb,
    'published',
    1
FROM tenants t
ON CONFLICT (tenant_id, page_slug) DO NOTHING;

COMMIT;

-- Rollback note: to reset a specific tenant back to fallback, run:
--   DELETE FROM page_configs WHERE page_slug='rewards' AND tenant_id='<tenant-uuid>';
-- Consumer /rewards/page.tsx will then render <RewardsFallback /> (old hard-coded layout).
