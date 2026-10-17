'use client';

import React, { useState } from 'react';
import { Calendar, CheckCircle2, Eye, Download, Search, Info } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';

const HISTORY_ITEMS = [
  {
    periodName: 'กันยายน 2567',
    slipNo: 'SLIP6709-000123',
    payDate: '30/09/2567',
    netPay: 30300.0,
    status: 'APPROVED',
  },
  {
    periodName: 'สิงหาคม 2567',
    slipNo: 'SLIP6708-000118',
    payDate: '30/08/2567',
    netPay: 29850.0,
    status: 'APPROVED',
  },
  {
    periodName: 'กรกฎาคม 2567',
    slipNo: 'SLIP6707-000115',
    payDate: '31/07/2567',
    netPay: 29850.0,
    status: 'APPROVED',
  },
  {
    periodName: 'มิถุนายน 2567',
    slipNo: 'SLIP6706-000110',
    payDate: '28/06/2567',
    netPay: 29300.0,
    status: 'APPROVED',
  },
  {
    periodName: 'พฤษภาคม 2567',
    slipNo: 'SLIP6705-000107',
    payDate: '31/05/2567',
    netPay: 29300.0,
    status: 'APPROVED',
  },
  {
    periodName: 'เมษายน 2567',
    slipNo: 'SLIP6704-000102',
    payDate: '30/04/2567',
    netPay: 28900.0,
    status: 'APPROVED',
  },
];

export default function MyPayslipHistoryPage() {
  const [keyword, setKeyword] = useState('');
  const [year, setYear] = useState('2567');

  const filtered = HISTORY_ITEMS.filter(
    (item) =>
      item.slipNo.toLowerCase().includes(keyword.toLowerCase()) ||
      item.periodName.includes(keyword),
  );

  const handleDownloadPdf = (slipNo: string) => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    window.open(`${apiBase}/me/payslip/${slipNo}/pdf?employeeCode=E0001`, '_blank');
    toast.success(`ดาวน์โหลดสลิป ${slipNo}.pdf สำเร็จ`);
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <Header breadcrumbs={['เงินเดือน', 'ประวัติเงินเดือนย้อนหลัง']} />

      <main className="flex-1 space-y-5 p-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-base font-bold text-slate-800">
              ประวัติใบแสดงรายการเงินเดือนย้อนหลัง
            </h2>
            <p className="text-xs text-slate-500">
              คุณสามารถดูประวัติใบแสดงรายการเงินเดือนของงวดที่ได้รับการอนุมัติแล้ว และสามารถดูรายละเอียดหรือดาวน์โหลดย้อนหลังได้ (UC-23 รูปที่ 3.79)
            </p>

            {/* แถบตัวกรองค้นหา */}
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">ปีงบประมาณ</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs"
                >
                  <option value="2567">2567</option>
                  <option value="2568">2568</option>
                  <option value="2569">2569</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">งวดเงินเดือน</label>
                <select className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs">
                  <option>ทั้งหมด</option>
                  <option>กันยายน 2567</option>
                  <option>สิงหาคม 2567</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">ค้นหาเลขที่สลิป</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="ค้นหาเลขที่สลิป..."
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="flex items-end gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setKeyword('')}>
                  รีเซ็ต
                </Button>
                <Button className="flex-1">
                  <Search className="h-3.5 w-3.5" /> ค้นหา
                </Button>
              </div>
            </div>

            {/* การ์ดสรุป 3 ใบ (ตรงตามรูปที่ 3.79) */}
            <div className="my-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="rounded-lg bg-blue-100 p-2.5 text-blue-600">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">จำนวนงวดที่พบ</p>
                  <p className="text-lg font-bold text-slate-900">12 งวด</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="rounded-lg bg-emerald-100 p-2.5 text-emerald-600">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">ล่าสุด</p>
                  <p className="text-lg font-bold text-slate-900">กันยายน 2567</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="rounded-lg bg-purple-100 p-2.5 text-purple-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">สถานะที่แสดง</p>
                  <p className="text-base font-bold text-slate-900">APPROVED</p>
                  <p className="text-[10px] text-slate-400">(เฉพาะงวดที่อนุมัติแล้ว)</p>
                </div>
              </div>
            </div>

            {/* ตารางรายการประวัติใบแสดงรายการเงินเดือน (ตรงตามรูปที่ 3.79) */}
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">รายการประวัติใบแสดงรายการเงินเดือน</h3>
              <span className="text-xs text-slate-500">‹ 1 / 2 ›</span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold">งวดเงินเดือน</th>
                    <th className="px-4 py-3 font-semibold">เลขที่สลิป</th>
                    <th className="px-4 py-3 font-semibold">วันที่จ่าย</th>
                    <th className="px-4 py-3 text-right font-semibold">เงินได้สุทธิ (บาท)</th>
                    <th className="px-4 py-3 text-center font-semibold">สถานะ</th>
                    <th className="px-4 py-3 text-center font-semibold">การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filtered.map((item) => (
                    <tr key={item.slipNo} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">{item.periodName}</td>
                      <td className="px-4 py-3 text-slate-600">{item.slipNo}</td>
                      <td className="px-4 py-3 text-slate-600">{item.payDate}</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900">
                        {formatCurrency(item.netPay)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-4">
                          <Link
                            href="/payslips"
                            className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-blue-600"
                          >
                            <Eye className="h-3.5 w-3.5" /> ดูรายละเอียด
                          </Link>
                          <button
                            onClick={() => handleDownloadPdf(item.slipNo)}
                            className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:underline"
                          >
                            <Download className="h-3.5 w-3.5" /> ดาวน์โหลด PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* กล่องข้อมูลเพิ่มเติมด้านล่าง (ตรงตามรูปที่ 3.79) */}
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-slate-700">
              <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-800">ข้อมูลเพิ่มเติม (PDPA Compliance)</p>
                <ul className="mt-1 list-disc pl-4 space-y-0.5 text-slate-600">
                  <li>แสดงเฉพาะงวดใบแสดงรายการเงินเดือนที่ได้รับการอนุมัติแล้ว (APPROVED) เท่านั้น</li>
                  <li>คุณสามารถเปิดดูรายละเอียดแต่ละงวด และดาวน์โหลดใบแสดงรายการเงินเดือน (PDF) เพื่อเก็บไว้ใช้อ้างอิงได้</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
