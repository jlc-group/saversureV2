# Saversure V2 — Development Backlog

> เอกสาร Requirement & Backlog ฉบับสมบูรณ์
> เปรียบเทียบจาก V1 + ปรับปรุง + ฟีเจอร์ใหม่
>
> สร้างเมื่อ: 2026-03-04
> อัปเดตล่าสุด: 2026-03-05
> อ้างอิง: V1 repos (jlc-group), saversure-charter-v2.docx, batch-qr-creator-01

---

## สถานะปัจจุบันของ V2

### สิ่งที่ทำเสร็จแล้ว

| Module | Backend | Admin UI | Consumer UI | หมายเหตุ |
|--------|---------|----------|-------------|----------|
| Multi-Tenant | ✅ | ✅ | — | CRUD tenant, settings per tenant (JSONB) |
| Auth (JWT) | ✅ | ✅ | ✅ | Login (email+phone), Register, Consumer OTP Register, Refresh |
| Campaign CRUD | ✅ | ✅ | — | สร้าง/แก้ไข/list, publish API |
| Batch Create | ✅ | ✅ | — | Quantity-based, auto serial range, campaign dropdown |
| Batch Export (CSV) | ✅ | ✅ | — | Export แบบ roll/full, lot_size flexible |
| QR Code (HMAC) | ✅ | — | — | HMAC-SHA256 signing + validation |
| Ref1/Ref2 | ✅ | — | — | Obfuscated base36, checksum |
| QC Verify | ✅ | ✅ | — | Mobile-friendly QC page |
| Scan API | ✅ | — | ✅ | QR + ref1, quota, location, fraud check |
| Reward CRUD | ✅ | ✅ | ✅ | Rewards catalog + detail + tier restriction |
| Reward Inventory | ✅ | ✅ | — | Stock management, flash rewards |
| 2-Phase Redemption | ✅ | — | ✅ | Reserve → Confirm, row-level lock |
| Point Ledger | ✅ | ✅ | ✅ | Credit/debit/refund, balance, history |
| Coupon Code Pool | ✅ | ✅ | — | Bulk import, atomic claim |
| Audit Trail | ✅ | ✅ | — | Append-only audit log |
| Tenant Settings | ✅ | ✅ | — | code_export, scan_base_url, branding |
| Rate Limiting | ✅ | — | — | Per-endpoint + scan quota per day |
| Idempotency | ✅ | — | — | Redis-backed |
| Dashboard | ✅ | ✅ | — | Summary, charts, funnel, geo, activity |
| Scan History | ✅ | ✅ | — | List + filter + detail |
| Transactions | ✅ | ✅ | — | List, status update, export CSV |
| Customer Mgmt | ✅ | ✅ | — | List, search, detail page, refund |
| Staff & Roles | ✅ | ✅ | — | CRUD, role-based sidebar |
| Products | ✅ | ✅ | — | CRUD, points_per_scan, CSV import |
| Factories | ✅ | ✅ | — | CRUD, link to batches |
| Lucky Draw | ✅ | ✅ | ✅ | Campaigns, prizes, draw, register |
| News & Banner | ✅ | ✅ | ✅ | CRUD, published list, consumer view |
| Support/Ticket | ✅ | ✅ | ✅ | Cases, chat, status management |
| Donation | ✅ | ✅ | ✅ | Campaigns, donate, progress tracking |
| Point Currencies | ✅ | ✅ | ✅ | Multi-currency configurable |
| API Keys | ✅ | ✅ | — | Create (SHA256), revoke, delete |
| Webhooks | ✅ | ✅ | — | CRUD, test, HMAC delivery, logs |
| Gamification | ✅ | ✅ | ✅ | Missions, badges, leaderboard |
| Mission Engine | ✅ | — | — | Auto-track progress on events |
| Notification Engine | ✅ | — | ✅ | Auto-trigger on scan/redeem/donate |
| Notifications | ✅ | — | ✅ | In-app, unread count, mark read |
| Reward Tiers | ✅ | ✅ | ✅ | CRUD, user tier calculation |
| Branding | ✅ | ✅ | ✅ | Tenant-specific theming |
| OTP (SMS) | ✅ | — | ✅ | Ants provider, rate limiting |
| File Upload | ✅ | ✅ | — | MinIO, image/file upload components |
| Geolocation | ✅ | — | — | Reverse geocoding, backfill |
| Consumer Profile | ✅ | — | ✅ | Edit profile, addresses CRUD |
| Consumer Register | ✅ | — | ✅ | OTP + profile + PDPA |
| PDPA | ✅ | — | ✅ | Consent records, withdrawal |
| DB Indexes | ✅ | — | — | Performance indexes migration |
| Redis Cache | ✅ | — | — | Response caching middleware |
| Docker Prod | ✅ | — | — | docker-compose.prod.yml |

