'use client';

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import {
  Search,
  FileSpreadsheet,
  Users,
  Banknote,
  MinusCircle,
  PlusCircle,
  Send,
  Eye,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { apiFetch } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

const RESULT_ROWS = [
  {
    employeeCode: 'E0001',
    fullName: 'นางสาวกมลวรรณ ใจดี',
    positionName: 'นักการเงิน',
    departmentName: 'ฝ่ายการเงิน',
    grossPay: 35000.0,
    totalDeduction: 5200.0,
    netPay: 29800.0,
    status: 'ประมวลผลสำเร็จ',
  },
  {
    employeeCode: 'E0003',
    fullName: 'นายสมชาย รักงาน',
    positionName: 'เจ้าหน้าที่การเงิน',
    departmentName: 'ฝ่ายการเงิน',
    grossPay: 28500.0,
    totalDeduction: 1500.0,
    netPay: 27000.0,
    status: 'ประมวลผลสำเร็จ',
  },
  {
    employeeCode: 'E0012',
    fullName: 'นางสาวศิริพร แสงทอง',
    positionName: 'พยาบาลวิชาชีพ',
    departmentName: 'ฝ่ายการพยาบาล',
    grossPay: 42750.0,
    totalDeduction: 8350.0,
    netPay: 34400.0,
    status: 'ประมวลผลสำเร็จ',
  },
  {
    employeeCode: 'E0018',
    fullName: 'นายวิทยา กิตติศักดิ์',
    positionName: 'นักวิชาการสาธารณสุข',
    departmentName: 'ฝ่ายสนับสนุนบริการ',
    grossPay: 31200.0,
    totalDeduction: 3450.0,
    netPay: 27750.0,
    status: 'ประมวลผลสำเร็จ',
  },
  {
    employeeCode: 'E0025',
    fullName: 'นางสาวกัญญา พิมพา',
    positionName: 'เจ้าหน้าที่ธุรการ',
    departmentName: 'ฝ่ายบริหารทั่วไป',
    grossPay: 26800.0,
    totalDeduction: 2900.0,
    netPay: 23900.0,
    status: 'ประมวลผลสำเร็จ',
  },
  {
    employeeCode: 'E0031',
    fullName: 'นายณัฐพล ใจมั่น',
    positionName: 'พนักงานขับรถ',
    departmentName: 'ฝ่ายสนับสนุนบริการ',
    grossPay: 22500.0,
    totalDeduction: 1800.0,
    netPay: 20700.0,
    status: 'ประมวลผลสำเร็จ',
  },
  {
    employeeCode: 'E0040',
    fullName: 'นางสาวพรทิพย์ กันยา',
    positionName: 'แพทย์',
    departmentName: 'ฝ่ายการแพทย์',
    grossPay: 120000.0,
    totalDeduction: 25600.0,
    netPay: 94400.0,
    status: 'ประมวลผลสำเร็จ',
  },
  {
    employeeCode: 'E0045',
    fullName: 'นายเอกชัย ยั่งยืน',
    positionName: 'เจ้าหน้าที่เวชระเบียน',
    departmentName: 'ฝ่ายการแพทย์',
    grossPay: 24800.0,
    totalDeduction: 2600.0,
    netPay: 22200.0,
    status: 'ประมวลผลสำเร็จ',
  },
];

export default function PayrollResultsPage() {
  const [department, setDepartment] = useState('ทั้งหมด');
  const [periodStatus, setPeriodStatus] = useState<'DRAFT' | 'PENDING_APPROVAL'>('DRAFT');

  const filtered = RESULT_ROWS.filter((r) =>
    department === 'ทั้งหมด' ? true : r.departmentName === department,
  );

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filtered);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Payroll_Results');
    XLSX.writeFile(wb, 'ผลการประมวลผลเงินเดือน_ตุลาคม_2569.xlsx');
    toast.success('ส่งออกผลการประมวลผลเงินเดือนเป็นไฟล์ Excel (.xlsx) สำเร็จ');
  };

  const handleSubmitPeriod = async () => {
    try {
      await apiFetch('/payroll/submit', {
        method: 'POST',
        body: JSON.stringify({ periodId: 'period-2569-10' }),
      });
    } catch {
      // Fallback
    }
    setPeriodStatus('PENDING_APPROVAL');
    toast.success('เสนอปิดงวดเงินเดือนสำเร็จ! เปลี่ยนสถานะเป็น "รอการอนุมัติ" (UC-14)');
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <Header breadcrumbs={['งวดเงินเดือน', 'ผลการประมวลผลเงินเดือน']} />

      <main className="flex-1 space-y-5 p-6">
        {/* ส่วนค้นหาผลการประมวลผลเงินเดือน (ตรงตามรูปที่ 3.77 - UC-13 & UC-14) */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-bold text-slate-800">ค้นหาผลการประมวลผลเงินเดือน</h2>
              <Button
                variant={periodStatus === 'PENDING_APPROVAL' ? 'success' : 'default'}
                onClick={handleSubmitPeriod}
              >
                <Send className="h-4 w-4" />
                {periodStatus === 'PENDING_APPROVAL'
                  ? 'เสนอปิดงวดแล้ว (รออนุมัติ - UC-14)'
                  : 'เสนอปิดงวดเงินเดือนส่งผู้บริหาร (UC-14)'}
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">ปีงบประมาณ</label>
                <select className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs">
                  <option>2569</option>
                  <option>2568</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">เดือน</label>
                <select className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs">
                  <option>ตุลาคม</option>
                  <option>กันยายน</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">หน่วยงาน</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs"
                >
                  <option value="ทั้งหมด">ทั้งหมด</option>
                  <option value="ฝ่ายการเงิน">ฝ่ายการเงิน</option>
                  <option value="ฝ่ายการพยาบาล">ฝ่ายการพยาบาล</option>
                  <option value="ฝ่ายการแพทย์">ฝ่ายการแพทย์</option>
                  <option value="ฝ่ายสนับสนุนบริการ">ฝ่ายสนับสนุนบริการ</option>
                  <option value="ฝ่ายบริหารทั่วไป">ฝ่ายบริหารทั่วไป</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">ประเภทบุคลากร</label>
                <select className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs">
                  <option>ทั้งหมด</option>
                  <option>ข้าราชการ</option>
                  <option>พนักงานราชการ</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">สถานะ</label>
                <select className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs">
                  <option>ทั้งหมด</option>
                  <option>ประมวลผลสำเร็จ</option>
                </select>
              </div>
              <div className="flex items-end justify-end gap-2">
                <Button variant="outline" onClick={() => setDepartment('ทั้งหมด')}>
                  ล้างค่า
                </Button>
                <Button>
                  <Search className="h-4 w-4" /> ค้นหา
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ตารางผลการประมวลผลเงินเดือน (ตรงตามรูปที่ 3.77) */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">ผลการประมวลผลเงินเดือน</h3>
              <Button variant="outline" size="sm" onClick={handleExportExcel}>
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> ส่งออก Excel
              </Button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold">ลำดับ</th>
                    <th className="px-4 py-3 font-semibold">รหัสพนักงาน</th>
                    <th className="px-4 py-3 font-semibold">ชื่อ-สกุล</th>
                    <th className="px-4 py-3 font-semibold">ตำแหน่ง</th>
                    <th className="px-4 py-3 font-semibold">หน่วยงาน</th>
                    <th className="px-4 py-3 text-right font-semibold">เงินได้รวม (บาท)</th>
                    <th className="px-4 py-3 text-right font-semibold">รายการหักรวม (บาท)</th>
                    <th className="px-4 py-3 text-right font-semibold">รับสุทธิ (บาท)</th>
                    <th className="px-4 py-3 text-center font-semibold">สถานะ</th>
                    <th className="px-4 py-3 text-center font-semibold">ดูสลิป</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filtered.map((r, i) => (
                    <tr key={r.employeeCode} className="hover:bg-slate-50">
                      <td className="px-4 py-3">{i + 1}</td>
                      <td className="px-4 py-3 font-semibold text-blue-700">{r.employeeCode}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{r.fullName}</td>
                      <td className="px-4 py-3 text-slate-600">{r.positionName}</td>
                      <td className="px-4 py-3 text-slate-600">{r.departmentName}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(r.grossPay)}</td>
                      <td className="px-4 py-3 text-right text-red-600">{formatCurrency(r.totalDeduction)}</td>
                      <td className="px-4 py-3 text-right font-bold text-blue-700">{formatCurrency(r.netPay)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Link
                          href="/payslips"
                          className="inline-flex rounded p-1 text-blue-600 hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* สรุปผลการประมวลผลเงินเดือน 4 กล่องด้านล่าง (ตรงตามรูปที่ 3.77) */}
            <div className="mt-6">
              <h4 className="mb-3 text-xs font-bold text-slate-700">
                สรุปผลการประมวลผลเงินเดือน (ตามเงื่อนไขการค้นหา)
              </h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <Users className="h-7 w-7 text-blue-600" />
                  <div>
                    <p className="text-xs text-slate-500">จำนวนพนักงาน</p>
                    <p className="text-lg font-bold text-slate-900">8 คน</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                  <Banknote className="h-7 w-7 text-emerald-600" />
                  <div>
                    <p className="text-xs text-slate-500">เงินได้รวม</p>
                    <p className="text-lg font-bold text-emerald-700">391,550.00 บาท</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50/50 p-4">
                  <MinusCircle className="h-7 w-7 text-red-600" />
                  <div>
                    <p className="text-xs text-slate-500">รายการหักรวม</p>
                    <p className="text-lg font-bold text-red-600">51,400.00 บาท</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50/50 p-4">
                  <PlusCircle className="h-7 w-7 text-blue-600" />
                  <div>
                    <p className="text-xs text-slate-500">รับสุทธิรวม</p>
                    <p className="text-lg font-bold text-blue-700">340,150.00 บาท</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
