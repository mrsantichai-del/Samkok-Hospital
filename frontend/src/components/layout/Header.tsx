'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Bell, Menu, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

interface HeaderProps {
  breadcrumbs?: string[];
}

const ROUTE_UC_MAP: Record<string, string> = {
  '/dashboard': 'UC-19',
  '/employees': 'UC-06',
  '/payroll/periods': 'UC-08',
  '/payroll/import': 'UC-08',
  '/payroll/calculate': 'UC-09, 10',
  '/payroll/adjustments': 'UC-11, 12',
  '/payroll/results': 'UC-13, 14',
  '/payroll/returned': 'UC-15',
  '/payslips': 'UC-16, 24',
  '/my-payslips': 'UC-22, 23',
  '/approvals': 'UC-17, 18',
  '/master/pay-items': 'UC-07',
  '/reports/executive-dashboard': 'UC-19',
  '/reports/department-cost': 'UC-20, 21',
  '/settings/users': 'UC-02',
  '/settings/roles': 'UC-03',
  '/settings/parameters': 'UC-04',
  '/settings/audit-logs': 'UC-05',
};

export const Header: React.FC<HeaderProps> = ({ breadcrumbs = ['หน้าหลัก', 'ภาพรวมระบบ'] }) => {
  const pathname = usePathname();
  const { user, switchRoleDemo } = useAuth();
  const ucTag = ROUTE_UC_MAP[pathname] || '';

  useEffect(() => {
    const pageTitle = breadcrumbs[breadcrumbs.length - 1] || 'โรงพยาบาลสามโคก';
    document.title = ucTag
      ? `${pageTitle} (${ucTag}) | โรงพยาบาลสามโคก`
      : `${pageTitle} | โรงพยาบาลสามโคก`;
  }, [breadcrumbs, ucTag]);

  const handleRoleSwitch = (role: 'ADMIN' | 'FINANCE' | 'EXECUTIVE' | 'EMPLOYEE') => {
    switchRoleDemo(role);
    const names = {
      ADMIN: 'ผู้ดูแลระบบ (System Admin)',
      FINANCE: 'เจ้าหน้าที่ฝ่ายการเงิน (Finance Officer)',
      EXECUTIVE: 'ผู้อำนวยการ / ผู้บริหาร (Executive)',
      EMPLOYEE: 'บุคลากรทั่วไป (Hospital Employee)',
    };
    toast.success(`สลับมุมมองบทบาทเป็น: ${names[role]}`);
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm shrink-0">
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <Menu className="h-4 w-4 text-slate-600" />
        <div className="flex items-center gap-1.5">
          {breadcrumbs.map((bc, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="text-slate-300">›</span>}
              <span
                title={ucTag ? `${bc} (${ucTag})` : bc}
                className={i === breadcrumbs.length - 1 ? 'font-semibold text-blue-700' : 'text-slate-500'}
              >
                {bc}
              </span>
            </React.Fragment>
          ))}
          {ucTag && (
            <span
              title={`รหัสฟังก์ชันระบบ: ${ucTag}`}
              className="ml-1.5 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-600 border border-blue-200"
            >
              {ucTag}
            </span>
          )}
        </div>
      </div>

      {/* แถบสลับบทบาท RBAC ด่วนเพื่อความสะดวกในการตรวจสอบทุก Use Case + ข้อมูลผู้ใช้ */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 text-[11px]">
          <span className="px-2 font-medium text-slate-500 flex items-center gap-1">
            <Shield className="h-3 w-3 text-blue-600" /> สลับบทบาท RBAC:
          </span>
          {(
            [
              { key: 'ADMIN', label: 'ผู้ดูแลระบบ' },
              { key: 'FINANCE', label: 'ฝ่ายการเงิน' },
              { key: 'EXECUTIVE', label: 'ผู้บริหาร' },
              { key: 'EMPLOYEE', label: 'บุคลากรทั่วไป' },
            ] as const
          ).map((r) => (
            <button
              key={r.key}
              onClick={() => handleRoleSwitch(r.key)}
              className={`rounded-md px-2 py-1 font-medium transition-colors ${
                user?.role === r.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="relative cursor-pointer text-slate-500 hover:text-slate-800">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            3
          </span>
        </div>

        <div className="flex items-center gap-2.5 border-l border-slate-200 pl-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-sm">
            {user?.username?.charAt(0).toUpperCase() || 'S'}
          </div>
          <div className="text-right leading-tight">
            <p className="text-xs font-semibold text-slate-800">{user?.fullName || 'สมชาย ใจดี'}</p>
            <p className="text-[11px] text-slate-500">{user?.roleDisplay || 'เจ้าหน้าที่ฝ่ายการเงิน'}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
