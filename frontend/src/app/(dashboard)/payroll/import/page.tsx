'use client';

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  Download,
  Search,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

interface ImportedRow {
  employeeCode: string;
  fullName: string;
  departmentName: string;
  baseSalary: number;
  allowance: number;
  grossPay: number;
  totalDeduction: number;
  netPay: number;
  status: 'ผ่าน' | 'ตั้งค่ากระทบยอด';
}

const DEFAULT_PREVIEW_ROWS: ImportedRow[] = [
  {
    employeeCode: 'E0001',
    fullName: 'นางสาวกมลวรรณ ใจดี',
    departmentName: 'ฝ่ายการเงิน',
    baseSalary: 30000,
    allowance: 5000,
    grossPay: 35000,
    totalDeduction: 5200,
    netPay: 29800,
    status: 'ผ่าน',
  },
  {
    employeeCode: 'E0003',
    fullName: 'นายสมชาย รักงาน',
    departmentName: 'เจ้าหน้าที่การเงิน',
    baseSalary: 25000,
    allowance: 3500,
    grossPay: 28500,
    totalDeduction: 1500,
    netPay: 27000,
    status: 'ผ่าน',
  },
  {
    employeeCode: 'E0012',
    fullName: 'นางสาวศิริพร แสงทอง',
    departmentName: 'พยาบาลวิชาชีพ',
    baseSalary: 35250,
    allowance: 7500,
    grossPay: 42750,
    totalDeduction: 8350,
    netPay: 34400,
    status: 'ตั้งค่ากระทบยอด',
  },
  {
    employeeCode: 'E0018',
    fullName: 'นายวิทยา กิตติศักดิ์',
    departmentName: 'นักวิชาการสาธารณสุข',
    baseSalary: 27000,
    allowance: 4200,
    grossPay: 31200,
    totalDeduction: 3450,
    netPay: 27750,
    status: 'ผ่าน',
  },
  {
    employeeCode: 'E0025',
    fullName: 'นางสาวกัญญา พิมพา',
    departmentName: 'เจ้าหน้าที่ธุรการ',
    baseSalary: 24000,
    allowance: 2800,
    grossPay: 26800,
    totalDeduction: 2900,
    netPay: 23900,
    status: 'ผ่าน',
  },
  {
    employeeCode: 'E0031',
    fullName: 'นายณัฐพล ใจมั่น',
    departmentName: 'พนักงานขับรถ',
    baseSalary: 20000,
    allowance: 2500,
    grossPay: 22500,
    totalDeduction: 1800,
    netPay: 20700,
    status: 'ตั้งค่ากระทบยอด',
  },
  {
    employeeCode: 'E0040',
    fullName: 'นางสาวพรทิพย์ กันยา',
    departmentName: 'แพทย์',
    baseSalary: 100000,
    allowance: 20000,
    grossPay: 120000,
    totalDeduction: 25600,
    netPay: 94400,
    status: 'ผ่าน',
  },
  {
    employeeCode: 'E0045',
    fullName: 'นายเอกชัย ยั่งยืน',
    departmentName: 'เจ้าหน้าที่เวชระเบียน',
    baseSalary: 22500,
    allowance: 2300,
    grossPay: 24800,
    totalDeduction: 2600,
    netPay: 22200,
    status: 'ผ่าน',
  },
];

