'use client';

import React, { useState } from 'react';
import {
  Search,
  Printer,
  Download,
  FileText,
  ArrowLeft,
  Plus,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { HospitalLogo } from '@/components/layout/HospitalLogo';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency, bahtText } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function PayslipsPage() {
  const [pdfPreviewMode, setPdfPreviewMode] = useState(false);

  const incomes = [
    { order: 1, name: 'เงินเดือน', amount: 25000.0 },
    { order: 2, name: 'ค่าตำแหน่ง', amount: 3000.0 },
    { order: 3, name: 'ค่าวิชาชีพเฉพาะ', amount: 4000.0 },
    { order: 4, name: 'ค่าตอบแทนพิเศษ', amount: 2000.0 },
  ];

  const deductions = [
    { order: 1, name: 'ภาษีเงินได้บุคคลธรรมดา', amount: 1250.0 },
    { order: 2, name: 'ประกันสังคม', amount: 750.0 },
    { order: 3, name: 'กองทุนสำรองเลี้ยงชีพ', amount: 1200.0 },
    { order: 4, name: 'หักอื่น ๆ', amount: 500.0 },
  ];

  const totalIncome = 34000.0;
  const totalDeduction = 3700.0;
  const netPay = 30300.0;

  const handleDownloadPdf = () => {
    const apiBase =
      process.env.NEXT_PUBLIC_API_URL ||
      (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
        ? 'https://samkok-hospital.onrender.com'
        : 'http://localhost:3001');
    window.open(`${apiBase}/me/payslip/period-2569-10/pdf?employeeCode=E0001`, '_blank');
    toast.success('กำลังสร้างและดาวน์โหลดไฟล์ PDF ขนาด A4 ด้วย PDFKit (payslip_E0001_2569_10.pdf)');
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <Header
        breadcrumbs={
          pdfPreviewMode
            ? ['งวดเงินเดือน', 'ใบแสดงรายการเงินเดือนรายบุคคล', 'ดูใบแสดงรายการเงินเดือน (PDF)']
            : ['งวดเงินเดือน', 'ใบแสดงรายการเงินเดือนรายบุคคล']
        }
      />

      <main className="flex-1 space-y-5 p-6">
        {!pdfPreviewMode ? (
          <>
            {/* ส่วนค้นหาข้อมูล (ตรงตามรูปที่ 3.78 - UC-16, UC-22, UC-24) */}
            <Card className="no-print">
              <CardContent className="p-6">
                <h2 className="mb-4 text-base font-bold text-slate-800">ค้นหาข้อมูล</h2>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">ปีงบประมาณ</label>
                    <select className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs">
                      <option>2569</option>
                      <option>2567</option>
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
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-xs font-semibold text-slate-600">พนักงาน</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        defaultValue="E0001 - นางสาวกมลวรรณ ใจดี"
                        placeholder="ค้นหารหัสพนักงาน หรือชื่อ-สกุล"
                        className="pl-9"
                      />
                    </div>
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

            {/* การ์ดใบแสดงรายการเงินเดือนรายบุคคล + แผงปุ่มด้านขวา (ตรงตามรูปที่ 3.78) */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
              <Card className="lg:col-span-3">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
                    <h3 className="text-base font-bold text-slate-800">ใบแสดงรายการเงินเดือนรายบุคคล</h3>
                    <span className="text-xs font-semibold text-slate-500">‹ 1 / 8 ›</span>
                  </div>

                  {/* ข้อมูลหัวสลิป */}
                  <div className="grid grid-cols-1 gap-4 rounded-xl bg-slate-50 p-4 md:grid-cols-2 border border-slate-200">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white shadow-sm">
                        ก
                      </div>
                      <div className="text-xs space-y-0.5">
                        <p className="font-bold text-blue-700 text-sm">E0001</p>
                        <p className="font-bold text-slate-900 text-sm">นางสาวกมลวรรณ ใจดี</p>
                        <p className="text-slate-600">นักการเงิน</p>
                        <p className="text-slate-500">ฝ่ายการเงิน</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs items-center">
                      <span className="text-slate-500">ปีงบประมาณ:</span>
                      <span className="font-semibold text-slate-800">2569</span>
                      <span className="text-slate-500">เดือน:</span>
                      <span className="font-semibold text-slate-800">ตุลาคม</span>
                      <span className="text-slate-500">ประเภทพนักงาน:</span>
                      <span className="font-semibold text-slate-800">ข้าราชการ</span>
                      <span className="text-slate-500">วันที่จ่ายเงิน:</span>
                      <span className="font-semibold text-slate-800">31/10/2569</span>
                    </div>
                  </div>

                  {/* ตารางรายการเงินได้ - รายการหัก */}
                  <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                      <div className="bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-800 border-b border-emerald-200">
                        รายการเงินได้
                      </div>
                      <table className="w-full text-xs">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                          <tr>
                            <th className="px-3 py-2 text-left">ลำดับ</th>
                            <th className="px-3 py-2 text-left">รายการ</th>
                            <th className="px-3 py-2 text-right">จำนวนเงิน (บาท)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {incomes.map((inc) => (
                            <tr key={inc.order}>
                              <td className="px-3 py-2.5">{inc.order}</td>
                              <td className="px-3 py-2.5 font-medium">{inc.name}</td>
                              <td className="px-3 py-2.5 text-right">{formatCurrency(inc.amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="flex justify-between bg-emerald-50/70 px-4 py-2.5 text-xs font-bold text-slate-900 border-t border-slate-200">
                        <span>รวมเงินได้</span>
                        <span>{formatCurrency(totalIncome)}</span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                      <div className="bg-red-50 px-4 py-2.5 text-xs font-bold text-red-800 border-b border-red-200">
                        รายการหัก
                      </div>
                      <table className="w-full text-xs">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                          <tr>
                            <th className="px-3 py-2 text-left">ลำดับ</th>
                            <th className="px-3 py-2 text-left">รายการ</th>
                            <th className="px-3 py-2 text-right">จำนวนเงิน (บาท)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {deductions.map((ded) => (
                            <tr key={ded.order}>
                              <td className="px-3 py-2.5">{ded.order}</td>
                              <td className="px-3 py-2.5 font-medium">{ded.name}</td>
                              <td className="px-3 py-2.5 text-right">{formatCurrency(ded.amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="flex justify-between bg-red-50/70 px-4 py-2.5 text-xs font-bold text-red-700 border-t border-slate-200">
                        <span>รวมรายการหัก</span>
                        <span>{formatCurrency(totalDeduction)}</span>
                      </div>
                    </div>
                  </div>

                  {/* แถบรับสุทธิ */}
                  <div className="mt-4 flex items-center justify-between rounded-xl bg-blue-50 px-6 py-4 border border-blue-200">
                    <div>
                      <span className="text-base font-bold text-slate-800">รับสุทธิ</span>
                      <p className="text-xs text-slate-500 mt-0.5">({bahtText(netPay)})</p>
                    </div>
                    <span className="text-2xl font-extrabold text-blue-700">
                      {formatCurrency(netPay)} บาท
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* คอลัมน์ขวา: ปุ่มสั่งพิมพ์ / ดาวน์โหลด PDF และข้อมูลเพิ่มเติม (ตรงตามรูปที่ 3.78) */}
              <div className="space-y-4 no-print">
                <Button className="w-full" size="lg" onClick={() => setPdfPreviewMode(true)}>
                  <Printer className="h-4 w-4" /> พิมพ์ใบแสดงรายการเงินเดือน (PDF Preview)
                </Button>
                <Button variant="outline" className="w-full" size="lg" onClick={handleDownloadPdf}>
                  <FileText className="h-4 w-4 text-red-600" /> ดาวน์โหลด PDF (PDFKit Engine)
                </Button>

                <Card>
                  <CardContent className="p-5 text-xs space-y-2.5">
                    <h4 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-2">
                      ข้อมูลเพิ่มเติม
                    </h4>
                    <div className="flex justify-between">
                      <span className="text-slate-500">รหัสพนักงาน</span>
                      <span className="font-semibold text-slate-800">E0001</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">ชื่อ-สกุล</span>
                      <span className="font-semibold text-slate-800">นางสาวกมลวรรณ ใจดี</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">ตำแหน่ง</span>
                      <span className="font-semibold text-slate-800">นักการเงิน</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">หน่วยงาน</span>
                      <span className="font-semibold text-slate-800">ฝ่ายการเงิน</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">ประเภทพนักงาน</span>
                      <span className="font-semibold text-slate-800">ข้าราชการ</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">ระดับ</span>
                      <span className="font-semibold text-slate-800">ชำนาญการ</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">เลขที่บัญชีธนาคาร</span>
                      <span className="font-semibold text-slate-800">123-4-56789-0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">ธนาคาร</span>
                      <span className="font-semibold text-slate-800">กรุงไทย</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        ) : (
          /* หน้าจอตัวอย่างเอกสาร PDF ที่สร้างด้วย PDFKit ขนาด A4 (ตรงตามรูปที่ 3.90 ทุกประการ) */
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-4 shadow-sm border border-slate-200 no-print">
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => setPdfPreviewMode(false)}>
                  <ArrowLeft className="h-4 w-4" /> กลับ
                </Button>
                <h2 className="text-sm font-bold text-slate-800">ใบแสดงรายการเงินเดือน (PDF)</h2>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleDownloadPdf}>
                  <Download className="h-3.5 w-3.5" /> ดาวน์โหลด PDF
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  <Printer className="h-3.5 w-3.5" /> พิมพ์
                </Button>
              </div>
            </div>

            {/* กรอบจำลองโปรแกรมอ่าน PDF (payslip_E0001_2569_10.pdf ตามรูปที่ 3.90) */}
            <div className="overflow-hidden rounded-xl border border-slate-700 bg-[#323639] shadow-2xl">
              <div className="flex items-center justify-between bg-[#202124] px-4 py-2.5 text-xs text-slate-200 no-print">
                <span className="font-medium">payslip_E0001_2569_10.pdf</span>
                <div className="flex items-center gap-3">
                  <span>1 / 1</span>
                  <span className="text-slate-500">|</span>
                  <ZoomOut className="h-3.5 w-3.5 cursor-pointer" />
                  <span>100%</span>
                  <ZoomIn className="h-3.5 w-3.5 cursor-pointer" />
                </div>
                <div className="flex items-center gap-3">
                  <Download className="h-4 w-4 cursor-pointer" onClick={handleDownloadPdf} />
                  <Printer className="h-4 w-4 cursor-pointer" onClick={() => window.print()} />
                </div>
              </div>

              {/* กระดาษ A4 สีขาว (TH Sarabun) */}
              <div className="mx-auto my-6 max-w-3xl rounded bg-white p-10 text-slate-900 shadow-lg">
                {/* หัวกระดาษตราโรงพยาบาลสามโคก (ดึงจาก Supabase Storage Bucket) */}
                <div className="flex items-start justify-between border-b-2 border-slate-300 pb-4">
                  <div className="flex items-center gap-3">
                    <HospitalLogo className="h-14 w-14" />
                    <div>
                      <h3 className="text-base font-bold text-slate-900">โรงพยาบาลสามโคก</h3>
                      <p className="text-xs text-slate-600">อำเภอสามโคก จังหวัดปทุมธานี</p>
                      <p className="text-xs text-slate-500">โปรแกรมบริหารจัดการเงินเดือนและค่าตอบแทน</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <h3 className="text-base font-bold text-slate-900">ใบแสดงรายการเงินเดือนรายบุคคล</h3>
                    <p className="text-xs font-semibold text-slate-700 mt-1">ประจำเดือน ตุลาคม 2569</p>
                  </div>
                </div>

                {/* ข้อมูลพนักงานในกระดาษ A4 */}
                <div className="my-5 grid grid-cols-2 gap-6 text-xs">
                  <div className="space-y-1.5">
                    <div className="grid grid-cols-3">
                      <span className="text-slate-500">รหัสพนักงาน</span>
                      <span className="col-span-2 font-bold text-blue-700">E0001</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-slate-500">ชื่อ - สกุล</span>
                      <span className="col-span-2 font-semibold">นางสาวกมลวรรณ ใจดี</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-slate-500">ตำแหน่ง</span>
                      <span className="col-span-2 font-semibold">นักการเงิน</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-slate-500">หน่วยงาน</span>
                      <span className="col-span-2 font-semibold">ฝ่ายการเงิน</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-slate-500">ประเภทพนักงาน</span>
                      <span className="col-span-2 font-semibold">ข้าราชการ</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="grid grid-cols-3">
                      <span className="text-slate-500">งวดเงินเดือน</span>
                      <span className="col-span-2 font-semibold">ตุลาคม 2569</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-slate-500">วันที่จ่ายเงิน</span>
                      <span className="col-span-2 font-semibold">31/10/2569</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-slate-500">เลขที่บัญชีธนาคาร</span>
                      <span className="col-span-2 font-semibold">123-4-56789-0</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-slate-500">ธนาคาร</span>
                      <span className="col-span-2 font-semibold">กรุงไทย</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-slate-500">ประเภทการจ่าย</span>
                      <span className="col-span-2 font-semibold">โอนเข้าบัญชีธนาคาร</span>
                    </div>
                  </div>
                </div>

                {/* ตารางคู่ในกระดาษ A4 */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="border border-slate-300 rounded">
                    <div className="bg-emerald-50 px-3 py-2 font-bold text-slate-800 border-b border-slate-300">
                      รายการเงินได้
                    </div>
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-2.5 py-1.5 text-left">ลำดับ</th>
                          <th className="px-2.5 py-1.5 text-left">รายการ</th>
                          <th className="px-2.5 py-1.5 text-right">จำนวนเงิน (บาท)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {incomes.map((inc) => (
                          <tr key={inc.order}>
                            <td className="px-2.5 py-2">{inc.order}</td>
                            <td className="px-2.5 py-2">{inc.name}</td>
                            <td className="px-2.5 py-2 text-right">{formatCurrency(inc.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="flex justify-between bg-emerald-50/70 px-3 py-2 font-bold border-t border-slate-300">
                      <span>รวมเงินได้</span>
                      <span>34,000.00</span>
                    </div>
                  </div>

                  <div className="border border-slate-300 rounded">
                    <div className="bg-red-50 px-3 py-2 font-bold text-slate-800 border-b border-slate-300">
                      รายการหัก
                    </div>
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-2.5 py-1.5 text-left">ลำดับ</th>
                          <th className="px-2.5 py-1.5 text-left">รายการ</th>
                          <th className="px-2.5 py-1.5 text-right">จำนวนเงิน (บาท)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {deductions.map((ded) => (
                          <tr key={ded.order}>
                            <td className="px-2.5 py-2">{ded.order}</td>
                            <td className="px-2.5 py-2">{ded.name}</td>
                            <td className="px-2.5 py-2 text-right">{formatCurrency(ded.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="flex justify-between bg-red-50/70 px-3 py-2 font-bold text-red-700 border-t border-slate-300">
                      <span>รวมรายการหัก</span>
                      <span>3,700.00</span>
                    </div>
                  </div>
                </div>

                {/* กล่องรับสุทธิพร้อม Bahttext */}
                <div className="mt-4 flex items-center justify-between rounded-lg bg-blue-50 px-5 py-3.5 border border-blue-200">
                  <div>
                    <p className="text-sm font-bold text-slate-900">รับสุทธิ</p>
                    <p className="text-xs text-slate-600">({bahtText(netPay)})</p>
                  </div>
                  <p className="text-xl font-extrabold text-blue-700">30,300.00 บาท</p>
                </div>

                {/* หมายเหตุท้ายกระดาษ A4 (ตรงตามรูปที่ 3.90) */}
                <div className="mt-6 flex items-end justify-between border-t border-slate-200 pt-3 text-[10px] text-slate-500">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-600">หมายเหตุ</p>
                    <p>1. ใบแสดงรายการนี้จัดทำโดยระบบคอมพิวเตอร์ ไม่ต้องมีลายมือชื่อ</p>
                    <p>2. หากมีข้อสงสัย กรุณาติดต่อฝ่ายการเงิน โรงพยาบาลสามโคก โทร. 02-123-4567</p>
                    <p>3. เอกสารนี้ใช้สำหรับแสดงรายการเงินเดือนประจำงวดเท่านั้น</p>
                  </div>
                  <div className="text-right">
                    <p>วันที่พิมพ์เอกสาร: 31/10/2569 เวลา 09:15 น.</p>
                    <p className="text-emerald-700 font-semibold">Digital Signature: SIG-SAMKOK-256910-DIR</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
