# Migration Log: saversurejulaherb (V1) → saversure (V2)

**วันที่ดำเนินการ:** 2026-04-03 ~ 2026-04-10 (ต่อเนื่อง)
**ผู้ดำเนินการ:** Super Admin + Claude AI Assistant
**Branch:** `dev/bugfixes-and-setup`
**สถานะ:** ✅ **Phase 1-3 เสร็จสมบูรณ์** | Phase 4+ รอดำเนินการ

---

## ผลลัพธ์สุดท้าย

| | V1 (เก่า) | V2 (ใหม่) | ลดลง |
|---|---:|---:|---:|
| **DB Size** | 12 GB | **6.1 GB** | 49% |
| Schema Migrations | - | 42 (001-041) | - |

### ข้อมูลที่ Migrate สำเร็จ (อัปเดต Phase 3 — 2026-04-10)

| ข้อมูล | V1 | V2 (ล่าสุด) | Success Rate |
|--------|---:|---:|:-----------:|
| Users | 819,185+ | **821,889** | 99%+ |
| Addresses | 41,577+ | **51,078** | ✅ |
| Point Ledger | — | **775,883** | ✅ |
| Products | 176 | **175** | 99.4% |
| Rewards | 154 | **161** | ✅ |
| Coupon Codes | — | 1,100+ | ✅ |
| Scan History | 12,094,802+ | **12,171,479** | 99%+ |
| — success | — | 11,036,049 | — |
| — duplicate_self | — | 925,442 | — |
| — duplicate_other | — | 209,988 | — |
| — มี V1 serial | — | 12,170,952 | 99.99% |
| Redeem History | 77,502 | **78,175** | ✅ |

### ข้อมูลที่ไม่ Migrate (ตั้งใจตัดออก)

| ข้อมูล | V1 ขนาด/จำนวน | เหตุผล |
|--------|-------------:|--------|
| QR Codes | 41.5M rows / 2.7 GB | V2 ใช้ HMAC stateless |
| Unregistered Scans | 5.1M rows / 2.1 GB | ไม่จำเป็น |
| JSONB location/device_info | ~3-4 GB | V2 เก็บ latitude/longitude + province แทน |
| FB integration | 176 คน | 0.02% ไม่คุ้มค่า |

### ข้อมูลที่เลือกไม่ Migrate (Phase 2 ถ้าต้องการ)

| ข้อมูล V1 | จำนวน | เหตุผล |
|-----------|------:|--------|
| Lucky Draw Campaigns | 57 | ต้องสร้าง runner ใหม่ (~2-3 วัน) |
| Lucky Draw Histories | 330,967 | ประวัติเก่า ไม่เชื่อมกับ V2 |
| News | 36 | สร้าง content ใหม่ง่ายกว่า |
| Support Cases | 3,369 | เคสเก่าปิดแล้ว |
| Support Messages | 11,322 | ข้อความในเคสเก่า |
| User Flag Histories | 15,006 | V2 เก็บ flag ปัจจุบันใน users.customer_flag แล้ว |
| Partner Shops | 1,237 | ต้องตัดสินใจว่าใช้ใน V2 ไหม |
| Staffs | 22 | V2 ใช้ user_roles สร้างใหม่ได้ |
| Settings | 7 | V2 ใช้ tenant.settings (JSONB) แทน |
| Donations/Histories | 0 | V1 ว่างเปล่า |

---

## Timeline ทั้งหมด

### Phase 0: เตรียมการ (2026-04-03 14:00-15:00)

| งาน | Commit |
|------|--------|
| ลบ .exe ออกจาก git + เพิ่ม .gitignore | `e57bff1` |
| แก้ API_BASE frontend fallback | `98e40ee` |
| Pull branch dev/bugfixes-and-setup | - |
| Schema Migration 038-040 | - |

### Phase 1: Data Migration (2026-04-03 15:00 ~ 2026-04-04 10:30)

| Module | เวลา | ผลลัพธ์ |
|--------|------|---------|
| Dry Run | 1 วินาที | ✅ estimated 1.6M items |
| **Customer** (Job 1) | 3 ชม. 19 นาที | 179K success (interrupted) |
| **Customer** (Retry) | 1 ชม. 33 นาที | ✅ 1.3M success |
| **Product** | < 1 นาที | ✅ 149 inserted |
| **Rewards** (5 attempts) | ~15 นาที | ✅ 153 inserted + 1,100 coupons |
| **Scan History** | ~3 ชม. | ✅ 11.2M inserted (0 failed!) |
| **Redeem History** | ~7 นาที | ✅ 76K inserted |

### Phase 2: Optimization & Cleanup (2026-04-04 ~ 2026-04-05)

