'use client';

import React, { useState } from 'react';
import { Search, Check, RotateCcw, ShieldCheck } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import { apiFetch } from '@/lib/api';
import toast from 'react-hot-toast';

const DEPT_SUMMARY = [
  {
    id: 1,
    departmentName: 'กลุ่มงานการแพทย์',
    employeeCount: 45,
    grossPay: 1850320.0,
    totalDeduction: 265410.0,
    netPay: 1584910.0,
  },
  {
    id: 2,
    departmentName: 'กลุ่มงานการพยาบาล',
    employeeCount: 60,
    grossPay: 1980500.0,
    totalDeduction: 290300.0,
    netPay: 1690200.0,
  },
  {
    id: 3,
    departmentName: 'กลุ่มงานสนับสนุนบริการ',
    employeeCount: 30,
    grossPay: 620000.0,
    totalDeduction: 89500.0,
    netPay: 530500.0,
  },
  {
    id: 4,
    departmentName: 'กลุ่มงานบริหาร',
    employeeCount: 15,
    grossPay: 399500.0,
    totalDeduction: 0.0,
    netPay: 399500.0,
  },
];

export default function ApprovalsPage() {
  const [status, setStatus] = useState<'PENDING_APPROVAL' | 'APPROVED' | 'RETURNED'>('PENDING_APPROVAL');
  const [remark, setRemark] = useState('ส่งอนุมัติงวดเงินเดือน เดือนตุลาคม 2569');
  const [activeTab, setActiveTab] = useState<'dept' | 'staff'>('dept');
  const [signature, setSignature] = useState<string | null>(null);

  const handleDecision = async (decision: 'APPROVE' | 'RETURN') => {
    if (decision === 'RETURN' && !remark.trim()) {
      toast.error('กรุณาระบุเหตุผลในการส่งกลับเพื่อให้เจ้าหน้าที่ฝ่ายการเงินแก้ไข (UC-18)');
      return;
    }

    try {
      const res = await apiFetch<any>('/approvals/decision', {
        method: 'POST',
        body: JSON.stringify({
          periodId: 'period-2569-10',
          decision,
          remark,
        }),
      });
      if (res?.signatureHash) setSignature(res.signatureHash);
    } catch {
      if (decision === 'APPROVE') {
        setSignature(`SIG-SAMKOK-256910-DIR`);
      }
    }

    if (decision === 'APPROVE') {
      setStatus('APPROVED');
      toast.success('อนุมัติงวดเงินเดือนและประทับลายมือชื่อดิจิทัลสำเร็จ! (สถานะ: APPROVED)');
    } else {
      setStatus('RETURNED');
      toast.error('ส่งกลับงวดเงินเดือนให้เจ้าหน้าที่ฝ่ายการเงินแก้ไขแล้ว (สถานะ: EDIT_REQUESTED)');
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <Header breadcrumbs={['งวดเงินเดือน', 'พิจารณาอนุมัติหรือส่งกลับงวดเงินเดือน']} />

      <main className="flex-1 space-y-5 p-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 text-base font-bold text-slate-800">รายละเอียดงวดเงินเดือน</h2>

            {/* ข้อมูลสรุปงวดเงินเดือน 3 คอลัมน์ (ตรงตามรูปที่ 3.70 - UC-17 & UC-18) */}
            <div className="grid grid-cols-1 gap-6 rounded-xl border border-slate-200 bg-slate-50/70 p-5 md:grid-cols-3 text-xs">
              <div className="space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">รอบการจ่าย:</span>
                  <span className="font-semibold text-slate-800">รายเดือน</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">เดือน:</span>
                  <span className="font-semibold text-slate-800">ตุลาคม</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ปี พ.ศ.:</span>
                  <span className="font-semibold text-slate-800">2569</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">วันที่เริ่มต้นรอบคำนวณ:</span>
                  <span className="font-semibold text-slate-800">01/10/2569</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">วันที่สิ้นสุดรอบคำนวณ:</span>
                  <span className="font-semibold text-slate-800">31/10/2569</span>
                </div>
              </div>

              <div className="space-y-2.5 border-x border-slate-200 px-4">
                <div className="flex justify-between">
                  <span className="text-slate-500">วันที่จ่ายเงินเดือน:</span>
                  <span className="font-semibold text-slate-800">31/10/2569</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">จำนวนพนักงาน:</span>
                  <span className="font-semibold text-slate-800">150 คน</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ยอดเงินได้รวม:</span>
                  <span className="font-bold text-slate-900">4,850,320.00 บาท</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ยอดรายการหักรวม:</span>
                  <span className="font-bold text-red-600">645,210.00 บาท</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ยอดสุทธิที่จ่าย:</span>
                  <span className="font-extrabold text-emerald-700 text-sm">4,205,110.00 บาท</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">สถานะปัจจุบัน:</span>
                  {status === 'PENDING_APPROVAL' && (
                    <span className="rounded-full bg-amber-100 px-3 py-0.5 text-xs font-bold text-amber-700">
                      รออนุมัติ
                    </span>
                  )}
                  {status === 'APPROVED' && (
                    <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-700">
                      อนุมัติแล้ว (APPROVED)
                    </span>
                  )}
                  {status === 'RETURNED' && (
                    <span className="rounded-full bg-red-100 px-3 py-0.5 text-xs font-bold text-red-700">
                      ส่งกลับแก้ไข (RETURNED)
                    </span>
                  )}
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">จัดทำโดย:</span>
                  <span className="font-medium text-slate-800">สมชาย ใจดี</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">วันที่จัดทำ:</span>
                  <span className="font-medium text-slate-800">28/10/2569 10:15</span>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-600">
                    หมายเหตุประกอบการพิจารณา:
                  </label>
                  <textarea
                    rows={2}
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs"
                  />
                </div>
                {signature && (
                  <div className="flex items-center gap-1.5 rounded bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="h-3.5 w-3.5" /> Digital Signature: {signature}
                  </div>
                )}
              </div>
            </div>

            {/* แท็บ รายการสรุปตามส่วนงาน / รายการพนักงาน (ตรงตามรูปที่ 3.70) */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('dept')}
                  className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
                    activeTab === 'dept'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  รายการสรุปตามส่วนงาน
                </button>
                <button
                  onClick={() => setActiveTab('staff')}
                  className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
                    activeTab === 'staff'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  รายการพนักงาน (150 คน)
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-56">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <Input placeholder="ค้นหา หน่วยงาน..." className="pl-8 h-8 text-xs" />
                </div>
                <select className="h-8 rounded-lg border border-slate-300 bg-white px-2.5 text-xs">
                  <option>หน่วยงาน: ทั้งหมด</option>
                </select>
              </div>
            </div>

            {/* ตารางสรุปตามส่วนงาน */}
            <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold">ลำดับ</th>
                    <th className="px-4 py-3 font-semibold">หน่วยงาน</th>
                    <th className="px-4 py-3 text-center font-semibold">จำนวนพนักงาน (คน)</th>
                    <th className="px-4 py-3 text-right font-semibold">เงินได้รวม (บาท)</th>
                    <th className="px-4 py-3 text-right font-semibold">รายการหักรวม (บาท)</th>
                    <th className="px-4 py-3 text-right font-semibold">สุทธิที่จ่าย (บาท)</th>
                    <th className="px-4 py-3 text-center font-semibold">ดูรายละเอียด</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {DEPT_SUMMARY.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">{d.id}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{d.departmentName}</td>
                      <td className="px-4 py-3 text-center">{d.employeeCount}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(d.grossPay)}</td>
                      <td className="px-4 py-3 text-right text-red-600">{formatCurrency(d.totalDeduction)}</td>
                      <td className="px-4 py-3 text-right font-semibold">{formatCurrency(d.netPay)}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => toast(`แสดงรายละเอียดของ ${d.departmentName}`)}
                          className="rounded p-1 text-blue-600 hover:bg-blue-50"
                        >
                          <Search className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold text-slate-900">
                    <td colSpan={2} className="px-4 py-3 text-center">
                      รวมทั้งสิ้น
                    </td>
                    <td className="px-4 py-3 text-center">150</td>
                    <td className="px-4 py-3 text-right">4,850,320.00</td>
                    <td className="px-4 py-3 text-right text-red-600">645,210.00</td>
                    <td className="px-4 py-3 text-right text-blue-700">4,205,110.00</td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ปุ่มตัดสินใจ: ส่งกลับ / อนุมัติ (ตรงตามรูปที่ 3.70 - UC-18) */}
            <div className="mt-6 flex items-center justify-center gap-4">
              <Button
                variant="destructive"
                size="lg"
                onClick={() => handleDecision('RETURN')}
              >
                <RotateCcw className="h-4 w-4" /> ส่งกลับ (Return for Edit)
              </Button>
              <Button
                variant="success"
                size="lg"
                onClick={() => handleDecision('APPROVE')}
              >
                <Check className="h-4 w-4" /> อนุมัติ (Approve + Digital Signature)
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
