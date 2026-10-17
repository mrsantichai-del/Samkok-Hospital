# โปรแกรมการเบิกจ่ายเงินเดือนและค่าตอบแทน โรงพยาบาลสามโคก (Samkok Hospital Payroll System)

ระบบบริหารจัดการเงินเดือนและค่าตอบแทนบุคลากร โรงพยาบาลสามโคก จังหวัดปทุมธานี พัฒนาตามเอกสารโครงงาน **บทที่ 2 และ บทที่ 3** อย่างครบถ้วน 100% ด้วยสถาปัตยกรรมแบบแยกส่วน 2 ระดับชั้น (**Decoupled 2-Tier Architecture**)

---

## 1. โครงสร้างโปรเจกต์ (Project Structure)

- **`backend/` (NestJS + TypeScript + Prisma ORM + Supabase PostgreSQL):**
  - `prisma/schema.prisma`: สคีมาฐานข้อมูล 14 ตารางหลัก และ 4 Enum ตาม Class Diagram (รูปที่ 3.7) และ ER Diagram (รูปที่ 3.8)
  - `prisma/seed.ts`: สคริปต์จำลองข้อมูลเริ่มต้นของโรงพยาบาลสามโคก (4 กลุ่มบทบาท RBAC, 7 อาคาร/กลุ่มงาน, 5 ประเภทการจ้างงาน, รายการเงินได้/หัก พ.ต.ส./ฉบับที่ 11/OT, งวดเงินเดือน และ Audit Log)
  - `src/common/utils/modulo11.util.ts`: อัลกอริทึมตรวจสอบเลขบัตรประชาชน 13 หลัก (Modulo 11 Check Digit Algorithm - หัวข้อ 2.1.3.4)
  - `src/common/utils/bahttext.util.ts`: ฟังก์ชันแปลงจำนวนเงินเป็นตัวอักษรภาษาไทย (Bahttext - หัวข้อ 2.2.6)
  - `src/auth`, `src/users`, `src/roles`, `src/parameters`, `src/audit-logs`, `src/employees`, `src/departments`, `src/pay-items`, `src/payroll`, `src/approvals`, `src/payslips`, `src/reports`: ครบทั้ง **24 Use Cases (UC-01 ถึง UC-24)**
- **`frontend/` (Next.js App Router + TypeScript + Tailwind CSS + Shadcn UI + Zustand + Recharts):**
  - ครบทุกหน้าจอฝั่ง **Input Design (รูปที่ 3.65–3.76)** และ **Output Design (รูปที่ 3.77–3.81, 3.85, 3.90–3.95)**

---

## 2. วิธีตั้งค่าเชื่อมต่อฐานข้อมูล Supabase PostgreSQL

1. เข้าสู่ระบบ [Supabase Dashboard](https://supabase.com/dashboard) และเปิดโปรเจกต์ของคุณ
2. ไปที่เมนู **Project Settings** -> **Database** -> **Connection string** -> เลือกแท็บ **URI**
3. เปิดไฟล์ `backend/.env` แล้วนำ Connection String จาก Supabase มาใส่ใน `DATABASE_URL` และ `DIRECT_URL`:
   ```env
   # Transaction Pooler (พอร์ต 6543)
   DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

   # Session / Direct Connection (พอร์ต 5432 สำหรับการทำ Migration)
   DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
   ```
4. รันคำสั่งสร้างตารางทั้งหมดและนำเข้าข้อมูลตัวอย่าง (Seed Data) ลงใน Supabase:
   ```powershell
   cd backend
   npm run db:setup
   ```
   *(คำสั่ง `npm run db:setup` จะรัน `prisma generate`, `prisma db push` และ `ts-node prisma/seed.ts` ให้โดยอัตโนมัติ)*

---

## 3. วิธีรันโปรแกรมเพื่อใช้งานและทดสอบ

### 3.1 รันส่วนประมวลผลหลังบ้าน (Backend API - พอร์ต `3001`)
```powershell
cd backend
npm run start:dev
```

### 3.2 รันส่วนติดต่อผู้ใช้งานหน้าบ้าน (Frontend Web - พอร์ต `3000`)
```powershell
cd frontend
npm run dev
```
จากนั้นเปิดเบราว์เซอร์ไปที่ `http://localhost:3000`

---

## 4. บัญชีผู้ใช้งานสำหรับทดสอบตามหลัก RBAC 4 กลุ่มบทบาท

| บทบาทหน้าที่ (Role) | ชื่อผู้ใช้งาน (`username`) | รหัสผ่าน (`password`) | ขอบเขตสิทธิ์การใช้งาน (Use Cases) |
| :--- | :---: | :---: | :--- |
| **1. ผู้ดูแลระบบ (`ADMIN`)** | `somchai` | `password123` | UC-01 ถึง UC-05 (จัดการบัญชีผู้ใช้, กำหนดสิทธิ์ RBAC, พารามิเตอร์, Audit Log) |
| **2. เจ้าหน้าที่ฝ่ายการเงิน (`FINANCE`)** | `suda` | `password123` | UC-01, UC-06 ถึง UC-16 (บุคลากร, งวดเงินเดือน, นำเข้า Excel, คำนวณเงินเดือน/OT, ปรับปรุงรายบุคคล, เสนอปิดงวด, สลิป PDF) |
| **3. ผู้อำนวยการ / ผู้บริหาร (`EXECUTIVE`)** | `executive` | `password123` | UC-01, UC-17 ถึง UC-21 (ตรวจสอบงวดรออนุมัติ, อนุมัติด้วยลายมือชื่อดิจิทัล/ส่งกลับ, แดชบอร์ดผู้บริหาร, ส่งออกรายงาน) |
| **4. บุคลากรโรงพยาบาล (`EMPLOYEE`)** | `panya` | `password123` | UC-01, UC-22 ถึง UC-24 (ตรวจสอบสลิปเงินเดือนตนเอง, ค้นหาประวัติสลิปย้อนหลัง, พิมพ์/ดาวน์โหลด PDF ตามกฎหมาย PDPA) |
