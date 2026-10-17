'use client';

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import {
  Search,
  FileSpreadsheet,
  Users,
  Banknote,
  MinusCircle,
  Calculator,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

const DEPT_COST_ROWS = [
  {
    order: 1,
    departmentName: 'ฝ่ายการเงิน',
    employeeCount: 28,
    grossPay: 812450.0,
    totalDeduction: 132600.0,
    netPay: 679850.0,
  },
  {
    order: 2,
    departmentName: 'ฝ่ายทรัพยากรบุคคล',
    employeeCount: 12,
    grossPay: 358200.0,
    totalDeduction: 61480.0,
    netPay: 296720.0,
  },
  {
    order: 3,
    departmentName: 'ฝ่ายการแพทย์',
    employeeCount: 45,
    grossPay: 1285600.0,
    totalDeduction: 238750.0,
    netPay: 1046850.0,
  },
  {
    order: 4,
    departmentName: 'ฝ่ายพยาบาล',
    employeeCount: 32,
    grossPay: 754320.0,
    totalDeduction: 130900.0,
    netPay: 623420.0,
  },
  {
    order: 5,
    departmentName: 'ฝ่ายสนับสนุนบริการ',
    employeeCount: 18,
    grossPay: 512430.0,
    totalDeduction: 92410.0,
    netPay: 420020.0,
  },
  {
    order: 6,
    departmentName: 'ฝ่ายบริหารทั่วไป',
    employeeCount: 10,
    grossPay: 356600.0,
    totalDeduction: 62180.0,
    netPay: 294420.0,
  },
  {
    order: 7,
    departmentName: 'ฝ่ายเภสัชกรรม',
    employeeCount: 5,
    grossPay: 146000.0,
    totalDeduction: 24500.0,
    netPay: 121500.0,
  },
];

export default function DepartmentCostReportPage() {
  const [selectedDept, setSelectedDept] = useState('ทั้งหมด');

  const filtered = DEPT_COST_ROWS.filter((d) =>
    selectedDept === 'ทั้งหมด' ? true : d.departmentName === selectedDept,
  );

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filtered);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Department_Cost');
    XLSX.writeFile(wb, 'รายงานสรุปค่าใช้จ่ายเงินเดือนตามหน่วยงาน_2569.xlsx');
    toast.success('ส่งออกรายงานสรุปค่าใช้จ่ายเงินเดือนตามหน่วยงานเป็นไฟล์ Excel สำเร็จ (UC-21)');
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <Header breadcrumbs={['รายงาน', 'รายงานสรุปค่าใช้จ่ายเงินเดือนตามหน่วยงาน']} />

      <main className="flex-1 space-y-5 p-6">
        {/* เงื่อนไขการค้นหา (ตรงตามรูปที่ 3.81 - UC-20 & UC-21) */}
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 text-base font-bold text-slate-800">เงื่อนไขการค้นหา</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
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
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs"
                >
                  <option value="ทั้งหมด">ทั้งหมด</option>
                  {DEPT_COST_ROWS.map((d) => (
                    <option key={d.order} value={d.departmentName}>
                      {d.departmentName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedDept('ทั้งหมด')}>
                  ล้างค่า
                </Button>
                <Button>
                  <Search className="h-4 w-4" /> ค้นหา
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* การ์ดสรุปค่าใช้จ่ายเงินเดือนตามหน่วยงาน 4 ใบ (ตรงตามรูปที่ 3.81) */}
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4 text-sm font-bold text-slate-800">สรุปค่าใช้จ่ายเงินเดือนตามหน่วยงาน</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <Users className="h-7 w-7 text-blue-600" />
                <div>
                  <p className="text-xs text-slate-500">จำนวนพนักงานรวม</p>
                  <p className="text-lg font-bold text-slate-900">150 คน</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                <Banknote className="h-7 w-7 text-emerald-600" />
                <div>
                  <p className="text-xs text-slate-500">เงินได้รวม</p>
                  <p className="text-lg font-bold text-emerald-700">4,325,600.00 บาท</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50/50 p-4">
                <MinusCircle className="h-7 w-7 text-red-600" />
                <div>
                  <p className="text-xs text-slate-500">รายการหักรวม</p>
                  <p className="text-lg font-bold text-red-600">754,320.00 บาท</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50/50 p-4">
                <Calculator className="h-7 w-7 text-blue-600" />
                <div>
                  <p className="text-xs text-slate-500">ค่าใช้จ่ายเงินเดือนสุทธิ</p>
                  <p className="text-lg font-bold text-blue-700">3,571,280.00 บาท</p>
                </div>
              </div>
            </div>

            {/* ตารางรายละเอียดค่าใช้จ่ายเงินเดือนตามหน่วยงาน (ตรงตามรูปที่ 3.81) */}
            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-800">รายละเอียดค่าใช้จ่ายเงินเดือนตามหน่วยงาน</h4>
                <Button variant="outline" size="sm" onClick={handleExportExcel}>
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> ส่งออก Excel
                </Button>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-semibold">ลำดับ</th>
                      <th className="px-4 py-3 font-semibold">หน่วยงาน</th>
                      <th className="px-4 py-3 text-center font-semibold">จำนวนพนักงาน (คน)</th>
                      <th className="px-4 py-3 text-right font-semibold">เงินได้รวม (บาท)</th>
                      <th className="px-4 py-3 text-right font-semibold">รายการหักรวม (บาท)</th>
                      <th className="px-4 py-3 text-right font-semibold">รับสุทธิ (บาท)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filtered.map((row) => (
                      <tr key={row.order} className="hover:bg-slate-50">
                        <td className="px-4 py-3">{row.order}</td>
                        <td className="px-4 py-3 font-medium text-slate-800">{row.departmentName}</td>
                        <td className="px-4 py-3 text-center">{row.employeeCount}</td>
                        <td className="px-4 py-3 text-right">{formatCurrency(row.grossPay)}</td>
                        <td className="px-4 py-3 text-right text-red-600">{formatCurrency(row.totalDeduction)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-900">
                          {formatCurrency(row.netPay)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-blue-50/60 font-bold text-slate-900">
                      <td colSpan={2} className="px-4 py-3 text-center">
                        รวมทั้งสิ้น
                      </td>
                      <td className="px-4 py-3 text-center">150</td>
                      <td className="px-4 py-3 text-right text-emerald-700">4,325,600.00</td>
                      <td className="px-4 py-3 text-right text-red-600">754,320.00</td>
                      <td className="px-4 py-3 text-right text-blue-700">3,571,280.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