| งาน | ผลลัพธ์ |
|------|---------|
| Batch scan_history (500 rows/tx) | เร็วขึ้น 16 เท่า |
| Fast customer skip (≥95%) | < 1 วินาทีแทน 40 นาที |
| ลบ entity_maps scan_history | ลด DB 5 GB |
| สร้าง Migration 041 | rewards constraint >= 0 |
| สร้าง Baseline Snapshot ใหม่ | `backup/v2_dev_baseline.dump` |

---

## Bugs ที่พบและแก้ไข (7 จุด)

### Bug 1: API_BASE frontend เป็น string ว่าง
- **ไฟล์:** `frontend/src/lib/api.ts` บรรทัด 1
- **Commit:** `98e40ee`

### Bug 2: rewards `images` column type mismatch
- **ปัญหา:** V1 `text` แต่ Go scan เป็น `[]string`
- **ไฟล์:** `backend/internal/migrationjob/runners.go`
- **Commit:** `3ac67d6`

### Bug 3: `upsertEntityMap` empty string UUID
- **ปัญหา:** ส่ง `""` เป็น jobID → UUID column reject
- **ไฟล์:** `backend/internal/migrationjob/service.go`
- **Commit:** `3ac67d6`

### Bug 4: `rewards_point_cost_check` constraint
- **ปัญหา:** V1 มี 2 rewards ที่ point = 0
- **แก้:** constraint `>= 0` + migration 041
- **Commit:** `5a69d26`

### Bug 5: `runRewards` ไม่มี `rows.Err()` check
- **Commit:** `3ac67d6`

### Bug 6: Error messages ไม่ระบุจุดที่ fail
- **Commit:** `3ac67d6`

### Bug 7: scan_history ช้ามาก (50 ชม.)
- **สาเหตุ:** 1 row/transaction + DB query duplicate check ทุก row
- **แก้:** batch 500 rows/tx + in-memory duplicate map + fast customer skip
- **ผลลัพธ์:** เร็วขึ้น 16 เท่า (3.6K → 57K rows/นาที)
- **Commit:** `5a69d26`

---

## Commits ทั้งหมด (บน dev/bugfixes-and-setup)

| Commit | Message |
|--------|---------|
| `e57bff1` | chore: remove Go binaries from git and add *.exe to .gitignore |
| `98e40ee` | fix: restore API_BASE fallback to localhost:30400 for frontend |
| `3ac67d6` | fix(migration): resolve rewards module bugs + add migration log |
| `5a69d26` | feat(migration): batch scan_history, fast customer skip, migration 041 |

---

## Migration Jobs History (13 jobs)

| # | Mode | Modules | Status | Success | Failed |
|---|------|---------|:------:|--------:|-------:|
| 1 | dry_run | customer,product,rewards | ✅ | 0 | 0 |
| 2 | execute | customer | ✅ (11%) | 179,235 | 1,165 |
| 3 | execute | customer (retry) | ✅ | 1,326,464 | 16,000 |
| 4 | execute | product,rewards | ❌ | 149 | 4 |
| 5-8 | execute | rewards | ❌ x4 | 0 | 0 |
| 9 | execute | rewards | ✅ | 153 | 1 |
| 10 | execute | scan_history (slow) | ❌ cancelled | 303K | 0 |
| 11 | execute | scan_history (slow v2) | ❌ cancelled | - | - |
| 12 | execute | **scan_history (batch)** | **✅** | **11,244,988** | **0** |
| 13 | execute | **redeem_history** | **✅** | **76,176** | **1** |

---

## Infrastructure

| Service | Status | Port |
|---------|:------:|------|
| saversure-postgres | ✅ | 5433 |
| saversure-redis | ✅ | 6379 |
| saversure-nats | ✅ | 4222 |
| saversure-minio | ✅ | 59300 |
| saversure-api-prod (PM2) | ✅ | 30400 |
| saversure-admin-prod (PM2) | ✅ | 30401 |
| saversure-consumer-prod (PM2) | ✅ | 30403 |

---

## Phase 3: V1 Live Sync + Backfill + UI (2026-04-10)

**สถานะ:** ✅ เสร็จสมบูรณ์
**แนวทาง:** เปลี่ยนจาก dump-based มาเป็น **V1 Live Sync** (incremental sync จาก AWS RDS) + **gap-only migration** (ไม่ reset baseline)

### ผลลัพธ์ Phase 3

