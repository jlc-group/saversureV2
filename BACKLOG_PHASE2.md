# SaversureV2 — Phase 2 Backlog: Super CRM + Marketplace

> สร้างเมื่อ: 2026-03-17
> สถานะ: รอดำเนินการ (หลังจาก Phase 1 เสร็จ)

---

## Phase 2A: Super CRM Features (ประมาณ 3 เดือน)

### Customer Segmentation Engine
- [ ] สร้าง DB tables: `segments`, `segment_rules`, `segment_members`
- [ ] สร้าง Backend: `internal/segment/` — service, handler, rule evaluator
- [ ] สร้าง Admin UI: Segment builder (drag-drop conditions)
- [ ] Segment preview + member count
- [ ] ตัวอย่าง segment: "ลูกค้า Gold ที่ไม่ scan มา 30 วัน"

### Customer Journey & Lifecycle
- [ ] สร้าง lifecycle stages: new → active → loyal → at-risk → churned
- [ ] Auto-assign stage based on activity patterns (cron job)
- [ ] Admin UI: Lifecycle funnel visualization
- [ ] Stage-specific actions / triggers

### Marketing Automation
- [ ] สร้าง DB: `automations`, `automation_steps`, `automation_logs`
- [ ] สร้าง Backend: `internal/automation/` — event listener via NATS + scheduler
- [ ] Triggers: สมัคร, ไม่ scan X วัน, ครบรอบ, tier เปลี่ยน
- [ ] Actions: ส่ง notification, ให้ bonus points, assign badge, ส่ง coupon
- [ ] Admin UI: Visual workflow builder

### Advanced Analytics Dashboard
- [ ] Customer retention rate chart
- [ ] CLV (Customer Lifetime Value) calculation
- [ ] Cohort analysis
- [ ] Revenue per campaign
- [ ] Redemption conversion rate
- [ ] Scan frequency heatmap
- [ ] Export PDF reports
- [ ] Date range picker + comparison

### Communication Hub
- [ ] สร้าง DB: `message_templates`, `message_campaigns`, `message_logs`
- [ ] สร้าง Backend: `internal/messaging/` — queue via NATS
- [ ] SMS integration (ThaiBulkSMS / Twilio)
- [ ] Email integration (SendGrid / SES)
- [ ] LINE push message integration
- [ ] In-app notification (มีอยู่แล้ว → ขยาย)
- [ ] Template management + personalization ({{name}}, {{points}})
- [ ] Scheduling + audience picker (from segments)

### Customer Feedback & NPS
- [ ] สร้าง DB: `surveys`, `survey_responses`
- [ ] สร้าง Backend: `internal/feedback/`
- [ ] NPS surveys
- [ ] Post-redemption feedback
- [ ] Product reviews / star rating
- [ ] Consumer UI: In-app survey modal
- [ ] Admin UI: Survey builder + response analytics

---

## Phase 2B: Marketplace Features (ประมาณ 3 เดือน)

### Product Catalog Enhancement
- [ ] สร้าง DB: `categories`, `product_variants`, `product_attributes`, `product_images`
- [ ] Categories / subcategories tree
- [ ] Product variants (size, color, etc.)
- [ ] Product attributes (weight, material, etc.)
- [ ] Multiple images gallery per product
- [ ] Rich text product descriptions
- [ ] SKU management + barcode
- [ ] Admin UI: Product management + drag-sort images + variant matrix

### Shopping Cart & Wishlist
- [ ] สร้าง cart system (Redis-based)
- [ ] Consumer UI: Cart page, mini-cart in header, cart badge
- [ ] Add to cart, quantity update, remove
- [ ] Cart persistence across sessions
- [ ] สร้าง DB: `wishlists`
- [ ] Consumer UI: Wishlist / favorites page

### Checkout & Payment Gateway
- [ ] Multi-step checkout flow (cart → shipping → payment → confirm)
- [ ] สร้าง DB: `orders`, `order_items`, `payments`, `shipping_rates`
- [ ] Payment: Points only (ขยายจากที่มี)
- [ ] Payment: PromptPay QR
- [ ] Payment: Credit card (Omise / Stripe)
- [ ] Payment: Hybrid (points + cash)
- [ ] Shipping calculation
- [ ] Promo code / coupon apply at checkout
- [ ] Payment confirmation + receipt

### Order Management System
- [ ] Order lifecycle: pending → paid → processing → shipped → delivered → completed/returned
- [ ] Admin UI: Order list + filters + bulk status update
- [ ] Admin UI: Order detail with timeline
- [ ] Consumer UI: My orders page
- [ ] Consumer UI: Order tracking
- [ ] Shipping label generation
- [ ] Refund management
- [ ] Return/exchange flow
- [ ] สร้าง DB: `order_status_history`, `returns`

### Seller/Vendor Module (Optional)
- [ ] สร้าง DB: `vendors`, `vendor_products`, `vendor_payouts`, `commissions`
- [ ] Vendor registration flow
- [ ] Vendor dashboard
- [ ] Product listing by vendor
- [ ] Commission settings
- [ ] Payout reports

### Promotion Engine Enhancement
- [ ] Discount codes (% off, fixed amount, free shipping)
- [ ] Bundle deals (buy X get Y)
- [ ] Flash sales with countdown timer
- [ ] Cart-level promotions
- [ ] สร้าง Backend: `internal/promo/` — rule engine

---

## Phase 2C: Intelligence & Advanced (ประมาณ 3 เดือน)

### AI-Powered Recommendations
- [ ] Product recommendations based on history
- [ ] "Customers also liked" / "Recommended for you"
- [ ] Personalized home page content

### Predictive Analytics
- [ ] Churn prediction model
- [ ] Next best action recommendation
- [ ] Optimal send time for communications

### Advanced Reporting
- [ ] Custom report builder (drag-drop)
- [ ] Scheduled report delivery (email PDF)
- [ ] White-label reports for brand partners

### Referral Program
- [ ] Referral code generation per customer
- [ ] Referral tracking + rewards (referrer + referee)
- [ ] Referral leaderboard
- [ ] Admin UI: Referral settings + analytics

### Multi-Language Support (i18n)
- [ ] Thai (มีอยู่แล้ว)
- [ ] English
- [ ] Chinese
- [ ] Language switching in consumer app
- [ ] Admin content management per language

---

## Infrastructure Additions Required

- [ ] Elasticsearch (product search, analytics)
- [ ] Payment Gateway SDK (Omise / Stripe)
- [ ] SMS Gateway (ThaiBulkSMS / Twilio)
- [ ] Email Service (SendGrid / SES)
- [ ] Job Scheduler (cron for automation workflows)
- [ ] CDN (CloudFront / Cloudflare for product images)

## New DB Tables Estimate: ~25 tables
```
CRM:      segments, segment_rules, automations, automation_steps,
          automation_logs, message_templates, message_campaigns,
          message_logs, surveys, survey_responses

Market:   categories, product_variants, product_attributes,
          product_images, carts, cart_items, wishlists, orders,
          order_items, order_status_history, payments,
          shipping_rates, returns, vendors, vendor_payouts,
          commissions, promo_codes
```
