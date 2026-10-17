# Samkok Hospital Payroll System - Architecture & CI/CD Guide (`AGENTS.md`)

เอกสารกำกับโครงสร้างซอฟต์แวร์และแนวทางการพัฒนาแบบอัตโนมัติ (CI/CD) สำหรับโครงการ **โปรแกรมบริหารจัดการเงินเดือนและค่าตอบแทนบุคลากร โรงพยาบาลสามโคก**

## 1. สถาปัตยกรรมระบบ (Decoupled 2-Tier Architecture)
- **Frontend (`frontend/`):** Next.js 14 (App Router), TypeScript, Tailwind CSS, Shadcn UI, Zustand, Recharts (Deploy บน **Vercel**)
- **Backend (`backend/`):** NestJS 10, TypeScript, Prisma ORM, Passport.js + JWT + Bcrypt, PDFKit, ExcelJS/SheetJS (Deploy บน **Render**)
- **Database:** PostgreSQL บนแพลตฟอร์ม **Supabase** (`spwtsuxwnrmcwmqihozf`)

## 2. กระบวนการ CI/CD (GitHub Actions + Vercel + Render + Supabase)
1. เมื่อมีการ Push โค้ดไปยังกิ่ง `main` บน GitHub (`mrsantichai-del/Samkok-Hospital`):
2. **GitHub Actions (`.github/workflows/ci-cd.yml`)** จะทำงานอัตโนมัติ:
   - ตรวจสอบและสร้าง Prisma Client (`npx prisma generate`)
   - คอมไพล์และตรวจสอบชนิดข้อมูลของ Backend NestJS (`npm run build`)
   - คอมไพล์และสร้างชุดไฟล์ Production ของ Frontend Next.js (`npm run build`)
3. **Render** จะดึงโค้ดจากโฟลเดอร์ `backend/` ไป Build และอัปเดตบริการ RESTful API อัตโนมัติ
4. **Vercel** จะดึงโค้ดจากโฟลเดอร์ `frontend/` ไป Build และเผยแพร่เว็บไซต์หน้าบ้านอัตโนมัติ
