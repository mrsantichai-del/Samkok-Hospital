'use client';

import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Save } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiFetch } from '@/lib/api';
import toast from 'react-hot-toast';

interface PeriodItem {
  id: string;
  cycleType: string;
  monthName: string;
  year: string;
  startDate: string;
  endDate: string;
  payDate: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'EDIT_REQUESTED';
  remark: string;
}

const INITIAL_PERIODS: PeriodItem[] = [
  {
    id: 'p-1',
    cycleType: 'รายเดือน',
    monthName: 'ตุลาคม',
    year: '2569',
    startDate: '01/10/2569',
    endDate: '31/10/2569',
    payDate: '31/10/2569',
    status: 'DRAFT',
    remark: 'ร่างงวดเงินเดือนประจำเดือนตุลาคม 2569',
  },
  {
    id: 'p-2',
    cycleType: 'รายเดือน',
    monthName: 'กันยายน',
    year: '2569',
    startDate: '01/09/2569',
    endDate: '30/09/2569',
    payDate: '30/09/2569',
    status: 'PENDING_APPROVAL',
    remark: 'รออนุมัติจากผู้อำนวยการโรงพยาบาล',
  },
  {
    id: 'p-3',
    cycleType: 'รายเดือน',
    monthName: 'สิงหาคม',
    year: '2569',
    startDate: '01/08/2569',
    endDate: '31/08/2569',
    payDate: '31/08/2569',
    status: 'APPROVED',
    remark: 'อนุมัติและจ่ายเงินเดือนแล้ว',
  },
  {
    id: 'p-4',
    cycleType: 'รายเดือน',
    monthName: 'กรกฎาคม',
    year: '2569',
    startDate: '01/07/2569',
    endDate: '31/07/2569',
    payDate: '31/07/2569',
    status: 'EDIT_REQUESTED',
    remark: 'ส่งกลับให้แก้ไขรายการเงินได้รักษาการ',
  },
];

