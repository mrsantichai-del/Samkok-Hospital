'use client';

import React from 'react';
import {
  Users,
  Banknote,
  Wallet,
  PlusCircle,
  MinusCircle,
  Clock,
  Search,
  RotateCcw,
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDashboardStore } from '@/store/useDashboardStore';
import { formatCurrency } from '@/lib/utils';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

const MONTHLY_TREND_DATA = [
  { month: 'เม.ย. 2567', เงินเดือน: 9600000, ค่าตอบแทน: 1520000, รายการหัก: 1050000 },
  { month: 'พ.ค. 2567', เงินเดือน: 9850000, ค่าตอบแทน: 1580000, รายการหัก: 1080000 },
  { month: 'มิ.ย. 2567', เงินเดือน: 10100000, ค่าตอบแทน: 1620000, รายการหัก: 1090000 },
  { month: 'ก.ค. 2567', เงินเดือน: 10300000, ค่าตอบแทน: 1650000, รายการหัก: 1100000 },
  { month: 'ส.ค. 2567', เงินเดือน: 10600000, ค่าตอบแทน: 1690000, รายการหัก: 1120000 },
  { month: 'ก.ย. 2567', เงินเดือน: 12845000, ค่าตอบแทน: 1730000, รายการหัก: 1135000 },
];

const CATEGORY_SHARE_DATA = [
  { name: 'เงินเดือน', value: 10250000, percent: '79.8%', color: '#2563eb' },
  { name: 'OT/เวร', value: 1050000, percent: '8.2%', color: '#0ea5e9' },
  { name: 'วิชาชีพ', value: 720000, percent: '5.6%', color: '#10b981' },
  { name: 'สวัสดิการ', value: 460000, percent: '3.6%', color: '#f59e0b' },
  { name: 'รายการหัก', value: 365000, percent: '2.8%', color: '#ef4444' },
];

const DEPT_BAR_DATA = [
  { name: 'กลุ่มการพยาบาล', amount: 4750000 },
  { name: 'เภสัชกรรม', amount: 2150000 },
  { name: 'เวชระเบียน', amount: 1850000 },
  { name: 'บริหารทั่วไป', amount: 1650000 },
  { name: 'ห้องปฏิบัติการ', amount: 1420000 },
];

const DEPT_SUMMARY_TABLE = [
  {
    dept: 'กลุ่มการพยาบาล',
    staff: 136,
    salary: 4210000,
    extra: 980000,
    deduction: 430000,
    net: 4760000,
    share: '37.0%',
    status: 'APPROVED',
  },
  {
    dept: 'เภสัชกรรม',
    staff: 52,
    salary: 1750000,
    extra: 280000,
    deduction: 180000,
    net: 1850000,
    share: '17.2%',
    status: 'APPROVED',
  },
  {
    dept: 'เวชระเบียน',
    staff: 48,
    salary: 1480000,
    extra: 210000,
    deduction: 150000,
    net: 1540000,
    share: '12.6%',
    status: 'PENDING_APPROVAL',
  },
  {
    dept: 'บริหารทั่วไป',
    staff: 78,
    salary: 1550000,
    extra: 140000,
    deduction: 195000,
    net: 1495000,
    share: '14.4%',
    status: 'APPROVED',
  },
  {
    dept: 'ห้องปฏิบัติการ',
    staff: 114,
    salary: 1260000,
    extra: 120000,
    deduction: 180000,
    net: 1200000,
    share: '18.8%',
    status: 'APPROVED',
  },
];

