'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Users,
  Calendar,
  Calculator,
  CheckSquare,
  Database,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  UserCog,
  ShieldCheck,
  Sliders,
  History,
  RotateCcw,
  Plus,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { HospitalLogo } from '@/components/layout/HospitalLogo';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    payroll: true,
    master: true,
    reports: true,
    settings: true,
  });

  const toggleMenu = (key: string) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <aside className="flex h-screen w-64 flex-col bg-[#0f172a] text-slate-200 shadow-xl select-none shrink-0">
      {/* ส่วนหัวตราสัญลักษณ์โรงพยาบาลสามโคก (ดึงจาก Supabase Storage Bucket) */}
      <div className="flex items-center gap-3 border-b border-slate-800 px-4 py-4">
        <HospitalLogo className="h-10 w-10" />
        <div>
          <h1 className="text-sm font-bold text-white leading-tight">โรงพยาบาลสามโคก</h1>
          <p className="text-[11px] text-slate-400">ระบบบริหารเงินเดือนและค่าตอบแทน</p>
        </div>
      </div>

      {/* รายการเมนูตามบทบาท RBAC (ครบทุกหน้าจอในรูปที่ 3.66 - 3.81) */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1 text-xs">
        <Link
          href="/dashboard"
          className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 font-medium transition-colors ${
            pathname === '/dashboard'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <Home className="h-4 w-4" />
          <span>หน้าแรก / แดชบอร์ด</span>
        </Link>

        {/* บุคลากร (UC-06) */}
        <Link
          href="/employees"
          className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 font-medium transition-colors ${
            isActive('/employees')
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>บุคลากร (UC-06)</span>
        </Link>

        {/* งวดเงินเดือนและการประมวลผล (UC-08 ถึง UC-16) */}
        <div>
          <button
            onClick={() => toggleMenu('payroll')}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white"
          >
            <div className="flex items-center gap-2.5">
              <Calendar className="h-4 w-4 text-blue-400" />
              <span>งวดเงินเดือน & ประมวลผล</span>
            </div>
            {openMenus.payroll ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>

          {openMenus.payroll && (
            <div className="mt-1 ml-3 space-y-1 border-l border-slate-700 pl-3">
              <Link
                href="/payroll/periods"
                className={`block rounded-md px-2.5 py-2 transition-colors ${
                  isActive('/payroll/periods')
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                จัดการงวดเงินเดือน (UC-08)
              </Link>
              <Link
                href="/payroll/import"
                className={`block rounded-md px-2.5 py-2 transition-colors ${
                  isActive('/payroll/import')
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                นำเข้าข้อมูลจาก Excel (UC-08)
              </Link>
              <Link
                href="/payroll/calculate"
                className={`block rounded-md px-2.5 py-2 transition-colors ${
                  isActive('/payroll/calculate')
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                คำนวณเงินเดือน & OT (UC-09, 10)
              </Link>
              <Link
                href="/payroll/adjustments"
                className={`block rounded-md px-2.5 py-2 transition-colors ${
                  isActive('/payroll/adjustments')
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                ปรับปรุงรายบุคคล (UC-11, 12)
              </Link>
              <Link
                href="/payroll/results"
                className={`block rounded-md px-2.5 py-2 transition-colors ${
                  isActive('/payroll/results')
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                ผลการประมวลผลเงินเดือน (UC-13, 14)
              </Link>
              <Link
                href="/payroll/returned"
                className={`block rounded-md px-2.5 py-2 transition-colors ${
                  isActive('/payroll/returned')
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                ตรวจสอบและแก้ไขงวดที่ส่งกลับ (UC-15)
              </Link>
              <Link
                href="/payslips"
                className={`block rounded-md px-2.5 py-2 transition-colors ${
                  isActive('/payslips')
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                ใบแสดงรายการเงินเดือน PDF (UC-16, 24)
              </Link>
              <Link
                href="/my-payslips"
                className={`block rounded-md px-2.5 py-2 transition-colors ${
                  isActive('/my-payslips')
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                ประวัติเงินเดือนย้อนหลัง (UC-22, 23)
              </Link>
            </div>
          )}
        </div>

        {/* อนุมัติงวดเงินเดือน (UC-17, UC-18) */}
        <Link
          href="/approvals"
          className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 font-medium transition-colors ${
            isActive('/approvals')
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <CheckSquare className="h-4 w-4 text-emerald-400" />
          <span>อนุมัติงวดเงินเดือน (UC-17, 18)</span>
        </Link>

        {/* ข้อมูลพื้นฐาน (UC-07) */}
        <div>
          <button
            onClick={() => toggleMenu('master')}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white"
          >
            <div className="flex items-center gap-2.5">
              <Database className="h-4 w-4 text-amber-400" />
              <span>ข้อมูลพื้นฐาน</span>
            </div>
            {openMenus.master ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
          {openMenus.master && (
            <div className="mt-1 ml-3 space-y-1 border-l border-slate-700 pl-3">
              <Link
                href="/master/pay-items"
                className={`block rounded-md px-2.5 py-2 transition-colors ${
                  isActive('/master/pay-items')
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                ประเภทเงินได้และรายการหัก (UC-07)
              </Link>
            </div>
          )}
        </div>

        {/* รายงานสำหรับผู้บริหาร (UC-19, UC-20, UC-21) */}
        <div>
          <button
            onClick={() => toggleMenu('reports')}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white"
          >
            <div className="flex items-center gap-2.5">
              <BarChart3 className="h-4 w-4 text-sky-400" />
              <span>รายงาน</span>
            </div>
            {openMenus.reports ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
          {openMenus.reports && (
            <div className="mt-1 ml-3 space-y-1 border-l border-slate-700 pl-3">
              <Link
                href="/reports/executive-dashboard"
                className={`block rounded-md px-2.5 py-2 transition-colors ${
                  isActive('/reports/executive-dashboard')
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                รายงานสรุปและแดชบอร์ดผู้บริหาร (UC-19)
              </Link>
              <Link
                href="/reports/department-cost"
                className={`block rounded-md px-2.5 py-2 transition-colors ${
                  isActive('/reports/department-cost')
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                รายงานสรุปค่าใช้จ่ายตามหน่วยงาน (UC-20, 21)
              </Link>
            </div>
          )}
        </div>

        {/* ตั้งค่าระบบ (UC-02 ถึง UC-05) */}
        <div>
          <button
            onClick={() => toggleMenu('settings')}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white"
          >
            <div className="flex items-center gap-2.5">
              <Settings className="h-4 w-4 text-purple-400" />
              <span>ตั้งค่าระบบ (Admin)</span>
            </div>
            {openMenus.settings ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
          {openMenus.settings && (
            <div className="mt-1 ml-3 space-y-1 border-l border-slate-700 pl-3">
              <Link
                href="/settings/users"
                className={`block rounded-md px-2.5 py-2 transition-colors ${
                  isActive('/settings/users')
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                จัดการบัญชีผู้ใช้งาน (UC-02)
              </Link>
              <Link
                href="/settings/roles"
                className={`block rounded-md px-2.5 py-2 transition-colors ${
                  isActive('/settings/roles')
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                กำหนดบทบาทการใช้งาน (UC-03)
              </Link>
              <Link
                href="/settings/parameters"
                className={`block rounded-md px-2.5 py-2 transition-colors ${
                  isActive('/settings/parameters')
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                ค่าพื้นฐานและพารามิเตอร์ (UC-04)
              </Link>
              <Link
                href="/settings/audit-logs"
                className={`block rounded-md px-2.5 py-2 transition-colors ${
                  isActive('/settings/audit-logs')
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                บันทึกการใช้งาน Audit Log (UC-05)
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* ส่วนท้ายแสดงข้อมูลผู้ใช้งานปัจจุบันและปุ่มออกจากระบบ */}
      <div className="border-t border-slate-800 p-3">
        <div className="flex items-center gap-3 rounded-lg bg-slate-800/70 px-3 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
            {user?.fullName ? user.fullName.charAt(0) : 'ส'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-xs font-semibold text-white">{user?.fullName || 'สมชาย ใจดี'}</p>
            <p className="truncate text-[11px] text-slate-400">{user?.roleDisplay || 'เจ้าหน้าที่ฝ่ายการเงิน'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-300 hover:bg-red-500/20 hover:text-red-300 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </aside>
  );
};
