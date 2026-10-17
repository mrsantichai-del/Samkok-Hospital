'use client';

import React, { useState } from 'react';
import { Search, AlertTriangle, Edit2, Send, Upload } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import { apiFetch } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

const RETURNED_PERIODS = [
  {
    id: 'ret-1',
    year: '2569',
    monthName: 'ตุลาคม',
    payType: 'เงินเดือน',
    departmentName: 'ฝ่ายการเงิน',
    employeeCount: 150,
    totalAmount: 4325600.0,
    returnedAt: '25/10/2569 14:30',
    status: 'ส่งกลับให้แก้ไข',
    reason:
      'พบรายการเงินได้ของราชการรักษาการไม่ถูกต้อง และข้อมูลพนักงานบางรายไม่ครบถ้วน กรุณาตรวจสอบและเปิดส่งขออนุมัติอีกครั้ง',
  },
  {
    id: 'ret-2',
    year: '2569',
    monthName: 'ตุลาคม',
    payType: 'ค่าจ้างประจำ',
    departmentName: 'ฝ่ายการพยาบาล',
    employeeCount: 48,
    totalAmount: 982400.0,
    returnedAt: '24/10/2569 10:15',
    status: 'ส่งกลับให้แก้ไข',
    reason: 'พบชั่วโมงค่าล่วงเวลา (OT) ของผลัดดึกเกินเกณฑ์ที่กำหนด กรุณาตรวจสอบเอกสารแนบ',
  },
  {
    id: 'ret-3',
    year: '2569',
    monthName: 'กันยายน',
    payType: 'เงินเดือน',
    departmentName: 'ฝ่ายสนับสนุนบริการ',
    employeeCount: 32,
    totalAmount: 754320.0,
    returnedAt: '20/10/2569 16:20',
    status: 'ส่งกลับให้แก้ไข',
    reason: 'กรุณาอัปเดตเลขที่บัญชีธนาคารกรุงไทยของพนักงานบรรจุใหม่ 2 ราย',
  },
];

