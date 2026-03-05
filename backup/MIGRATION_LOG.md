# Saversure V1 → V2 Migration Log

บันทึกรวมทุกครั้งที่ migrate ข้อมูลจาก V1 (PostgreSQL on AWS RDS) มาที่ V2 (local Docker)

---

## Migration #1: Customer Master Data

**วันที่**: 5 มีนาคม 2569 (2026-03-05)
**Script**: `migrate_customers_v1_to_v2.py`
**Migration SQL**: `backend/migrations/017_customer_v1_fields.up.sql`

### สิ่งที่ Migrate

| ข้อมูล | V1 Table | V2 Table | จำนวน Records |
|--------|----------|----------|---------------|
| ลูกค้า | `users` | `users` + `user_roles` | 810,915 |
| ที่อยู่ | `user_address` | `user_addresses` | 40,562 |
| คะแนนเริ่มต้น | `users.point` | `point_ledger` | 765,473 entries (40.6M pts) |

### Field Mapping: V1 `users` → V2 `users`

| V1 Field | V2 Field | หมายเหตุ |
|----------|----------|----------|
| `id` (bigint) | `v1_user_id` (bigint) | เก็บไว้ cross-reference |
| — | `id` (UUID) | สร้าง UUID ใหม่ |
| `name` | `first_name` | truncate ≤100 chars |
| `surname` | `last_name` | truncate ≤100 chars |
| `name` + `surname` | `display_name` | truncate ≤255 chars |
| `email` | `email` | ถ้าว่าง/ยาว → `v1_{id}@migrated.saversure.local` |
| `telephone` | `phone` | truncate ≤20 chars |
| `birth_date` | `birth_date` | ตรงๆ |
| `gender` (หญิง/ชาย/LGBTQ) | `gender` (female/male/other) | map ค่า |
| `profile_image` | `avatar_url` | ตรงๆ |
| `line_user_id` | `line_user_id` | ตรงๆ |
| `province` | `province` | **ฟิลด์ใหม่ที่เพิ่ม** |
| `occupation` | `occupation` | **ฟิลด์ใหม่ที่เพิ่ม** |
| `flag` (1/91/93/201) | `customer_flag` (green/yellow/black/gray) | **ฟิลด์ใหม่ที่เพิ่ม**, map ค่า |
| `status` (0/3) | `status` (active/deleted) | map ค่า |
| — | `password_hash` | placeholder (ใช้ LINE login) |
| — | `tenant_id` | `00000000-0000-0000-0000-000000000001` |
| — | `user_roles.role` | `api_client` ทุกคน |

### ฟิลด์ V1 ที่ข้ามไม่นำมา

| V1 Field | เหตุผล |
|----------|--------|
| `fb_email`, `fb_user_id`, `fb_name`, `fb_profile_image` | มีแค่ 176 คน (0.02%) |
| `store` | มีแค่ 6,237 คน (0.7%) |
| `member_level` | ทั้งหมดเป็น 0 (ไม่มีข้อมูล) |
| `accumulate_point` | ทั้งหมดเป็น 0 |
| `country_code`, `country_name` | ทั้งหมดเป็นไทย |
| `location` | ข้อมูลคลุมเครือ |
| `diamond_point` | จะ migrate ทีหลังผ่าน point_currencies |

### Field Mapping: V1 `user_address` → V2 `user_addresses`

| V1 Field | V2 Field | หมายเหตุ |
|----------|----------|----------|
| `user_id` (bigint) | `user_id` (UUID) | ใช้ id_map แปลง |
| `recipient_name` | `recipient_name` | truncate ≤200 chars |
| `recipient_address` | `address_line1` | ตรงๆ |
| `sub_district` | `sub_district` | ตรงๆ |
| `district` | `district` | ตรงๆ |
| `province` | `province` | ตรงๆ |
| `postcode` | `postal_code` | truncate ≤10 chars |
| `telephone` | `phone` | truncate ≤20 chars |
| `is_default` | `is_default` | ตรงๆ |
| — | `label` | default `'home'` |
| — | `tenant_id` | `00000000-0000-0000-0000-000000000001` |

### Point Balance Migration

- ลูกค้าที่มี `point > 0` จาก V1 → สร้าง `point_ledger` entry ประเภท `credit`
- `reference_type` = `'v1_migration'`, `reference_id` = V1 user ID
- `balance_after` = จำนวน point ตั้งต้น

### ปัญหาที่เจอ + วิธีแก้

| ปัญหา | สาเหตุ | วิธีแก้ |
|-------|--------|--------|
| `value too long for VARCHAR(255)` | V1 email บางคนยาว 3,596 chars | ถ้า email > 250 chars → ใช้ placeholder |
| `value too long for VARCHAR(100)` | V1 surname บางคนยาว 112 chars | truncate ทุก string field |
| `value too long for VARCHAR(20)` | V1 address phone ยาว 26 chars | truncate phone ≤20 chars |
| Phase 2/3 skip เกือบหมด | `id_map` มีแค่ batch ใหม่ | rebuild full id_map จาก DB ก่อน Phase 2/3 |
| Address duplicates | Phase 2 รันซ้ำ 2 รอบ | cleanup ด้วย `ROW_NUMBER() OVER (PARTITION BY ...)` |

### สถิติผลลัพธ์

| Metric | จำนวน |
|--------|-------|
| Users migrated | 810,915 |
| Addresses migrated | 40,562 |
| Point entries created | 765,473 |
| Total points migrated | 40,657,147 pts |
| Users without email (placeholder) | ~73,114 |
| Migration time (users) | ~3 นาที |
| Migration time (points) | ~2 นาที |

---

## ยังไม่ได้ Migrate (TODO)

| ข้อมูล V1 | V1 Table | ขนาดโดยประมาณ | หมายเหตุ |
|-----------|----------|---------------|----------|
| QR Codes | `qrcodes` | 151 GB | ข้ามในการ dump — ข้อมูลใหญ่มาก |
| Scan History | `qrcode_scan_history` | 9 GB | ข้ามในการ dump |
| Reward Redemptions | `reward_redeem_histories` | TBD | |
| Donation History | `donation_histories` | TBD | |
| Lucky Draw | `lucky_draw_histories` | TBD | |
| Support Cases | `support_cases` | TBD | |
| Flag History | `user_flag_histories` | TBD | |
| Campaigns/Content | หลายตาราง | TBD | ดู `v1_campaigns_content.sql` |