| ข้อมูล | ก่อน Phase 3 | หลัง Phase 3 | เพิ่มขึ้น |
|--------|---:|---:|---:|
| Users | 810,918 | 821,889 | +10,971 |
| Addresses | 40,563 | 51,078 | +10,515 |
| Scan History | ~11.9M | 12,171,479 | +~270K |
| Point Ledger | 765,485 | 775,883 | +10,398 |
| Products | 150 | 175 | +25 |
| Rewards | 153 | 161 | +8 |
| Reward Reservations | 2 | 78,175 | +78,173 |
| Entity Maps | ~12M | 12,291,862 | - |

### Scan History Breakdown

| Scan Type | จำนวน |
|-----------|---:|
| success | 11,036,049 |
| duplicate_self | 925,442 |
| duplicate_other | 209,988 |
| **รวม** | **12,171,479** |
| มี legacy serial | 12,170,952 (99.99%) |

### Point Ledger Breakdown

| Reference Type | จำนวน |
|----------------|---:|
| v1_migration (Phase 1) | 775,828 |
| v1_live_sync_balance (Phase 3) | 42 |
| scan (V2 native) | 9 |
| promo_bonus | 2 |
| redemption | 2 |

### V1 Live Sync State

| Entity | Watermark (last_synced_id) | Updated |
|--------|---:|---|
| user | 849,526 | 2026-04-10 08:10 UTC |
| scan_history | 12,171,755 | 2026-04-10 08:10 UTC |

### งานที่ทำใน Phase 3

| งาน | ผลลัพธ์ |
|------|---------|
| สร้าง V1 Live Sync service | `backend/internal/v1sync/` — watermark-based incremental sync |
| เพิ่ม legacy fields ใน scan_history | 8 columns: serial, product name/sku/image, qr_code_id, status, verify_method |
| Backfill scan serial จาก V1 | 12.17M rows ← V1 Live (AWS RDS) + V1 backup |
| Backfill user point snapshots | 42 users ← V1 Live (point > 0 ที่ยังไม่มี ledger) |
| Dual-source point balance | COALESCE(ledger, scan_history - redemptions) |
| ปรับ customer detail UI | stats cards + rich scan history + V1/V2 badges |
| ปรับ scan history admin UI | เพิ่ม serial column + legacy info modal |
| Optimize scan history query | CTE-based sort → ~50ms จาก ~2s |
| สร้าง workspace rule | `.cursor/rules/saversure-v2.mdc` |
| สร้าง migration skill | `saversure-v1v2-migration/SKILL.md` |

### Backfill Tools ที่สร้างใหม่

| Tool | Path | หน้าที่ |
|------|------|--------|
| backfillv1scanserial | `backend/cmd/backfillv1scanserial/` | เติม legacy_qr_code_serial จาก V1 ให้ scan_history |
| backfillv1userpoints | `backend/cmd/backfillv1userpoints/` | เติม point_ledger snapshot จาก V1 users.point |

### Bugs ที่พบและแก้ใน Phase 3

| # | ปัญหา | แก้ไข |
|---|-------|------|
| 8 | V1 scan query ใช้ `h.lat` ไม่มี → ต้องใช้ `h.location->>'latitude'` | แก้ SQL ใน v1sync |
| 9 | INSERT scan ใช้ `points_awarded` → column ชื่อ `points_earned` | แก้ column name |
| 10 | INSERT scan ใช้ `created_at` → column ชื่อ `scanned_at` | แก้ column name |
| 11 | syncUserBatch advance watermark แม้ upsert fail | แก้ให้ advance เฉพาะ success |
| 12 | syncScanBatch ไม่ atomic (insert scan แล้ว fail mapping) | ครอบ transaction |
| 13 | backfillv1scanserial updated=0 เพราะ pagination ผิด | แก้ afterSourceID logic |
| 14 | point_ledger CHECK amount > 0 → fail สำหรับ V1 user ที่ point=0 | filter point > 0 |
| 15 | scan history หน้า admin ช้า ~2s | CTE query + remove NULLS LAST |

---

## ต้องทำต่อ (Phase 4+)

### 🔄 กำลังพิจารณา
- [ ] เปิด V1 กลับมารัน + V2 Live Sync ดึงข้อมูลล่าสุดต่อเนื่อง
- [ ] QR V1 compatibility layer (redirect V1 QR → V2 backend)

### ⏳ Phase ถัดไป
- [ ] QR dataset import (`saversure_legacy_qrcodes_only.dump`)
- [ ] ทดสอบ Frontend Consumer (LINE login, คะแนน, แลกรางวัล)
- [ ] ทดสอบ Admin Dashboard ครบทุก section
- [ ] พิจารณา Lucky Draw migration (57 campaigns + 330K histories)
- [ ] พิจารณา Partner Shops migration (1,237 ร้าน)
- [ ] พิจารณา News migration (36 บทความ)