### V2 ข้อได้เปรียบเหนือ V1

1. **Multi-Tenant** — V1 single-tenant, V2 หลายแบรนด์
2. **QR Security (HMAC-SHA256)** — ปลอมแปลงไม่ได้
3. **Zero Oversell (2-phase)** — Row-level lock + atomic reserve
4. **Immutable Ledger** — ทุก transaction บันทึก
5. **Idempotency** — กัน duplicate redeem
6. **Flexible Settings per Tenant/Campaign**
7. **Gamification** — Missions, Badges, Leaderboard
8. **Multi-Currency Points** — Configurable per tenant
9. **Coupon Code Pool** — Atomic claim, bulk import
10. **Mission Engine** — Auto-track, auto-award
11. **Notification Engine** — Event-driven notifications
12. **API Keys & Webhooks** — External integration ready
13. **PDPA Compliance** — Consent records + withdrawal
14. **Docker Self-Hosted** — ประหยัดกว่า AWS ($202/mo → ~$50/mo)

### ตัดออกจาก V1

| Feature | เหตุผล |
|---------|--------|
| **Salepage** | ไม่ใช่ core loyalty |
| **Facebook Login** | LINE เป็นช่องทางหลัก |
| **Doc Convert** | Tool เฉพาะทาง |
| **Survey** | ใช้ external embed |
| **Thailand Post auto-sync** | Tracking manual ก็พอ |
| **Diamond Point hardcode** | แทนด้วย configurable point currencies (หลายสกุลพร้อมกัน + lifecycle) |

### เสร็จเพิ่ม (2026-03-05)

| Module | Backend | Admin UI | หมายเหตุ |
|--------|---------|----------|----------|
| Roll Lifecycle | ✅ | ✅ | Pipeline view, Map Product, QC approval + evidence, separation of duties |
| V1 Product Import | ✅ | — | 150 สินค้า import + cleaned |

---

## สิ่งที่ยังเหลือ (Requires External Dependencies)

### LINE Login / LIFF (ต้องการ LINE credentials)

**สถานะ:** ❌ รอ credentials

**งานที่ต้องทำ:**
- [ ] Backend: `POST /api/v1/auth/line` — verify LINE ID token → JWT
- [ ] Backend: LINE LIFF middleware
- [ ] Config: LIFF Channel ID, LIFF App URL per tenant
- [ ] Consumer: LIFF init + login flow
- [ ] Consumer: QR camera scanner via LIFF scanCode

### LINE Bot & Notify (ต้องการ LINE credentials)

**สถานะ:** ❌ รอ credentials

**งานที่ต้องทำ:**
- [ ] Backend: LINE Messaging API client
- [ ] Backend: LINE Notify → admin group alerts
- [ ] Admin UI: Send LINE from customer detail
- [ ] Consumer: LINE push notifications

### White-Label Consumer App

**สถานะ:** ❌ ต้องมี LINE OA per tenant + custom domain

**งานที่ต้องทำ:**
- [ ] Custom domain per tenant
- [ ] LIFF per tenant
- [ ] Tenant detection from domain/subdomain