export default function PayrollPeriodsPage() {
  const [periods, setPeriods] = useState<PeriodItem[]>(INITIAL_PERIODS);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('ทั้งหมด');
  const [form, setForm] = useState<PeriodItem>(INITIAL_PERIODS[0]);

  const statusBadge = (status: PeriodItem['status']) => {
    switch (status) {
      case 'DRAFT':
        return <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">ร่าง</span>;
      case 'PENDING_APPROVAL':
        return <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-semibold text-sky-700">รออนุมัติ</span>;
      case 'APPROVED':
        return <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">อนุมัติแล้ว</span>;
      case 'EDIT_REQUESTED':
        return <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-semibold text-red-700">ปิดงวด/ส่งกลับ</span>;
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const isDuplicate = periods.some(
      (p) => p.monthName === form.monthName && p.year === form.year && p.id !== form.id,
    );
    if (isDuplicate) {
      toast.error(`พบงวดเงินเดือนซ้ำ (${form.monthName} ${form.year}) ระบบไม่อนุญาตให้สร้างงวดซ้ำตาม UC-08`);
      return;
    }

    try {
      await apiFetch('/payroll/periods', {
        method: 'POST',
        body: JSON.stringify(form),
      });
    } catch {
      // Fallback local
    }

    setPeriods((prev) => {
      const idx = prev.findIndex((p) => p.id === form.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = { ...form };
        return next;
      }
      return [{ ...form, id: `p-${Date.now()}` }, ...prev];
    });
    toast.success(`บันทึกงวดเงินเดือน ${form.monthName} ${form.year} เรียบร้อยแล้ว`);
  };

  const filtered = periods.filter((p) => {
    if (statusFilter !== 'ทั้งหมด' && p.status !== statusFilter) return false;
    if (keyword) {
      return p.monthName.includes(keyword) || p.year.includes(keyword) || p.payDate.includes(keyword);
    }
    return true;
  });

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <Header breadcrumbs={['งวดเงินเดือน', 'จัดการงวดเงินเดือน']} />

      <main className="flex-1 space-y-5 p-6">
        {/* แบบฟอร์มจัดการงวดเงินเดือน (ตรงตามรูปที่ 3.69 - UC-08) */}
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 text-base font-bold text-slate-800">ข้อมูลงวดเงินเดือน</h2>
            <form onSubmit={handleSave} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  รอบการจ่าย <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.cycleType}
                  onChange={(e) => setForm({ ...form, cycleType: e.target.value })}
                  className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                >
                  <option value="รายเดือน">รายเดือน</option>
                  <option value="ครึ่งเดือน">ครึ่งเดือน</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  วันที่สิ้นสุดรอบคำนวณ <span className="text-red-500">*</span>
                </label>
                <Input
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  เดือน <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.monthName}
                  onChange={(e) => setForm({ ...form, monthName: e.target.value })}
                  className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                >
                  {[
                    'มกราคม',
                    'กุมภาพันธ์',
                    'มีนาคม',
                    'เมษายน',
                    'พฤษภาคม',
                    'มิถุนายน',
                    'กรกฎาคม',
                    'สิงหาคม',
                    'กันยายน',
                    'ตุลาคม',
                    'พฤศจิกายน',
                    'ธันวาคม',
                  ].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  วันที่จ่ายเงินเดือน <span className="text-red-500">*</span>
                </label>
                <Input
                  value={form.payDate}
                  onChange={(e) => setForm({ ...form, payDate: e.target.value })}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  ปี พ.ศ. <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                  className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                >
                  <option value="2569">2569</option>
                  <option value="2568">2568</option>
                  <option value="2567">2567</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  สถานะ <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                  className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                >
                  <option value="DRAFT">ร่าง (DRAFT)</option>
                  <option value="PENDING_APPROVAL">รออนุมัติ (PENDING_APPROVAL)</option>
                  <option value="APPROVED">อนุมัติแล้ว (APPROVED)</option>
                  <option value="EDIT_REQUESTED">ส่งกลับแก้ไข (EDIT_REQUESTED)</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  วันที่เริ่มต้นรอบคำนวณ <span className="text-red-500">*</span>
                </label>
                <Input
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">หมายเหตุ</label>
                <Input
                  value={form.remark}
                  onChange={(e) => setForm({ ...form, remark: e.target.value })}
                  placeholder="ระบุหมายเหตุของงวดเงินเดือน..."
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setForm(INITIAL_PERIODS[0])}>
                  ยกเลิก
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4" /> บันทึก
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* ตารางรายการงวดเงินเดือน (ตรงตามรูปที่ 3.69) */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-slate-800">รายการงวดเงินเดือน</h3>
              <Button
                type="button"
                onClick={() =>
                  setForm({
                    id: `p-${Date.now()}`,
                    cycleType: 'รายเดือน',
                    monthName: 'พฤศจิกายน',
                    year: '2569',
                    startDate: '01/11/2569',
                    endDate: '30/11/2569',
                    payDate: '30/11/2569',
                    status: 'DRAFT',
                    remark: '',
                  })
                }
              >
                <Plus className="h-4 w-4" /> เพิ่มงวดเงินเดือน
              </Button>
            </div>

            <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="ค้นหา เดือน, ปี, วันที่จ่าย..."
                  className="pl-9"
                />
              </div>
              <select className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs">
                <option>รอบการจ่าย: ทั้งหมด</option>
                <option>รายเดือน</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs"
              >
                <option value="ทั้งหมด">สถานะ: ทั้งหมด</option>
                <option value="DRAFT">ร่าง</option>
                <option value="PENDING_APPROVAL">รออนุมัติ</option>
                <option value="APPROVED">อนุมัติแล้ว</option>
                <option value="EDIT_REQUESTED">ส่งกลับแก้ไข</option>
              </select>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold">ลำดับ</th>
                    <th className="px-4 py-3 font-semibold">รอบการจ่าย</th>
                    <th className="px-4 py-3 font-semibold">เดือน</th>
                    <th className="px-4 py-3 font-semibold">ปี พ.ศ.</th>
                    <th className="px-4 py-3 font-semibold">วันที่เริ่มต้นรอบคำนวณ</th>
                    <th className="px-4 py-3 font-semibold">วันที่สิ้นสุดรอบคำนวณ</th>
                    <th className="px-4 py-3 font-semibold">วันที่จ่ายเงินเดือน</th>
                    <th className="px-4 py-3 text-center font-semibold">สถานะ</th>
                    <th className="px-4 py-3 text-center font-semibold">การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filtered.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">{idx + 1}</td>
                      <td className="px-4 py-3">{item.cycleType}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{item.monthName}</td>
                      <td className="px-4 py-3">{item.year}</td>
                      <td className="px-4 py-3">{item.startDate}</td>
                      <td className="px-4 py-3">{item.endDate}</td>
                      <td className="px-4 py-3">{item.payDate}</td>
                      <td className="px-4 py-3 text-center">{statusBadge(item.status)}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setForm(item)}
                            className="rounded p-1 text-blue-600 hover:bg-blue-50"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setPeriods((prev) => prev.filter((p) => p.id !== item.id))}
                            className="rounded p-1 text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
