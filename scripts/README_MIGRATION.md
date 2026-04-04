# Migration จาก MinIO Local ไป Cloudflare R2

## สถานะปัจจุบัน
✅ Config ถูกแก้ไขแล้ว (config.go)
✅ Docker Compose ถูกอัปเดตแล้ว
🔄 ต้องทำการตั้งค่า Cloudflare R2

## ขั้นตอนที่ต้องทำ

### 1. สร้าง Cloudflare R2 Bucket
1. เข้า Cloudflare Dashboard
2. เลือก R2 Object Storage
3. สร้าง bucket ชื่อ `saversure-cloudflare`
4. สร้าง API Token สำหรับ R2

### 2. ตั้งค่า Environment Variables
คัดลอก `backend/env.cloudflare.example` เป็น `.env` และแก้ไข:
- `CLOUDFLARE_ACCOUNT_ID` = Account ID ของคุณ
- `MINIO_ACCESS_KEY` = R2 Access Key
- `MINIO_SECRET_KEY` = R2 Secret Key
- `MINIO_PUBLIC_URL` = Public URL ของ R2 bucket

### 3. Run Migration
```bash
# จาก backend folder
go run migrate_to_cloudflare.go
```

### 4. Restart Services
```bash
docker-compose down
docker-compose up -d
```

## การตรวจสอบ
- Upload ทดสอบรูปภาพ
- ตรวจสอบว่าปรากฏใน Cloudflare R2
- ลบ MinIO container ถ้าทำงานถูกต้อง

## หมายเหตุ
- ตรวจสอบให้แน่ใจว่ามีข้อมูลสำรองก่อน migration
- ทดสอบใน environment ที่ไม่ใช่ production ก่อน