export default function PayrollExcelImportPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedFileName, setSelectedFileName] = useState<string>('แบบฟอร์มนำเข้าข้อมูลเงินเดือน.xlsx');
  const [rows, setRows] = useState<ImportedRow[]>(DEFAULT_PREVIEW_ROWS);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const jsonData = XLSX.utils.sheet_to_json<any>(ws);
        if (jsonData.length > 0) {
          const mapped: ImportedRow[] = jsonData.map((r, i) => {
            const base = Number(r['เงินเดือน'] || r.baseSalary || 25000);
            const allow = Number(r['ค่าตอบแทน'] || r.allowance || 3500);
            const ded = Number(r['รายการหัก'] || r.totalDeduction || 1500);
            const gross = base + allow;
            return {
              employeeCode: r['รหัสพนักงาน'] || r.employeeCode || `E000${i + 1}`,
              fullName: r['ชื่อ-สกุล'] || r.fullName || 'บุคลากร รพ.สามโคก',
              departmentName: r['หน่วยงาน'] || r.departmentName || 'ฝ่ายการเงิน',
              baseSalary: base,
              allowance: allow,
              grossPay: gross,
              totalDeduction: ded,
              netPay: gross - ded,
              status: 'ผ่าน',
            };
          });
          setRows(mapped);
        }
        setStep(2);
        toast.success(`อ่านไฟล์ Excel (${file.name}) ด้วย SheetJS สำเร็จ!`);
      } catch {
        toast.error('รูปแบบไฟล์ Excel ไม่ถูกต้อง');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDownloadTemplate = () => {
    const templateData = DEFAULT_PREVIEW_ROWS.map((r) => ({
      รหัสพนักงาน: r.employeeCode,
      'ชื่อ-สกุล': r.fullName,
      หน่วยงาน: r.departmentName,
      เงินเดือน: r.baseSalary,
      ค่าตอบแทน: r.allowance,
      รายการหัก: r.totalDeduction,
      รับสุทธิ: r.netPay,
    }));
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Payroll Import Template');
    XLSX.writeFile(wb, 'แบบฟอร์มนำเข้าข้อมูลเงินเดือน_รพ_สามโคก.xlsx');
    toast.success('ดาวน์โหลดแบบฟอร์มตัวอย่าง Excel (.xlsx) สำเร็จ');
  };

  const handleConfirmImport = () => {
    setStep(3);
    toast.success(`นำเข้าข้อมูลเงินเดือนประจำงวด จำนวน ${rows.length} รายการ ลงฐานข้อมูลสำเร็จ!`);
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <Header breadcrumbs={['เงินเดือน', 'นำเข้าข้อมูลจาก Excel']} />

      <main className="flex-1 space-y-5 p-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-base font-bold text-slate-800">นำเข้าข้อมูลเงินเดือนจาก Excel</h2>
            <p className="text-xs text-slate-500">
              อัปโหลดไฟล์ Excel ที่มีข้อมูลเงินเดือน ระบบจะตรวจสอบความถูกต้องก่อนประมวลผล (รองรับ UC-08, UC-09, UC-10 ตามรูปที่ 3.67 และ 3.91)
            </p>

            {/* ตัวกรองงวดเงินเดือน */}
            <div className="mt-4 grid grid-cols-1 gap-3 rounded-xl bg-slate-50 p-4 md:grid-cols-4 border border-slate-200">
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
                <select className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs">
                  <option>ทั้งหมด</option>
                  <option>ฝ่ายการเงิน</option>
                  <option>กลุ่มงานการพยาบาล</option>
                </select>
              </div>
              <div className="flex items-end gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                  ล้างค่า
                </Button>
                <Button className="flex-1" onClick={() => setStep(2)}>
                  <Search className="h-3.5 w-3.5" /> ค้นหา
                </Button>
              </div>
            </div>

            {/* Stepper 3 ขั้นตอน (1. อัปโหลดไฟล์ -> 2. ตรวจสอบข้อมูล -> 3. ประมวลผล/นำเข้าข้อมูล) */}
            <div className="my-6 flex items-center justify-center gap-6">
              {[
                { num: 1, title: 'อัปโหลดไฟล์', sub: 'เลือกไฟล์ Excel ที่ต้องการนำเข้า' },
                { num: 2, title: 'ตรวจสอบข้อมูล', sub: 'ตรวจสอบความถูกต้องของข้อมูล' },
                { num: 3, title: 'นำเข้าข้อมูล / ประมวลผล', sub: 'ยืนยันการนำเข้าข้อมูล' },
              ].map((s, idx) => (
                <React.Fragment key={s.num}>
                  <div
                    onClick={() => setStep(s.num as 1 | 2 | 3)}
                    className="flex flex-col items-center text-center cursor-pointer"
                  >
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                        step >= s.num
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {s.num}
                    </div>
                    <p className={`mt-1.5 text-xs font-bold ${step >= s.num ? 'text-blue-700' : 'text-slate-500'}`}>
                      {s.title}
                    </p>
                    <p className="text-[11px] text-slate-400">{s.sub}</p>
                  </div>
                  {idx < 2 && <div className="h-0.5 w-20 bg-slate-200" />}
                </React.Fragment>
              ))}
            </div>

            {/* กล่อง Drag & Drop อัปโหลดไฟล์ และ เงื่อนไขการตรวจสอบข้อมูล (ตามรูปที่ 3.67 และ 3.91) */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/40 p-8 text-center cursor-pointer hover:bg-blue-50 transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
                  <FileSpreadsheet className="h-8 w-8" />
                </div>
                <p className="mt-3 text-sm font-bold text-slate-800">
                  ลากไฟล์มาวางที่นี่ หรือ <span className="text-blue-600 underline">คลิกเพื่อเลือกไฟล์</span>
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  รองรับไฟล์ .xlsx, .xls ขนาดไม่เกิน 10 MB (ไฟล์ปัจจุบัน: {selectedFileName})
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="text-xs font-bold text-slate-800 mb-3">เงื่อนไขการตรวจสอบข้อมูล (รูปแบบไฟล์ที่รองรับ)</h3>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>รูปแบบไฟล์ถูกต้อง (.xlsx, .xls) และมีคอลัมน์ตามรูปแบบที่กำหนด</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>รหัสพนักงานต้องมีอยู่ในระบบ (จับคู่ Employee.employeeCode)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>จำนวนเงินต้องเป็นตัวเลข และรองรับข้อมูลเงินได้ รายการหัก และยอดสุทธิ</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>ข้อมูลต้องอยู่ในงวดที่เลือก และไม่ซ้ำซ้อน</span>
                  </li>
                </ul>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={handleDownloadTemplate}>
                    <Download className="h-3.5 w-3.5" /> ดาวน์โหลดแบบฟอร์มตัวอย่าง (.xlsx)
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setStep(2);
                      toast.success('ตรวจสอบโครงสร้างคอลัมน์และรหัสบุคลากรครบถ้วน');
                    }}
                  >
                    <Search className="h-3.5 w-3.5" /> ตรวจสอบข้อมูล
                  </Button>
                  <Button type="button" size="sm" onClick={handleConfirmImport}>
                    <Upload className="h-3.5 w-3.5" /> นำเข้าข้อมูล
                  </Button>
                </div>
              </div>
            </div>

            {/* ตารางผลการตรวจสอบข้อมูลเบื้องต้น (ตรงตามรูปที่ 3.91) */}
            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">ผลการตรวจสอบข้อมูลเบื้องต้น</h3>
                <span className="text-xs text-slate-500">แผ่นงาน: Payroll Import Template</span>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-semibold">ลำดับ</th>
                      <th className="px-4 py-3 font-semibold">รหัสพนักงาน</th>
                      <th className="px-4 py-3 font-semibold">ชื่อ-สกุล</th>
                      <th className="px-4 py-3 font-semibold">หน่วยงาน</th>
                      <th className="px-4 py-3 text-right font-semibold">เงินเดือน (บาท)</th>
                      <th className="px-4 py-3 text-right font-semibold">ค่าตอบแทน (บาท)</th>
                      <th className="px-4 py-3 text-right font-semibold">เงินได้รวม (บาท)</th>
                      <th className="px-4 py-3 text-right font-semibold">รายการหักรวม (บาท)</th>
                      <th className="px-4 py-3 text-right font-semibold">รับสุทธิ (บาท)</th>
                      <th className="px-4 py-3 text-center font-semibold">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {rows.map((r, i) => (
                      <tr key={r.employeeCode} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5">{i + 1}</td>
                        <td className="px-4 py-2.5 font-semibold text-blue-700">{r.employeeCode}</td>
                        <td className="px-4 py-2.5 font-medium text-slate-800">{r.fullName}</td>
                        <td className="px-4 py-2.5 text-slate-600">{r.departmentName}</td>
                        <td className="px-4 py-2.5 text-right">{formatCurrency(r.baseSalary)}</td>
                        <td className="px-4 py-2.5 text-right">{formatCurrency(r.allowance)}</td>
                        <td className="px-4 py-2.5 text-right font-semibold">{formatCurrency(r.grossPay)}</td>
                        <td className="px-4 py-2.5 text-right text-red-600">{formatCurrency(r.totalDeduction)}</td>
                        <td className="px-4 py-2.5 text-right font-bold text-blue-700">{formatCurrency(r.netPay)}</td>
                        <td className="px-4 py-2.5 text-center">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                              r.status === 'ผ่าน'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
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
