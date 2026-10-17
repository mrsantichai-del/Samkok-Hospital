'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, User, ArrowRight, ShieldCheck, Users, CheckCircle2, FileCheck2 } from 'lucide-react';
import { signIn, SUPABASE_LOGIN_BG_URL, FALLBACK_LOGIN_BG_URL } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HospitalLogo } from '@/components/layout/HospitalLogo';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [username, setUsername] = useState('somchai');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [bgSrc, setBgSrc] = useState<string>(SUPABASE_LOGIN_BG_URL);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signIn(username, password);
      setUser(res.user, res.accessToken);
      toast.success(`เข้าสู่ระบบสำเร็จ ยินดีต้อนรับ ${res.user.fullName}`);
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error?.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (demoUser: string, label: string) => {
    setUsername(demoUser);
    setPassword('password123');
    toast.success(`เลือกบัญชี ${label} (${demoUser}) แล้ว กดปุ่มเข้าสู่ระบบได้เลย`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50/40 to-slate-200 p-4">
      <div className="grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl md:grid-cols-2">
        {/* ฝั่งซ้าย: ภาพอาคารโรงพยาบาลสามโคกและสโลแกน (ตรงตามรูปที่ 3.65 และ 3.89 ทุกประการ ดึงภาพจาก Supabase Bucket) */}
        <div className="relative flex flex-col justify-between bg-gradient-to-b from-[#cfe3f7] via-[#e2eefb] to-[#4b7c32] overflow-hidden text-slate-900">
          {/* ส่วนหัวด้านบนพื้นหลังท้องฟ้า */}
          <div className="relative z-10 px-8 pt-8 pb-3">
            <div className="flex items-center gap-3.5">
              <HospitalLogo className="h-14 w-14" />
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">โรงพยาบาลสามโคก</h1>
                <p className="text-xs font-bold text-slate-800">โปรแกรมบริหารจัดการเงินเดือนและค่าตอบแทน</p>
              </div>
            </div>

            <p className="mt-4 text-sm font-medium text-slate-700 leading-relaxed">
              บริหารจัดการข้อมูลบุคลากรและเงินเดือน
              <br />
              อย่างมีประสิทธิภาพ โปร่งใส และตรวจสอบได้
            </p>
          </div>

          {/* ภาพอาคารโรงพยาบาลสามโคก (ดึงจาก Supabase Storage Bucket: hospital-assets/login-hospital.jpg) */}
          <div className="relative flex-1 flex flex-col justify-end min-h-[290px]">
            <img
              src={bgSrc}
              alt="อาคารโรงพยาบาลสามโคก"
              onError={() => {
                if (bgSrc !== FALLBACK_LOGIN_BG_URL) {
                  setBgSrc(FALLBACK_LOGIN_BG_URL);
                }
              }}
              className="w-full h-full object-cover object-top select-none"
            />

            {/* แถบคุณสมบัติ 3 ช่องด้านล่างบนสนามหญ้า (ตรงตามรูปที่ 3.89) */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/35 to-transparent px-4 py-3.5 text-center text-white">
              <div className="grid grid-cols-3 divide-x divide-white/30">
                <div className="px-2">
                  <Users className="mx-auto h-5 w-5 text-white" />
                  <p className="mt-1 text-[11px] font-medium leading-tight">
                    บริหารบุคลากร
                    <br />
                    อย่างเป็นระบบ
                  </p>
                </div>
                <div className="px-2">
                  <FileCheck2 className="mx-auto h-5 w-5 text-white" />
                  <p className="mt-1 text-[11px] font-medium leading-tight">
                    ข้อมูลโปร่งใส
                    <br />
                    ตรวจสอบได้
                  </p>
                </div>
                <div className="px-2">
                  <ShieldCheck className="mx-auto h-5 w-5 text-white" />
                  <p className="mt-1 text-[11px] font-medium leading-tight">
                    สนับสนุนการบริหาร
                    <br />
                    สุขภาพที่ยั่งยืน
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ฝั่งขวา: แบบฟอร์มเข้าสู่ระบบและยืนยันตัวตน (UC-01 รูปที่ 3.65 และ 3.89) */}
        <div className="flex flex-col justify-center p-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">เข้าสู่ระบบ</h2>
            <p className="mt-1 text-xs text-slate-500">
              กรุณาเข้าสู่ระบบเพื่อใช้งานโปรแกรมบริหารจัดการเงินเดือนและค่าตอบแทน
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">ชื่อผู้ใช้งาน</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="กรอกชื่อผู้ใช้งาน เช่น somchai"
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">รหัสผ่าน</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 pr-9"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600"
                />
                <span>จดจำฉัน</span>
              </label>
              <button
                type="button"
                onClick={() => toast('กรุณาติดต่อผู้ดูแลระบบ (Admin) เพื่อรีเซ็ตรหัสผ่าน')}
                className="font-medium text-blue-600 hover:underline"
              >
                ลืมรหัสผ่าน?
              </button>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              <span>{loading ? 'กำลังตรวจสอบสิทธิ์...' : 'เข้าสู่ระบบ'}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {/* กล่องเลือกสิทธิ์การเข้าถึงตามบทบาท 4 กลุ่ม (ตามรูปที่ 3.89) */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
            <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              สิทธิ์การเข้าถึงตามบทบาท (คลิกเพื่อเลือกบัญชีทดสอบ):
            </p>
            <div className="mt-2.5 grid grid-cols-2 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => quickLogin('somchai', 'ผู้ดูแลระบบ')}
                className={`rounded-md border px-2.5 py-1.5 text-left font-medium transition-colors ${
                  username === 'somchai'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                ⚙️ ผู้ดูแลระบบ (somchai)
              </button>
              <button
                type="button"
                onClick={() => quickLogin('suda', 'เจ้าหน้าที่การเงิน')}
                className={`rounded-md border px-2.5 py-1.5 text-left font-medium transition-colors ${
                  username === 'suda'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                💼 เจ้าหน้าที่การเงิน (suda)
              </button>
              <button
                type="button"
                onClick={() => quickLogin('executive', 'ผู้บริหาร')}
                className={`rounded-md border px-2.5 py-1.5 text-left font-medium transition-colors ${
                  username === 'executive'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                👔 ผู้บริหาร (executive)
              </button>
              <button
                type="button"
                onClick={() => quickLogin('panya', 'บุคลากรทั่วไป')}
                className={`rounded-md border px-2.5 py-1.5 text-left font-medium transition-colors ${
                  username === 'panya'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                🧑‍⚕️ บุคลากรทั่วไป (panya)
              </button>
            </div>
            <p className="mt-2 text-[10px] text-slate-400">
              หลังจากเข้าสู่ระบบแล้ว ระบบจะแสดงเมนูและสิทธิ์การใช้งานตามบทบาทที่ได้รับมอบหมาย (รหัสผ่าน: password123)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