---

## สิ่งที่ยังเหลือ (Nice-to-have / Future)

### Admin Enhancements
- [ ] Batch Status/Recall UI buttons
- [ ] Select factory/product during batch creation
- [ ] Bulk status update for transactions
- [ ] Export PDF delivery notes
- [ ] Admin notification bell + dropdown
- [ ] Brand admin scoped dashboard

### Consumer Enhancements
- [ ] QR camera scanner (native/LIFF)
- [ ] Deep link flow (scan QR → LIFF → auto-verify)
- [ ] Coupon display (QR/barcode)
- [ ] Flash reward countdown timer
- [ ] Auto-schedule flash rewards

### Backend Enhancements
- [ ] Leaderboard refresh job (cron)
- [ ] Fraud detection rules (real-time)
  - สแกนเกิน X ครั้ง/วัน → ระงับ
  - IP-based fraud detection
- [ ] Streaming CSV for large batch exports
- [ ] Rate limiting per tenant
- [ ] Tier rules configurable per tenant

### Phase 6 — Non-Functional (Ongoing)

**Done:**
- [x] Database indexing review (migration 011)
- [x] Redis caching middleware
- [x] Docker production config
- [x] PDPA consent flow
- [x] Health check endpoint
- [x] Structured JSON logging

**Remaining:**
- [ ] Unit tests — codegen, HMAC, ref1/ref2, ledger
- [ ] Integration tests — API endpoints
- [ ] Load testing — concurrent scan + redeem
- [ ] CI/CD (GitHub Actions)
- [ ] DB migration automation
- [ ] Prometheus metrics endpoint
- [ ] Sentry error tracking
- [ ] Uptime monitoring

---

## Database Migrations Summary

| # | File | Description |
|---|------|-------------|
| 001 | core_schema | tenants, users, user_roles, campaigns, batches, codes, rewards, etc. |
| 002 | lucky_draw | lucky_draw_campaigns, prizes, tickets, winners |
| 003 | news_support | news, support_cases, support_messages |
| 004 | products_factories | products, factories, batch FK links |
| 005 | donation_notification | donations, donation_histories, notifications |
| 006 | configurable_point_types | point_currencies, currency columns |
| 007 | api_keys_webhooks | api_keys, webhooks, webhook_logs |
| 008 | gamification | missions, user_missions, badges, user_badges, leaderboard |
| 009 | flash_reward_tiers | reward_tiers, flash columns, tenant branding |
| 010 | consumer_enhancements | user profile fields, user_addresses, coupon_codes, scan enhancements |
| 011 | performance_indexes | Performance indexes for all high-traffic tables |
| 012 | pdpa_deletion_requested | deletion_requested_at column on users |

---

## API Endpoints Summary

### Auth (Public)
```
POST   /api/v1/auth/register           — Email registration (admin)
POST   /api/v1/auth/register-consumer  — OTP + profile registration (consumer)
POST   /api/v1/auth/login              — Email login
POST   /api/v1/auth/login-phone        — Phone login
POST   /api/v1/auth/refresh            — Refresh token
POST   /api/v1/otp/request             — Request OTP
POST   /api/v1/otp/verify              — Verify OTP
```

