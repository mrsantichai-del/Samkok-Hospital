'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Users,
  Calendar,
  CheckSquare,
  Database,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  FileText,
  History,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { HospitalLogo } from '@/components/layout/HospitalLogo';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const role = user?.role || 'FINANCE';

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
          <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
            โปรแกรมบริหารจัดการเงินเดือนและค่าตอบแทน
          </p>
        </div>
      </div>

      {/* รายการเมนูแยกตามสิทธิ์การใช้งาน RBAC ตรงตาม Use Case Diagram (รูปที่ 3.2 - 3.6) */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1 text-xs">
        {/* =====================================================================
            กลุ่มที่ 1: ผู้ดูแลระบบ (ADMIN) -> UC-02 ถึง UC-05 (รูปที่ 3.3)
        ===================================================================== */}
        {role === 'ADMIN' && (
          <div>
            <button
              onClick={() => toggleMenu('settings')}
              title="UC-02 ถึง UC-05: การตั้งค่าระบบสำหรับผู้ดูแลระบบ"
              className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white"
            >
              <div className="flex items-center gap-2.5">
                <Settings className="h-4 w-4 text-purple-400" />
                <span>ตั้งค่าระบบ</span>
              </div>
              {openMenus.settings ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </button>
            {openMenus.settings && (
              <div className="mt-1 ml-3 space-y-1 border-l border-slate-700 pl-3">
                <Link
                  href="/settings/users"
                  title="UC-02: การจัดการบัญชีผู้ใช้งาน"
                  className={`block rounded-md px-2.5 py-2 transition-colors ${
                    isActive('/settings/users')
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  จัดการบัญชีผู้ใช้งาน
                </Link>
                <Link
                  href="/settings/roles"
                  title="UC-03: การกำหนดบทบาทและสิทธิ์การใช้งาน"
                  className={`block rounded-md px-2.5 py-2 transition-colors ${
                    isActive('/settings/roles')
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  กำหนดบทบาทการใช้งาน
                </Link>
                <Link
                  href="/settings/parameters"
                  title="UC-04: การจัดการค่าพื้นฐานและพารามิเตอร์ระบบ"
                  className={`block rounded-md px-2.5 py-2 transition-colors ${
                    isActive('/settings/parameters')
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  ค่าพื้นฐานและพารามิเตอร์
                </Link>
                <Link
                  href="/settings/audit-logs"
                  title="UC-05: การตรวจสอบบันทึกการใช้งานและการเปลี่ยนแปลงข้อมูล"
                  className={`block rounded-md px-2.5 py-2 transition-colors ${
                    isActive('/settings/audit-logs')
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  บันทึกการใช้งาน Audit Log
                </Link>
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            กลุ่มที่ 2: เจ้าหน้าที่ฝ่ายการเงิน (FINANCE) -> UC-06 ถึง UC-16 (รูปที่ 3.4)
        ===================================================================== */}
        {role === 'FINANCE' && (
          <>
            {/* บุคลากร (UC-06) */}
            <Link
              href="/employees"
              title="UC-06: การจัดการข้อมูลบุคลากร"
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 font-medium transition-colors ${
                isActive('/employees')
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Users className="h-4 w-4 text-sky-400" />
              <span>บุคลากร</span>
            </Link>

            {/* ข้อมูลพื้นฐาน (UC-07) */}
            <div>
              <button
                onClick={() => toggleMenu('master')}
                title="UC-07: การจัดการข้อมูลพื้นฐานเงินเดือนและค่าตอบแทน"
                className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white"
              >
                <div className="flex items-center gap-2.5">
                  <Database className="h-4 w-4 text-amber-400" />
                  <span>ข้อมูลพื้นฐาน</span>
                </div>
                {openMenus.master ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
              </button>
              {openMenus.master && (
                <div className="mt-1 ml-3 space-y-1 border-l border-slate-700 pl-3">
                  <Link
                    href="/master/pay-items"
                    title="UC-07: การจัดการประเภทเงินได้และรายการหัก"
                    className={`block rounded-md px-2.5 py-2 transition-colors ${
                      isActive('/master/pay-items')
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    ประเภทเงินได้และรายการหัก
                  </Link>
                </div>
              )}
            </div>

            {/* งวดเงินเดือนและการประมวลผล (UC-08 ถึง UC-16) */}
            <div>
              <button
                onClick={() => toggleMenu('payroll')}
                title="UC-08 ถึง UC-16: การจัดการงวดเงินเดือนและประมวลผล"
                className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white"
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="h-4 w-4 text-blue-400" />
                  <span>งวดเงินเดือน & ประมวลผล</span>
                </div>
                {openMenus.payroll ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
              </button>

              {openMenus.payroll && (
                <div className="mt-1 ml-3 space-y-1 border-l border-slate-700 pl-3">
                  <Link
                    href="/payroll/periods"
                    title="UC-08: การสร้างและจัดการงวดเงินเดือน"
                    className={`block rounded-md px-2.5 py-2 transition-colors ${
                      isActive('/payroll/periods')
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    จัดการงวดเงินเดือน
                  </Link>
                  <Link
                    href="/payroll/import"
                    title="UC-08: การนำเข้าข้อมูลเงินเดือนจากไฟล์ Excel"
                    className={`block rounded-md px-2.5 py-2 transition-colors ${
                      isActive('/payroll/import')
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    นำเข้าข้อมูลจาก Excel
                  </Link>
                  <Link
                    href="/payroll/calculate"
                    title="UC-09, UC-10: การคำนวณเงินเดือนพื้นฐานและค่าล่วงเวลา"
                    className={`block rounded-md px-2.5 py-2 transition-colors ${
                      isActive('/payroll/calculate')
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    คำนวณเงินเดือน & OT
                  </Link>
                  <Link
                    href="/payroll/adjustments"
                    title="UC-11, UC-12: การปรับปรุงรายการเงินได้และรายการหักรายบุคคล"
                    className={`block rounded-md px-2.5 py-2 transition-colors ${
                      isActive('/payroll/adjustments')
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    ปรับปรุงรายบุคคล
                  </Link>
                  <Link
                    href="/payroll/results"
                    title="UC-13, UC-14: การตรวจสอบผลการประมวลผลและเสนอปิดงวดเงินเดือน"
                    className={`block rounded-md px-2.5 py-2 transition-colors ${
                      isActive('/payroll/results')
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    ผลการประมวลผลเงินเดือน
                  </Link>
                  <Link
                    href="/payroll/returned"
                    title="UC-15: การตรวจสอบและแก้ไขงวดเงินเดือนที่ถูกส่งกลับ"
                    className={`block rounded-md px-2.5 py-2 transition-colors ${
                      isActive('/payroll/returned')
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    ตรวจสอบและแก้ไขงวดที่ส่งกลับ
                  </Link>
                  <Link
                    href="/payslips"
                    title="UC-16: การจัดทำใบแสดงรายการเงินเดือน"
                    className={`block rounded-md px-2.5 py-2 transition-colors ${
                      isActive('/payslips')
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    ใบแสดงรายการเงินเดือน PDF
                  </Link>
                </div>
              )}
            </div>
          </>
        )}

        {/* =====================================================================
            กลุ่มที่ 3: ผู้บริหาร (EXECUTIVE) -> UC-17 ถึง UC-21 (รูปที่ 3.5)
        ===================================================================== */}
        {role === 'EXECUTIVE' && (
          <>
            {/* อนุมัติงวดเงินเดือน (UC-17, UC-18) */}
            <Link
              href="/approvals"
              title="UC-17, UC-18: การตรวจสอบรายละเอียดและพิจารณาอนุมัติหรือส่งกลับงวดเงินเดือน"
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 font-medium transition-colors ${
                isActive('/approvals')
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <CheckSquare className="h-4 w-4 text-emerald-400" />
              <span>อนุมัติงวดเงินเดือน</span>
            </Link>

            {/* รายงานสำหรับผู้บริหาร (UC-19, UC-20, UC-21) */}
            <div>
              <button
                onClick={() => toggleMenu('reports')}
                title="UC-19, UC-20, UC-21: ระบบรายงานสำหรับผู้บริหาร"
                className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white"
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 className="h-4 w-4 text-sky-400" />
                  <span>รายงาน</span>
                </div>
                {openMenus.reports ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
              </button>
              {openMenus.reports && (
                <div className="mt-1 ml-3 space-y-1 border-l border-slate-700 pl-3">
                  <Link
                    href="/reports/executive-dashboard"
                    title="UC-19, UC-21: รายงานสรุปและแดชบอร์ดสำหรับผู้บริหาร"
                    className={`block rounded-md px-2.5 py-2 transition-colors ${
                      isActive('/reports/executive-dashboard') || pathname === '/dashboard'
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    รายงานสรุปและแดชบอร์ดผู้บริหาร
                  </Link>
                  <Link
                    href="/reports/department-cost"
                    title="UC-20, UC-21: รายงานสรุปค่าใช้จ่ายตามหน่วยงานและการส่งออกไฟล์"
                    className={`block rounded-md px-2.5 py-2 transition-colors ${
                      isActive('/reports/department-cost')
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    รายงานสรุปค่าใช้จ่ายตามหน่วยงาน
                  </Link>
                </div>
              )}
            </div>
          </>
        )}

        {/* =====================================================================
            กลุ่มที่ 4: บุคลากรทั่วไป (EMPLOYEE) -> UC-22 ถึง UC-24 (รูปที่ 3.6)
        ===================================================================== */}
        {role === 'EMPLOYEE' && (
          <>
            <Link
              href="/payslips"
              title="UC-22, UC-24: การตรวจสอบใบแสดงรายการเงินเดือนของตนเองและพิมพ์ PDF"
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 font-medium transition-colors ${
                isActive('/payslips')
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <FileText className="h-4 w-4 text-sky-400" />
              <span>ใบแสดงรายการเงินเดือน</span>
            </Link>
            <Link
              href="/my-payslips"
              title="UC-23, UC-24: การตรวจสอบประวัติใบแสดงรายการเงินเดือนย้อนหลังและดาวน์โหลด PDF"
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 font-medium transition-colors ${
                isActive('/my-payslips')
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <History className="h-4 w-4 text-emerald-400" />
              <span>ประวัติเงินเดือนย้อนหลัง</span>
            </Link>
          </>
        )}
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