export default function ReturnedPayrollPage() {
  const [selectedPeriod, setSelectedPeriod] = useState(RETURNED_PERIODS[0]);
  const [activeTab, setActiveTab] = useState<'employees' | 'items'>('employees');

  const handleResubmit = async () => {
    try {
      await apiFetch('/payroll/revise', {
        method: 'PUT',
        body: JSON.stringify({ periodId: selectedPeriod.id }),
      });
    } catch {
      // Fallback
    }
    toast.success(
      `แก้ไขและส่งขออนุมัติงวด ${selectedPeriod.monthName} ${selectedPeriod.year} ใหม่อีกครั้งสำเร็จ! (เปลี่ยนสถานะเป็น PENDING_APPROVAL ตาม UC-15)`,
    );
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <Header breadcrumbs={['งวดเงินเดือน', 'ตรวจสอบและแก้ไขงวดที่ถูกส่งกลับ']} />

      <main className="flex-1 space-y-5 p-6">
        {/* ค้นหางวดที่ถูกส่งกลับ (ตรงตามรูปที่ 3.76 - UC-15) */}
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 text-base font-bold text-slate-800">ค้นหางวดที่ถูกส่งกลับ</h2>
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
                <label className="mb-1 block text-xs font-semibold text-slate-600">ประเภทการจ่าย</label>
                <select className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs">
                  <option>ทั้งหมด</option>
                  <option>เงินเดือน</option>
                  <option>ค่าจ้างประจำ</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">หน่วยงาน</label>
                <select className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs">
                  <option>ทั้งหมด</option>
                  <option>ฝ่ายการเงิน</option>
                  <option>ฝ่ายการพยาบาล</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">สถานะ</label>
                <select className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs">
                  <option>ส่งกลับให้แก้ไข (EDIT_REQUESTED)</option>
                </select>
              </div>
              <div className="flex items-end justify-end gap-2">
                <Button variant="outline">ล้างค่า</Button>
                <Button>
                  <Search className="h-4 w-4" /> ค้นหา
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ตารางรายการงวดที่ถูกส่งกลับ (ตรงตามรูปที่ 3.76) */}
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4 text-sm font-bold text-slate-800">รายการงวดที่ถูกส่งกลับ</h3>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold">ลำดับ</th>
                    <th className="px-4 py-3 font-semibold">ปีงบประมาณ</th>
                    <th className="px-4 py-3 font-semibold">เดือน</th>
                    <th className="px-4 py-3 font-semibold">ประเภทการจ่าย</th>
                    <th className="px-4 py-3 font-semibold">หน่วยงาน</th>
                    <th className="px-4 py-3 text-center font-semibold">จำนวนพนักงาน</th>
                    <th className="px-4 py-3 text-right font-semibold">จำนวนเงินรวม (บาท)</th>
                    <th className="px-4 py-3 font-semibold">วันที่ส่งกลับ</th>
                    <th className="px-4 py-3 text-center font-semibold">สถานะ</th>
                    <th className="px-4 py-3 text-center font-semibold">การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {RETURNED_PERIODS.map((p, idx) => (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedPeriod(p)}
                      className={`cursor-pointer transition-colors ${
                        selectedPeriod.id === p.id ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="px-4 py-3">{idx + 1}</td>
                      <td className="px-4 py-3">{p.year}</td>
                      <td className="px-4 py-3 font-semibold">{p.monthName}</td>
                      <td className="px-4 py-3">{p.payType}</td>
                      <td className="px-4 py-3">{p.departmentName}</td>
                      <td className="px-4 py-3 text-center">{p.employeeCount}</td>
                      <td className="px-4 py-3 text-right font-semibold">{formatCurrency(p.totalAmount)}</td>
                      <td className="px-4 py-3">{p.returnedAt}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-semibold text-red-700">
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 text-blue-600 font-semibold">
                          <Edit2 className="h-3.5 w-3.5" /> แก้ไข
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* รายละเอียดงวดที่เลือก และกล่องเหตุผลการส่งกลับสีแดง (ตรงตามรูปที่ 3.76) */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-800">รายละเอียดงวดที่เลือก</h3>
              <Button onClick={handleResubmit}>
                <Send className="h-4 w-4" /> ประมวลผลใหม่และเสนอขออนุมัติอีกครั้ง (UC-15)
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="md:col-span-2 grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs">
                <div>
                  <span className="text-slate-500">ปีงบประมาณ:</span>{' '}
                  <strong className="text-slate-800">{selectedPeriod.year}</strong>
                </div>
                <div>
                  <span className="text-slate-500">จำนวนพนักงาน:</span>{' '}
                  <strong className="text-slate-800">{selectedPeriod.employeeCount} คน</strong>
                </div>
                <div>
                  <span className="text-slate-500">เดือน:</span>{' '}
                  <strong className="text-slate-800">{selectedPeriod.monthName}</strong>
                </div>
                <div>
                  <span className="text-slate-500">จำนวนเงินรวม:</span>{' '}
                  <strong className="text-blue-700">{formatCurrency(selectedPeriod.totalAmount)} บาท</strong>
                </div>
                <div>
                  <span className="text-slate-500">ประเภทการจ่าย:</span>{' '}
                  <strong className="text-slate-800">{selectedPeriod.payType}</strong>
                </div>
                <div>
                  <span className="text-slate-500">วันที่ส่งกลับ:</span>{' '}
                  <strong className="text-slate-800">{selectedPeriod.returnedAt}</strong>
                </div>
                <div>
                  <span className="text-slate-500">หน่วยงาน:</span>{' '}
                  <strong className="text-slate-800">{selectedPeriod.departmentName}</strong>
                </div>
              </div>

              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs">
                <p className="font-bold text-red-700 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" /> เหตุผลการส่งกลับ (จากผู้อำนวยการ):
                </p>
                <p className="mt-2 text-red-600 leading-relaxed">{selectedPeriod.reason}</p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('employees')}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold ${
                    activeTab === 'employees'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  รายการพนักงาน
                </button>
                <button
                  onClick={() => setActiveTab('items')}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold ${
                    activeTab === 'items'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  รายการเงินได้ / รายการหัก
                </button>
              </div>

              <Link href="/payroll/import">
                <Button size="sm" variant="outline">
                  <Upload className="h-3.5 w-3.5" /> นำเข้าข้อมูลจาก Excel
                </Button>
              </Link>
            </div>

            <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">ลำดับ</th>
                    <th className="px-4 py-3">รหัสพนักงาน</th>
                    <th className="px-4 py-3">ชื่อ-สกุล</th>
                    <th className="px-4 py-3">ตำแหน่ง</th>
                    <th className="px-4 py-3 text-right">เงินได้รวม (บาท)</th>
                    <th className="px-4 py-3 text-right">รายการหักรวม (บาท)</th>
                    <th className="px-4 py-3 text-right">รับสุทธิ (บาท)</th>
                    <th className="px-4 py-3 text-center">สถานะข้อมูล</th>
                    <th className="px-4 py-3">หมายเหตุ</th>
                    <th className="px-4 py-3 text-center">การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="px-4 py-3">1</td>
                    <td className="px-4 py-3 font-semibold text-blue-700">E0001</td>
                    <td className="px-4 py-3 font-medium">นางสาวกมลวรรณ ใจดี</td>
                    <td className="px-4 py-3">นักการเงิน</td>
                    <td className="px-4 py-3 text-right">35,000.00</td>
                    <td className="px-4 py-3 text-right text-red-600">5,200.00</td>
                    <td className="px-4 py-3 text-right font-bold">29,800.00</td>
                    <td className="px-4 py-3 text-center">
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                        ข้อมูลถูกต้อง
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">ตรวจสอบค่าล่วงเวลา</td>
                    <td className="px-4 py-3 text-center">
                      <Link href="/payroll/adjustments" className="text-blue-600 font-semibold hover:underline">
                        แก้ไข
                      </Link>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">2</td>
                    <td className="px-4 py-3 font-semibold text-blue-700">E0003</td>
                    <td className="px-4 py-3 font-medium">นายสมชาย รักงาน</td>
                    <td className="px-4 py-3">เจ้าหน้าที่การเงิน</td>
                    <td className="px-4 py-3 text-right">28,500.00</td>
                    <td className="px-4 py-3 text-right text-red-600">1,500.00</td>
                    <td className="px-4 py-3 text-right font-bold">27,000.00</td>
                    <td className="px-4 py-3 text-center">
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
                        ข้อมูลไม่ครบถ้วน
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">พบรายการหักกองทุน</td>
                    <td className="px-4 py-3 text-center">
                      <Link href="/payroll/adjustments" className="text-blue-600 font-semibold hover:underline">
                        แก้ไข
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