### Admin APIs
```
— Dashboard —
GET    /api/v1/dashboard/summary
GET    /api/v1/dashboard/scan-chart
GET    /api/v1/dashboard/top-products
GET    /api/v1/dashboard/funnel
GET    /api/v1/dashboard/geo-heatmap
GET    /api/v1/dashboard/recent-activity

— Tenants —
POST/GET/PATCH  /api/v1/tenants

— Campaigns —
POST/GET/PATCH  /api/v1/campaigns
POST   /api/v1/campaigns/:id/publish

— Batches —
POST/GET  /api/v1/batches
GET    /api/v1/batches/:id/export
PATCH  /api/v1/batches/:id/status
POST   /api/v1/batches/:id/recall

— Rewards & Inventory —
POST/GET  /api/v1/rewards
PATCH  /api/v1/rewards/:id/inventory

— Transactions —
GET    /api/v1/redeem-transactions
PATCH  /api/v1/redeem-transactions/:id
GET    /api/v1/redeem-transactions/export

— Points —
GET    /api/v1/points/balance
GET    /api/v1/points/history
POST   /api/v1/points/refund

— Customers —
GET    /api/v1/customers
GET    /api/v1/customers/:id
GET    /api/v1/customers/:id/detail
PATCH  /api/v1/customers/:id

— Products —
CRUD   /api/v1/products
POST   /api/v1/products/import

— Factories, Staff, News, Support, Lucky Draw, Donations —
CRUD endpoints (all done)

— Currencies, API Keys, Webhooks, Gamification —
CRUD endpoints (all done)

— Tiers, Branding, Coupons —
CRUD endpoints (all done)

— Scan History, Audit —
GET endpoints (all done)

— Upload —
POST   /api/v1/upload/image
POST   /api/v1/upload/file

— Geo —
GET    /api/v1/geo/reverse
POST   /api/v1/geo/backfill
```

### Consumer (Public) APIs
```
GET    /api/v1/public/news
GET    /api/v1/public/lucky-draw
GET    /api/v1/public/donations
GET    /api/v1/public/missions
GET    /api/v1/public/leaderboard
GET    /api/v1/public/badges
GET    /api/v1/public/tiers
GET    /api/v1/public/branding
GET    /api/v1/public/rewards
GET    /api/v1/public/rewards/:id
```

### Consumer (Authenticated) APIs
```
POST   /api/v1/scan
POST   /api/v1/redeem
GET    /api/v1/my/balances
GET    /api/v1/my/missions
GET    /api/v1/my/badges
GET    /api/v1/my/tier
GET    /api/v1/my/pdpa
POST   /api/v1/my/pdpa/withdraw
POST   /api/v1/my/lucky-draw/:id/register
POST   /api/v1/my/donations/:id/donate
GET/PATCH  /api/v1/profile
CRUD   /api/v1/profile/addresses
GET    /api/v1/notifications
GET    /api/v1/notifications/unread-count
PATCH  /api/v1/notifications/:id/read
POST   /api/v1/notifications/read-all
CRUD   /api/v1/support/my-cases
```

---

---

## Roll Lifecycle Management (Done: 2026-03-05)

ระบบจัดการม้วนสติ๊กเกอร์ QR Code แบบ strict workflow เพื่อป้องกัน staff map product ผิด

**Workflow:** `pending_print → printed → mapped → qc_approved → distributed`

**กฎสำคัญ:**
- ลูกค้าสแกน QR ได้เฉพาะ roll ที่ผ่าน QC (`qc_approved` / `distributed`) เท่านั้น
- QC ต้องแนบรูปถ่ายหลักฐานถึงจะ approve ได้
- คนที่ map product กับคนที่ QC approve ต้องเป็นคนละคน (separation of duties)
- Bulk operations: Mark Printed, Map Product, Mark Distributed
- Backward compatible กับ batch เก่าที่ไม่มี rolls

**ไฟล์:**
- Migration: `013_rolls.up.sql`
- Backend: `internal/roll/service.go`, `handler.go`
- Frontend: `app/(admin)/rolls/page.tsx`
- แก้ไข: `batch/service.go` (auto-create rolls), `code/service.go` (roll status check), `qc/service.go` (roll info)

---

## Point System Design (V1 → V2 Migration Strategy)

### V1 มีอะไร

**3 ประเภทแต้มใน V1:**

