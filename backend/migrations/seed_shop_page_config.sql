-- Seed default "shop" page_config using Phase 6 sections
-- Pattern: same as Phase 1-5 (profile / history / home / rewards / missions)
-- Safe: uses ON CONFLICT DO NOTHING so existing configs are never overwritten
-- Idempotent: can be re-run safely
--
-- Sections order (matches visual order of old hard-coded /shop page):
--   1. shop_page_header — gradient header + title/subtitle
--   2. shop_links_list  — 5 default shop channels (admin เพิ่ม/ลบ/แก้ได้)
--
-- Seeds for EVERY existing tenant that does not yet have a 'shop' page_config.

BEGIN;

INSERT INTO page_configs (tenant_id, page_slug, sections, status, version)
SELECT
    t.id,
    'shop',
    '[
      {
        "id": "shop-page-header-default",
        "type": "shop_page_header",
        "order": 1,
        "visible": true,
        "props": {
          "title": "ช้อปออนไลน์",
          "subtitle": "เลือกซื้อสินค้าออนไลน์กับเราได้ที่นี่เลย"
        }
      },
      {
        "id": "shop-links-list-default",
        "type": "shop_links_list",
        "order": 2,
        "visible": true,
        "props": {
          "items": [
            {
              "icon_type": "shopee",
              "title": "Julaherb_officialshop",
              "link": "https://shopee.co.th/julaherb_officialshop",
              "border_color": "#EE4D2D"
            },
            {
              "icon_type": "lazada",
              "title": "Jula''s Herb",
              "link": "https://www.lazada.co.th/shop/julas-herb",
              "border_color": "#0F146D"
            },
            {
              "icon_type": "website",
              "title": "www.julaherbshop.com",
              "link": "https://www.julaherbshop.com",
              "border_color": "#3C9B4D"
            },
            {
              "icon_type": "line",
              "title": "ติดตะกร้าจุฬาเฮิร์บ (LINE OpenChat)",
              "link": "https://line.me/th/",
              "border_color": "#00B900"
            },
            {
              "icon_type": "line_admin",
              "title": "สั่งซื้อที่แอดมิน",
              "link": "https://line.me/R/ti/p/@julaherb",
              "border_color": "#00B900"
            }
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
--   DELETE FROM page_configs WHERE page_slug='shop' AND tenant_id='<tenant-uuid>';
-- Consumer /shop/page.tsx will then render <ShopFallback /> (old hard-coded layout).