export default function ExecutiveDashboardPage() {
  const { filter, setFilter, resetFilter } = useDashboardStore();

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(DEPT_SUMMARY_TABLE);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Executive_Summary');
    XLSX.writeFile(wb, 'รายงานสรุปผู้บริหาร_รพ_สามโคก.xlsx');
    toast.success('ส่งออกรายงานผู้บริหารเป็นไฟล์ Excel (.xlsx) สำเร็จ (UC-21)');
  };

  const handleExportPdf = () => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    window.open(`${apiBase}/me/payslip/period-2569-10/pdf`, '_blank');
    toast.success('กำลังสร้างและส่งออกรายงาน PDF สำหรับผู้บริหาร (UC-21)');
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <Header breadcrumbs={['รายงาน', 'รายงานสรุปและแดชบอร์ด']} />

      <main className="flex-1 space-y-5 p-6">
        {/* ส่วนหัวและตัวกรองแดชบอร์ดผู้บริหาร (ตรงตามรูปที่ 3.80, 3.85, 3.92 - UC-19, UC-21) */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-slate-900">รายงานสรุปและแดชบอร์ดสำหรับผู้บริหาร</h2>
            <p className="text-xs text-slate-500">
              ติดตามภาพรวมการเบิกจ่ายเงินเดือน ค่าตอบแทน และค่าใช้จ่ายด้านบุคลากรของโรงพยาบาลสามโคกแบบเรียลไทม์
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">งวดเงินเดือน</label>
                <select
                  value={filter.selectedPeriod}
                  onChange={(e) => setFilter({ selectedPeriod: e.target.value })}
                  className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs"
                >
                  <option>กันยายน 2567</option>
                  <option>ตุลาคม 2569</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">ปีงบประมาณ</label>
                <select
                  value={filter.selectedYear}
                  onChange={(e) => setFilter({ selectedYear: e.target.value })}
                  className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs"
                >
                  <option>2567</option>
                  <option>2569</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">หน่วยงาน</label>
                <select
                  value={filter.selectedDepartment}
                  onChange={(e) => setFilter({ selectedDepartment: e.target.value })}
                  className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs"
                >
                  <option>ทุกหน่วยงาน</option>
                  <option>กลุ่มการพยาบาล</option>
                  <option>เภสัชกรรม</option>
                </select>
              </div>
              <div className="flex items-end gap-2">
                <Button className="flex-1">
                  <Search className="h-3.5 w-3.5" /> ค้นหารายงาน
                </Button>
                <Button variant="outline" onClick={resetFilter}>
                  <RotateCcw className="h-3.5 w-3.5" /> รีเซ็ต
                </Button>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">ประเภทบุคลากร</label>
                <select
                  value={filter.selectedPersonnelType}
                  onChange={(e) => setFilter({ selectedPersonnelType: e.target.value })}
                  className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs"
                >
                  <option>ทั้งหมด</option>
                  <option>ข้าราชการ</option>
                  <option>พนักงานราชการ</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">รูปแบบเปรียบเทียบ</label>
                <select className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs">
                  <option>รายเดือน</option>
                  <option>รายไตรมาส</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">คำค้นหา</label>
                <Input
                  value={filter.keyword}
                  onChange={(e) => setFilter({ keyword: e.target.value })}
                  placeholder="ค้นหาหน่วยงานหรือรายการ..."
                />
              </div>
              <div className="flex items-end gap-2">
                <Button variant="outline" className="flex-1" onClick={handleExportPdf}>
                  <FileText className="h-3.5 w-3.5 text-red-600" /> ส่งออก PDF
                </Button>
                <Button variant="outline" className="flex-1" onClick={handleExportExcel}>
                  <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" /> ส่งออก Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* การ์ด KPI 6 ใบ (ตรงตามรูปที่ 3.80 และ 3.85 ทุกตัวเลข) */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
            <div className="flex items-center gap-2 text-blue-600">
              <Users className="h-4 w-4" />
              <span className="text-[11px] text-slate-500">บุคลากรทั้งหมด</span>
            </div>
            <p className="mt-1.5 text-lg font-extrabold text-slate-900">428 คน</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-600">
              <Banknote className="h-4 w-4" />
              <span className="text-[11px] text-slate-500">ค่าใช้จ่ายบุคลากรรวม</span>
            </div>
            <p className="mt-1.5 text-lg font-extrabold text-emerald-700">12,845,000 บาท</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
            <div className="flex items-center gap-2 text-blue-600">
              <Wallet className="h-4 w-4" />
              <span className="text-[11px] text-slate-500">เงินเดือนรวม</span>
            </div>
            <p className="mt-1.5 text-lg font-extrabold text-blue-700">10,250,000 บาท</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
            <div className="flex items-center gap-2 text-amber-600">
              <PlusCircle className="h-4 w-4" />
              <span className="text-[11px] text-slate-500">เงินได้เพิ่มเติม</span>
            </div>
            <p className="mt-1.5 text-lg font-extrabold text-slate-900">1,730,000 บาท</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
            <div className="flex items-center gap-2 text-red-600">
              <MinusCircle className="h-4 w-4" />
              <span className="text-[11px] text-slate-500">รายการหักรวม</span>
            </div>
            <p className="mt-1.5 text-lg font-extrabold text-red-600">1,135,000 บาท</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
            <div className="flex items-center gap-2 text-indigo-600">
              <Clock className="h-4 w-4" />
              <span className="text-[11px] text-slate-500">งบประมาณคงเหลือ</span>
            </div>
            <p className="mt-1.5 text-lg font-extrabold text-indigo-700">2,450,000 บาท</p>
          </div>
        </div>

        {/* แถวกราฟที่ 1: แนวโน้มค่าใช้จ่ายรายเดือน (LineChart) & สัดส่วนค่าใช้จ่ายตามหมวด (PieChart) */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardContent className="p-5">
              <h3 className="mb-3 text-sm font-bold text-slate-800">แนวโน้มค่าใช้จ่ายรายเดือน (Recharts)</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={MONTHLY_TREND_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(val: any) => `${Number(val).toLocaleString()} บาท`} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="เงินเดือน" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="ค่าตอบแทน" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="รายการหัก" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardContent className="p-5">
              <h3 className="mb-3 text-sm font-bold text-slate-800">สัดส่วนค่าใช้จ่ายตามหมวด</h3>
              <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-2">
                <div className="relative h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={CATEGORY_SHARE_DATA}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                      >
                        {CATEGORY_SHARE_DATA.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: any) => `${Number(val).toLocaleString()} บาท`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-extrabold text-slate-900">12,845,000</span>
                    <span className="text-[10px] text-slate-500">บาท</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  {CATEGORY_SHARE_DATA.map((c) => (
                    <div key={c.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="text-slate-700">{c.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-slate-800 mr-2">{c.percent}</span>
                        <span className="text-[11px] text-slate-500">{c.value.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* แถวที่ 2: ค่าใช้จ่ายตามหน่วยงาน (BarChart) & สถานะงวดเงินเดือน (4 การ์ด) */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardContent className="p-5">
              <h3 className="mb-3 text-sm font-bold text-slate-800">ค่าใช้จ่ายตามหน่วยงาน</h3>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={DEPT_BAR_DATA} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(val: any) => `${Number(val).toLocaleString()} บาท`} />
                    <Bar dataKey="amount" fill="#2563eb" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardContent className="p-5">
              <h3 className="mb-3 text-sm font-bold text-slate-800">สถานะงวดเงินเดือน</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                  <p className="text-[11px] font-bold text-slate-500">DRAFT</p>
                  <p className="mt-1 text-lg font-extrabold text-slate-800">12 งวด</p>
                  <p className="text-[11px] text-slate-500">3,210,400 บาท</p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5">
                  <p className="text-[11px] font-bold text-amber-700">PENDING_APPROVAL</p>
                  <p className="mt-1 text-lg font-extrabold text-amber-800">5 งวด</p>
                  <p className="text-[11px] text-amber-700">1,880,600 บาท</p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5">
                  <p className="text-[11px] font-bold text-emerald-700">APPROVED</p>
                  <p className="mt-1 text-lg font-extrabold text-emerald-800">23 งวด</p>
                  <p className="text-[11px] text-emerald-700">6,950,000 บาท</p>
                </div>
                <div className="rounded-xl border border-red-200 bg-red-50/60 p-3.5">
                  <p className="text-[11px] font-bold text-red-700">RETURNED</p>
                  <p className="mt-1 text-lg font-extrabold text-red-800">2 งวด</p>
                  <p className="text-[11px] text-red-700">404,000 บาท</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* แถวที่ 3: ตารางสรุปรายหน่วยงาน & กล่องข้อมูลเชิงบริหาร (ตรงตามรูปที่ 3.80) */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardContent className="p-5">
              <h3 className="mb-3 text-sm font-bold text-slate-800">สรุปรายหน่วยงาน</h3>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2.5">หน่วยงาน</th>
                      <th className="px-3 py-2.5 text-center">บุคลากร</th>
                      <th className="px-3 py-2.5 text-right">เงินเดือนรวม</th>
                      <th className="px-3 py-2.5 text-right">เงินได้เพิ่มเติม</th>
                      <th className="px-3 py-2.5 text-right">รายการหัก</th>
                      <th className="px-3 py-2.5 text-right">เงินได้สุทธิ</th>
                      <th className="px-3 py-2.5 text-center">% ค่าใช้จ่าย</th>
                      <th className="px-3 py-2.5 text-center">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {DEPT_SUMMARY_TABLE.map((row) => (
                      <tr key={row.dept} className="hover:bg-slate-50">
                        <td className="px-3 py-2.5 font-medium">{row.dept}</td>
                        <td className="px-3 py-2.5 text-center">{row.staff}</td>
                        <td className="px-3 py-2.5 text-right">{row.salary.toLocaleString()}</td>
                        <td className="px-3 py-2.5 text-right">{row.extra.toLocaleString()}</td>
                        <td className="px-3 py-2.5 text-right text-red-600">{row.deduction.toLocaleString()}</td>
                        <td className="px-3 py-2.5 text-right font-bold">{row.net.toLocaleString()}</td>
                        <td className="px-3 py-2.5 text-center">{row.share}</td>
                        <td className="px-3 py-2.5 text-center">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              row.status === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 font-bold">
                      <td className="px-3 py-2.5">รวมทั้งสิ้น</td>
                      <td className="px-3 py-2.5 text-center">428</td>
                      <td className="px-3 py-2.5 text-right">10,250,000</td>
                      <td className="px-3 py-2.5 text-right">1,730,000</td>
                      <td className="px-3 py-2.5 text-right text-red-600">1,135,000</td>
                      <td className="px-3 py-2.5 text-right text-blue-700">10,845,000</td>
                      <td className="px-3 py-2.5 text-center">100.0%</td>
                      <td />
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardContent className="p-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-800">ข้อมูลเชิงบริหาร (Executive Insights)</h3>

              <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50/60 p-3.5 text-xs">
                <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-blue-900">ค่าใช้จ่ายสูงสุดอยู่ที่กลุ่มการพยาบาล</p>
                  <p className="text-slate-600 mt-0.5">
                    คิดเป็น 37.0% ของค่าใช้จ่ายรวมทุกหน่วยงาน จำนวน 4,760,000 บาท
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 text-xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-emerald-900">งบประมาณคงเหลือ 16.0%</p>
                  <p className="text-slate-600 mt-0.5">
                    จากงบประมาณทั้งหมด 15,295,000 บาท คงเหลือ 2,450,000 บาท
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 text-xs">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-900">ค่า OT เพิ่มขึ้น 8% จากเดือนก่อน</p>
                  <p className="text-slate-600 mt-0.5">
                    จาก 972,000 บาท เป็น 1,050,000 บาท
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