| ประเภท | ลักษณะ | ตัวอย่าง |
|--------|--------|---------|
| **Point** (หลัก) | ได้ทุกครั้งที่สแกน, สะสมตลอด | สแกนแชมพู → ได้ 24 point |
| **Extra Point** | โบนัสชั่วคราว, ผูกช่วงเวลา | "1-31 มี.ค. สแกนสินค้า A ได้เพิ่ม 10 แต้ม" |
| **Diamond** | สกุลแยก, ผูกกิจกรรมพิเศษ | "สะสม Diamond แลกบัตร FAN MEET" |

**ปัญหาของ V1:**
1. Diamond มีแค่ประเภทเดียว → จัดกิจกรรม 2 อันพร้อมกันไม่ได้
2. Diamond ไม่มีวันหมดอายุ → กิจกรรมจบแล้ว Diamond ยังค้างอยู่
3. ไม่มีระบบ convert Diamond กลับเป็น Point เมื่อกิจกรรมจบ
4. Extra Point config อยู่ใน product level → ยากจะจัดการ

### V2 แนวทาง: Point หลัก + Campaign Promotions + Event Currencies

```
┌─────────────────────────────────────────────────────┐
│  Point (สกุลหลัก)                                    │
│  - ได้จาก products.points_per_scan                   │
│  - ไม่หมดอายุ                                        │
│  - ใช้แลกของรางวัลทั่วไป                              │
│  - accumulate_point → คำนวณระดับสมาชิก (Tier)         │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Promotional Bonus (แทน Extra Point)                 │
│  - ผูกกับ Campaign + ช่วงเวลา                        │
│  - "สแกนสินค้า A ช่วง 1-31 มี.ค. ได้เพิ่ม 10 point"  │
│  - เครดิตเป็น Point หลัก (ไม่ใช่สกุลแยก)              │
│  - จัดการผ่าน Campaign settings                       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Event Currencies (แทน Diamond — ปรับปรุง)            │
│  - สร้างได้หลายสกุลพร้อมกัน (Star, Diamond, etc.)    │
│  - ผูกกับ Campaign + มีวันหมดอายุ                     │
│  - เมื่อหมดอายุ: convert เป็น Point หรือหายไป          │
│  - ใช้แลกเฉพาะ Rewards ที่ผูกกับ Campaign นั้น        │
│  - ใช้ point_currencies table ที่มีอยู่แล้ว             │
└─────────────────────────────────────────────────────┘
```

### Migration Plan (V1 → V2)

**ข้อมูลลูกค้า:**
- `users.point` → credit เข้า V2 point_ledger (currency = 'point')
- `users.diamond_point` → convert เป็น Point ตามอัตราที่กำหนด (เช่น 1 Diamond = 10 Point)
  - เหตุผล: กิจกรรม Diamond V1 จบแล้ว ไม่มี reward ให้แลก
- `users.accumulate_point` → เก็บไว้ใน V2 user profile สำหรับ Tier calculation
- ลูกค้าต้องไม่รู้สึกสะดุด — ยอดแต้มหลังย้ายต้องเท่าเดิมหรือมากกว่า

**ข้อมูลสินค้า:** (เสร็จแล้ว)
- `products.points` → `products.points_per_scan` ✅
- `products.extra_points` / `diamond_point` → บันทึกไว้ใน description เพื่ออ้างอิง ✅

**สิ่งที่ต้องทำเพิ่ม:**
- [ ] กำหนดอัตราแปลง Diamond → Point (ต้องคุยกับเจ้าของ brand)
- [ ] Script migrate user balances: point + (diamond × rate)
- [ ] Script migrate scan history (เฉพาะที่จำเป็น)
- [ ] เพิ่ม lifecycle fields ใน point_currencies: `campaign_id`, `expires_at`, `expiry_action`
- [ ] Wire multi-currency เข้า ledger Credit/Debit (ส่ง currency parameter)
- [ ] Wire products.point_currency เข้า Scan flow
- [ ] Promotional Bonus Rules: campaign-level bonus points ตามช่วงเวลา

---

## WeOrder × SaversureV2 Integration (Future Roadmap)

### Business Goal

