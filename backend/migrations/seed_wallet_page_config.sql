-- Seed default "wallet" page_config using Phase 8 sections
-- Pattern: same as Phase 2-6 (profile / history / home / rewards / missions / shop)
-- Safe: uses ON CONFLICT DO NOTHING so existing configs are never overwritten
-- Idempotent: can be re-run safely
--
-- Sections order (matches visual order of old hard-coded /wallet page):
--   1. wallet_page_header      — gradient header + title/subtitle
--   2. wallet_balance_cards    — primary + secondary balance cards (uses useCurrencies)
--   3. wallet_transaction_list — ledger list + currency filter + infinite scroll
--
-- Seeds for EVERY existing tenant that does not yet have a 'wallet' page_config.

BEGIN;

INSERT INTO page_configs (tenant_id, page_slug, sections, status, version)
SELECT
    t.id,
    'wallet',
    '[
      {
        "id": "wallet-page-header-default",
        "type": "wallet_page_header",
        "order": 1,
        "visible": true,
        "props": {
          "title": "กระเป๋าเงิน",
          "subtitle": "ยอดคงเหลือทั้งหมดของคุณ"
        }
      },
      {
        "id": "wallet-balance-cards-default",
        "type": "wallet_balance_cards",
        "order": 2,
        "visible": true,
        "props": {
          "show_earned_spent": true,
          "show_secondary": true,
          "empty_state_text": "เข้าสู่ระบบเพื่อดูกระเป๋าเงินของคุณ",
          "not_logged_in_title": "กรุณาเข้าสู่ระบบ",
          "no_balance_title": "ยังไม่มียอดคงเหลือ",
          "no_balance_text": "สแกนคิวอาร์โค้ดเพื่อเริ่มสะสมแต้ม",
          "no_balance_cta_text": "สแกนสะสมแต้ม"
        }
      },
      {
        "id": "wallet-transaction-list-default",
        "type": "wallet_transaction_list",
        "order": 3,
        "visible": true,
        "props": {
          "title": "ประวัติธุรกรรม",
          "page_size": 30,
          "show_currency_filter": true,
          "empty_text": "ยังไม่มีธุรกรรม",
          "filter_all_label": "ทั้งหมด"
        }
      }
    ]'::jsonb,
    'published',
    1
FROM tenants t
ON CONFLICT (tenant_id, page_slug) DO NOTHING;

COMMIT;

-- Rollback note: to reset a specific tenant back to fallback, run:
--   DELETE FROM page_configs WHERE page_slug='wallet' AND tenant_id='<tenant-uuid>';
-- Consumer /wallet/page.tsx will then render <WalletFallback /> (old hard-coded layout).
