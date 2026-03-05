# SaverSure V1 Production Reference

> ข้อมูลอ้างอิงจาก V1 Production บน AWS (Account: JlcGroup 770138902588)
> สรุปจาก: `SaverSure_AWS_Summary.docx` — March 4, 2026

---

## 1. Production URLs

| Service | URL |
|---------|-----|
| Frontend (Consumer) | `https://julaherb.saversure.com` |
| Admin Web | `https://admin-web.julaherb.saversure.com` |
| Salepage Frontend | `https://julaherb.co` |
| CDN (CloudFront) | `cdn.julaherb.saversure.com` |
| QR Code Verify | `https://qr.saversure.com/scan` |

**Internal Services (V1):**
| Service | URL |
|---------|-----|
| LINE Bot | `http://ss-linebot.saversure.local:8082` |
| IP2Geolocation | `http://ss-ip2geolocation.saversure.local:8000` |
| LINE Social API | `https://api.line.me` |

---

## 2. SMS/OTP Provider (Ants / Britz)

- **Provider:** [Britz Communication Platform](https://service.ants.co.th)
- **API Docs:** https://apidoc.ants.co.th/
- **API Host:** `https://api-service.ants.co.th`
- **Auth:** Basic Auth (Base64 of `username:password`)
- **Account:** Julaherb_Thailand (Credit Balance: ~179,939)

**OTP Configs (บน Britz Portal):**

| OTC ID | App Name | Pin | Expire | Status |
|--------|----------|-----|--------|--------|
| `aa869e2b-356b-43e4-9854-e9385f71f3df` | SaverSure-Julaherb-... | 6 | 300s | Active |
| `633904b9-3ac3-4beb-8ecc-b81cc76e3be4` | SaverSure Julaherb ... | 6 | 300s | Active |

**V1 Production ใช้ OTC ID:** `633904b9-3ac3-4beb-8ecc-b81cc76e3be4`

**API Endpoints (จาก V1 legacy code):**
```
POST /otp/requestOTP    — ส่ง OTP ไปเบอร์มือถือ (body: {otcId, mobile})
POST /otp/resendOTP     — ส่ง OTP ซ้ำ (body: {otpId})
POST /otp/verifyOTP     — ตรวจสอบ OTP (body: {otpId, otpCode})
POST /sms/send          — ส่ง SMS (body: {messages: [{from, text, destinations}]})
POST /account/balance   — ดู credit balance
GET  /sms/senderList    — ดู sender names
```

**Env Keys:** `SMS_HOST`, `SMS_USERNAME`, `SMS_PASSWORD`, `SMS_OTP_OTC_ID`
**Credentials:** เก็บไว้ที่ `D:\Dev\run\saversureV2\.env.dev` (ห้าม commit!)

**หมายเหตุ:** ถ้า Ants API คืน 401 ให้ตรวจสอบว่า password ถูกต้อง (ตัวอักษรพิเศษเช่น `%` ใน .env อาจต้อง escape เป็น `%%` ในบาง env loader)

---

## 3. LINE Integration (V1)

### LINE Official Bot
- **Env Keys:** `LINE_OFFICIAL_BOT_CHANNEL_ID`, `LINE_OFFICIAL_BOT_CHANNEL_SECRET`, `LINE_OFFICIAL_BOT_CHANNEL_TOKEN`
- ใช้สำหรับ: Webhook events, push messages, rich menus

### LINE LIFF (LINE Front-end Framework)
- **Env Keys:** `LIFF_*` (LIFF IDs สำหรับแต่ละหน้า)
- ใช้สำหรับ: In-app browser ใน LINE, auto-login

### LINE Admin Bot
- **Env Keys:** `LINE_ADMIN_BOT_CHANNEL_ID`, `LINE_ADMIN_BOT_CHANNEL_SECRET`, `LINE_ADMIN_BOT_CHANNEL_TOKEN`
- ใช้สำหรับ: Notify admin ใน LINE group

### LINE Notify
- **Env Keys:** `LINE_NOTIFY_CLIENT_ID`, `LINE_NOTIFY_CLIENT_SECRET`, `LINE_NOTIFY_CALLBACK_URL`, `LINE_NOTIFY_CLIENT_NAME`
- ใช้สำหรับ: ส่ง notification ไป LINE groups

### LINE Groups (Admin Notification Targets)
- **Env Keys:** `DEST_ADMIN_LINEGROUP1_*`, `DEST_ADMIN_LINEGROUP2_*`, `DEST_ADMIN_LINEGROUP3_*`
- 3 groups สำหรับแจ้งเตือน admin

---

## 4. AWS Services (V1)

### Storage (S3 + CloudFront)
- **Bucket:** ใช้สำหรับเก็บ static files (รูป, ไฟล์)
- **Env Keys:** `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_STATICFILE_BUCKET_NAME`
- **V2 ใช้:** MinIO แทน (S3-compatible, self-hosted)

### Database
- **V1 Production (SG):** `saversure-julaherb-prod.cms4i8jm3njf.ap-southeast-1.rds.amazonaws.com:5432`
- **DB Name:** `saversurejulaherb`
- **V2 ใช้:** Docker PostgreSQL (local dev), self-hosted (prod)

### ECS (Container)
- Backend: `saversure-backend:v2.0.31` (0.25 vCPU, 512MB RAM)
- LINE Bot: แยก service
- IP2Geolocation: แยก service

---

## 5. Facebook Login (V1)

- **Env Keys:** `FACEBOOK_LOGIN_CLIENT_ID`, `FACEBOOK_LOGIN_CLIENT_SECRET`, `FACEBOOK_LOGIN_REDIRECT_URL`
- V1 รองรับ Facebook Login เป็น alternative login method
- **V2 Status:** ยังไม่ได้วางแผน — พิจารณาเพิ่มถ้าต้องการ

---

## 6. Security Keys (V1)

| Key | Purpose |
|-----|---------|
| `JWT_SECRET_KEY` | JWT signing |
| `SIGNATURE_SALT_KEY` | HMAC signing for QR codes |
| `SSH_PUBLIC_KEY` | Server auth |
| `INTERNAL_API_ACCESS_TOKEN` | Internal API auth between services |

---

## 7. MongoDB (V1 — Salepage only)

- **Env Keys:** `MONGODB_HOST`, `MONGODB_NAME`, `MONGODB_PASSWORD`, etc.
- **DB Name:** `baimai-salepage`
- ใช้สำหรับ: Salepage feature เท่านั้น
- **V2 Status:** ไม่ต้อง migrate (feature แยกต่างหาก)

---

## 8. QR Code Config (V1)

- **Verify URL:** `https://qr.saversure.com/scan`
- **Daily Quota:** `QRCODE_VERIFY_QUOTA_PER_DAY` (V1 มี rate limit ต่อวัน)
- **V2:** ใช้ rate limiter ผ่าน Redis แทน

---

## 9. V1 AWS Cost Summary (March 2026)

| Service | Cost/Month |
|---------|------------|
| RDS (Database) | $144.89 |
| EC2 (Servers) | $22.72 |
| ELB (Load Balancer) | $6.36 |
| VPC (Networking) | $5.94 |
| ECS (Containers) | $3.70 |
| Route 53 (DNS) | $3.05 |
| Amplify (Frontend) | $1.04 |
| **Total** | **~$202/month** |

**ข้อสังเกต:**
- Aurora Serverless min ACU=4 แต่ CPU ใช้แค่ 1.6% → ลด ACU ได้
- EC2 t3.xlarge อาจใหญ่เกินไป
- V2 ใช้ Docker self-hosted จะประหยัดกว่ามาก

---

## 10. Environment Variables ทั้งหมด (V1 Production)

**Total: 69 env vars** แบ่งตาม category:

| Category | Variables |
|----------|-----------|
| App Config | `APP_ENV`, `APP_PORT`, `ASSETS_PATH`, `UPLOAD_PATH`, `LOG_LEVEL` |
| PostgreSQL | `DB_HOST`, `DB_NAME`, `DB_PASSWORD`, `DB_PORT`, `DB_USERNAME` |
| MongoDB | `MONGODB_HOST`, `MONGODB_NAME`, `MONGODB_PASSWORD`, `MONGODB_PORT`, `MONGODB_PROTOCOL`, `MONGODB_USERNAME`, `MONGODB_TIMEOUT_*` |
| AWS | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_STATICFILE_BUCKET_NAME` |
| SMS/OTP | `SMS_HOST`, `SMS_USERNAME`, `SMS_PASSWORD`, `SMS_OTP_OTC_ID` |
| LINE Bot | `LINE_OFFICIAL_BOT_CHANNEL_*`, `LINE_ADMIN_BOT_CHANNEL_*`, `LIFF_*` |
| LINE Notify | `LINE_NOTIFY_CLIENT_ID`, `LINE_NOTIFY_CLIENT_SECRET`, `LINE_NOTIFY_CALLBACK_URL` |
| LINE Groups | `DEST_ADMIN_LINEGROUP1_*`, `DEST_ADMIN_LINEGROUP2_*`, `DEST_ADMIN_LINEGROUP3_*` |
| Facebook | `FACEBOOK_LOGIN_CLIENT_ID`, `FACEBOOK_LOGIN_CLIENT_SECRET`, `FACEBOOK_LOGIN_REDIRECT_URL` |
| URLs | `FRONTEND_URL`, `ADMINWEB_URL`, `SALEPAGE_FRONTEND_URL`, `CLOUDFRONT_URL`, `SOCIAL_API_HOST` |
| Internal | `LINEBOT_HOST`, `IP2GEOLOCATION_HOST`, `INTERNAL_API_ACCESS_TOKEN` |
| Security | `JWT_SECRET_KEY`, `SIGNATURE_SALT_KEY`, `SSH_PUBLIC_KEY` |
| QR Code | `QRCODE_VERIFY_URL`, `QRCODE_VERIFY_QUOTA_PER_DAY` |
| Other | `MOCK_LINE_USER_ID` |
