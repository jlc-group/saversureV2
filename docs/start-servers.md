# SaversureV2 — วิธี Start Server ทุกส่วน

## ภาพรวม

| ส่วน | โฟลเดอร์ | Port | คำสั่ง Start |
|------|-----------|------|--------------|
| **Backend API** | `backend/` | **30400** | `make dev` หรือ `go run ./cmd/api` |
| **Admin Frontend** | `frontend/` | **30401** | `npm run dev` |
| **Consumer Frontend** | `consumer/` | **30403** | `npm run dev` |

---

## 1. Backend API (Go)

- **ที่อยู่:** `D:\Dev\apps\saversureV2\backend\`
- **Port:** 30400 (จาก env `APP_PORT` หรือ default ใน config)
- **URL หลังรัน:** http://localhost:30400

### วิธีรัน

**แบบใช้ Makefile (จากโฟลเดอร์ saversureV2):**
```bash
cd D:\Dev\apps\saversureV2
make dev
```

**แบบรันตรงใน backend:**
```bash
cd D:\Dev\apps\saversureV2\backend
go run ./cmd/api
```

**ตรวจสอบว่า API ทำงาน:**
- http://localhost:30400/health

**หมายเหตุ:** ต้องมี PostgreSQL, Redis (และถ้าใช้ NATS/MinIO ต้องรันตามที่ config) และอาจต้องโหลด `.env` ในโฟลเดอร์ backend ถ้ามี

---

## 2. Admin Frontend (Next.js)

- **ที่อยู่:** `D:\Dev\apps\saversureV2\frontend\`
- **Port:** 30401
- **URL หลังรัน:** http://localhost:30401

### วิธีรัน

**Development:**
```bash
cd D:\Dev\apps\saversureV2\frontend
npm run dev
```

**Production (หลัง build):**
```bash
npm run build
npm run start
```

**Environment:** ตั้งค่า `NEXT_PUBLIC_API_URL` ให้ชี้ไปที่ Backend API (เช่น `http://localhost:30400`) ถ้าไม่ตั้งจะ fallback ไปที่ `http://localhost:30400`

---

## 3. Consumer Frontend (Next.js)

- **ที่อยู่:** `D:\Dev\apps\saversureV2\consumer\`
- **Port:** 30403
- **URL หลังรัน:** http://localhost:30403

### วิธีรัน

**Development:**
```bash
cd D:\Dev\apps\saversureV2\consumer
npm run dev
```

**Production (หลัง build):**
```bash
npm run build
npm run start
```

**Environment:** ตั้งค่า `NEXT_PUBLIC_API_URL` (เช่น `http://localhost:30400`) และถ้าใช้ single-tenant ตั้ง `NEXT_PUBLIC_TENANT_ID`

---

## รันทั้งหมดพร้อมกัน (Development)

เปิด **3 terminal** แล้วรันแยกส่วน:

**Terminal 1 — Backend**
```bash
cd D:\Dev\apps\saversureV2
make dev
```

**Terminal 2 — Admin**
```bash
cd D:\Dev\apps\saversureV2\frontend
npm run dev
```

**Terminal 3 — Consumer**
```bash
cd D:\Dev\apps\saversureV2\consumer
npm run dev
```

| Service | URL |
|---------|-----|
| API | http://localhost:30400 |
| Admin | http://localhost:30401 |
| Consumer | http://localhost:30403 |

---

## สิ่งที่ต้องมีก่อนรัน

- **Backend:** Go 1.21+, PostgreSQL, Redis (และ .env หรือ config ที่ถูกต้อง)
- **Database migrations:** รันก่อนใช้ API ครั้งแรก  
  `cd backend && go run ./cmd/migrate up`  
  หรือจาก root: `make migrate-up`
- **Frontend (Admin/Consumer):** Node.js 20+, `npm install` ใน `frontend/` และ `consumer/` แล้ว