ผูกข้อมูลลูกค้าจาก e-commerce platform (WeOrder) กับระบบ loyalty (SaversureV2)
เพราะ platform e-commerce ไม่ให้ข้อมูลลูกค้าโดยตรง

### Concept

```
┌──────────────┐    QR in box    ┌──────────────────┐
│   WeOrder    │ ──────────────→ │   SaversureV2    │
│ (E-Commerce) │                 │   (Loyalty)      │
│              │                 │                  │
│ สั่งซื้อ      │   ลูกค้าสแกน    │ ได้แต้มฟรี        │
│ Order #1234  │   QR ในกล่อง    │ + ผูก identity    │
└──────────────┘                 └──────────────────┘
```

**Flow:**
1. ลูกค้าสั่งซื้อสินค้าผ่าน WeOrder
2. กล่องพัสดุมี QR code (print จาก SaversureV2 batch)
3. ลูกค้ารับของ → สแกน QR → ได้แต้มสะสมฟรี
4. ระบบ map: Order ID (WeOrder) ↔ Customer ID (SaversureV2)
5. ได้ข้อมูลลูกค้า: เบอร์โทร, ที่อยู่, พฤติกรรมซื้อ

### Technical Design (Draft)

**Phase 1: QR in Box (ง่ายสุด)**
- WeOrder สร้าง order → request QR จาก SaversureV2 batch
- แนบ QR ไปในกล่อง (print หรือ sticker)
- ลูกค้าสแกน → ได้แต้ม + ผูก order_ref ไว้ใน scan metadata
- ไม่ต้อง integrate API ลึก — แค่จอง serial range ให้ WeOrder

**Phase 2: Deep Integration (ถ้าต้องการ)**
- WeOrder webhook → SaversureV2: "Order confirmed, assign QR"
- SaversureV2 API → WeOrder: "Customer scanned, here's their profile"
- Shared customer identity (phone number as key)
- Cross-platform rewards: ซื้อของออนไลน์ ได้แต้มแลกของที่ร้าน

### สิ่งที่ต้องทำ
- [ ] Design: QR allocation flow (WeOrder requests batch/serial range)
- [ ] Backend: API endpoint สำหรับ allocate QR ให้ external system
- [ ] Backend: Scan metadata field เก็บ `source` + `order_ref`
- [ ] Backend: Webhook เมื่อลูกค้าสแกน → แจ้ง WeOrder
- [ ] WeOrder: Integration client เรียก SaversureV2 API
- [ ] Dashboard: แสดง scan source (e-commerce vs offline)

---

## Database Migrations Summary

| # | File | Description |
|---|------|-------------|
| 001 | core_schema | tenants, users, user_roles, campaigns, batches, codes, rewards, etc. |
| 002 | lucky_draw | lucky_draw_campaigns, prizes, tickets, winners |
| 003 | news_support | news, support_cases, support_messages |
| 004 | products_factories | products, factories, batch FK links |
| 005 | donation_notification | donations, donation_histories, notifications |
| 006 | configurable_point_types | point_currencies, currency columns |
| 007 | api_keys_webhooks | api_keys, webhooks, webhook_logs |
| 008 | gamification | missions, user_missions, badges, user_badges, leaderboard |
| 009 | flash_reward_tiers | reward_tiers, flash columns, tenant branding |
| 010 | consumer_enhancements | user profile fields, user_addresses, coupon_codes, scan enhancements |
| 011 | performance_indexes | Performance indexes for all high-traffic tables |
| 012 | pdpa_deletion_requested | deletion_requested_at column on users |
| 013 | rolls | rolls table, batch codes_per_roll, roll lifecycle indexes |

---

## V1 Production Reference

ดูไฟล์ `V1_PRODUCTION_REFERENCE.md` สำหรับข้อมูล:
- LINE credentials (Channel IDs, Tokens, LIFF IDs)
- SMS/OTP credentials (Ants)
- AWS services ที่ V1 ใช้
- V1 cost breakdown
