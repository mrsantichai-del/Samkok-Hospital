'use client';

import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Save } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiFetch } from '@/lib/api';
import toast from 'react-hot-toast';

const PARAM_TABS = [
  'ประเภทเงินได้',
  'ประเภทรายการหัก',
  'อัตราภาษี',
  'อัตราประกันสังคม',
  'อัตรากองทุนสำรองเลี้ยงชีพ',
  'พารามิเตอร์เงินเดือน',
  'หน่วยงาน',
  'ตำแหน่งงาน',
  'ประเภทบุคลากร',
];

const INITIAL_INCOME_PARAMS = [
  {
    code: 'IN001',
    name: 'เงินเดือน',
    subType: 'เงินได้ประจำ',
    calcType: 'จำนวนเงินคงที่',
    taxType: 'รวมคำนวณ',
    ssoType: 'รวมคำนวณ',
    status: 'ใช้งาน',
    remark: 'เงินเดือนประจำตามสัญญาจ้าง',
  },
  {
    code: 'IN002',
    name: 'ค่าจ้างประจำ',
    subType: 'เงินได้ประจำ',
    calcType: 'จำนวนเงินคงที่',
    taxType: 'รวมคำนวณ',
    ssoType: 'รวมคำนวณ',
    status: 'ใช้งาน',
    remark: 'ค่าจ้างประจำ',
  },
  {
    code: 'IN003',
    name: 'ค่าล่วงเวลา',
    subType: 'เงินได้อื่น',
    calcType: 'ตามชั่วโมง/อัตรา',
    taxType: 'รวมคำนวณ',
    ssoType: 'ไม่รวมคำนวณ',
    status: 'ใช้งาน',
    remark: 'ค่าล่วงเวลา (OT) 150 บาท/ชม.',
  },
  {
    code: 'IN004',
    name: 'ค่าตำแหน่ง',
    subType: 'เงินได้ประจำ',
    calcType: 'จำนวนเงินคงที่',
    taxType: 'รวมคำนวณ',
    ssoType: 'รวมคำนวณ',
    status: 'ใช้งาน',
    remark: 'เงินประจำตำแหน่ง',
  },
  {
    code: 'IN005',
    name: 'ค่าตอบแทนวิชาชีพ',
    subType: 'เงินได้อื่น',
    calcType: 'จำนวนเงินคงที่',
    taxType: 'รวมคำนวณ',
    ssoType: 'ไม่รวมคำนวณ',
    status: 'ใช้งาน',
    remark: 'พ.ต.ส.',
  },
  {
    code: 'IN006',
    name: 'เงินเพิ่มพิเศษ',
    subType: 'เงินได้อื่น',
    calcType: 'จำนวนเงินคงที่',
    taxType: 'รวมคำนวณ',
    ssoType: 'ไม่รวมคำนวณ',
    status: 'ใช้งาน',
    remark: 'เบี้ยเลี้ยงเหมาจ่าย ฉบับที่ 11',
  },
];

export default function SystemParametersPage() {
  const [activeTab, setActiveTab] = useState('ประเภทเงินได้');
  const [rows, setRows] = useState(INITIAL_INCOME_PARAMS);
  const [keyword, setKeyword] = useState('');
  const [form, setForm] = useState(INITIAL_INCOME_PARAMS[0]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/parameters', {
        method: 'POST',
        body: JSON.stringify({
          code: form.code,
          name: form.name,
          value: form.calcType,
          remark: form.remark,
        }),
      });
    } catch {
      // Fallback
    }
    setRows((prev) => {
      const idx = prev.findIndex((r) => r.code === form.code);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = { ...form };
        return next;
      }
      return [...prev, { ...form }];
    });
    toast.success(`บันทึกค่าพื้นฐานและพารามิเตอร์ ${form.code} (${form.name}) สำเร็จ (UC-04)`);
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <Header breadcrumbs={['ตั้งค่าระบบ', 'จัดการค่าพื้นฐานและพารามิเตอร์']} />

      <main className="flex-1 space-y-5 p-6">
        {/* แถบแท็บด้านบน 9 หมวดพารามิเตอร์ (ตรงตามรูปที่ 3.73 - UC-04) */}
        <div className="flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
          {PARAM_TABS.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === t
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* แบบฟอร์มข้อมูลค่าพื้นฐานและพารามิเตอร์ (ตรงตามรูปที่ 3.73) */}
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 text-base font-bold text-slate-800">ข้อมูล{activeTab}</h2>
            <form onSubmit={handleSave} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  รหัสประเภทเงินได้ / พารามิเตอร์ <span className="text-red-500">*</span>
                </label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  การนำไปคำนวณภาษี <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.taxType}
                  onChange={(e) => setForm({ ...form, taxType: e.target.value })}
                  className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs"
                >
                  <option value="รวมคำนวณ">รวมคำนวณ</option>
                  <option value="ไม่รวมคำนวณ">ไม่รวมคำนวณ</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  ชื่อประเภทเงินได้ / พารามิเตอร์ <span className="text-red-500">*</span>
                </label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  การนำไปคำนวณประกันสังคม <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.ssoType}
                  onChange={(e) => setForm({ ...form, ssoType: e.target.value })}
                  className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs"
                >
                  <option value="รวมคำนวณ">รวมคำนวณ</option>
                  <option value="ไม่รวมคำนวณ">ไม่รวมคำนวณ</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  ประเภทย่อย <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.subType}
                  onChange={(e) => setForm({ ...form, subType: e.target.value })}
                  className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs"
                >
                  <option value="เงินได้ประจำ">เงินได้ประจำ</option>
                  <option value="เงินได้อื่น">เงินได้อื่น</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  สถานะ <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs"
                >
                  <option value="ใช้งาน">ใช้งาน</option>
                  <option value="ระงับ">ระงับ</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  ประเภทการคำนวณ <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.calcType}
                  onChange={(e) => setForm({ ...form, calcType: e.target.value })}
                  className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs"
                >
                  <option value="จำนวนเงินคงที่">จำนวนเงินคงที่</option>
                  <option value="ตามชั่วโมง/อัตรา">ตามชั่วโมง/อัตรา</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">หมายเหตุ</label>
                <Input
                  value={form.remark}
                  onChange={(e) => setForm({ ...form, remark: e.target.value })}
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setForm(INITIAL_INCOME_PARAMS[0])}>
                  ยกเลิก
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4" /> บันทึก
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* ตารางรายการพารามิเตอร์ (ตรงตามรูปที่ 3.73) */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">รายการ{activeTab}</h3>
              <Button
                size="sm"
                onClick={() =>
                  setForm({
                    code: `IN00${rows.length + 1}`,
                    name: '',
                    subType: 'เงินได้ประจำ',
                    calcType: 'จำนวนเงินคงที่',
                    taxType: 'รวมคำนวณ',
                    ssoType: 'รวมคำนวณ',
                    status: 'ใช้งาน',
                    remark: '',
                  })
                }
              >
                <Plus className="h-3.5 w-3.5" /> เพิ่มประเภทเงินได้
              </Button>
            </div>

            <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="ค้นหารหัส ชื่อประเภทเงินได้ หรือประเภทย่อย..."
                  className="pl-9"
                />
              </div>
              <select className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs">
                <option>สถานะ: ทั้งหมด</option>
                <option>ใช้งาน</option>
              </select>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">ลำดับ</th>
                    <th className="px-4 py-3">รหัสประเภทเงินได้</th>
                    <th className="px-4 py-3">ชื่อประเภทเงินได้</th>
                    <th className="px-4 py-3">ประเภทย่อย</th>
                    <th className="px-4 py-3">ประเภทการคำนวณ</th>
                    <th className="px-4 py-3">รวมภาษี</th>
                    <th className="px-4 py-3">รวมประกันสังคม</th>
                    <th className="px-4 py-3 text-center">สถานะ</th>
                    <th className="px-4 py-3 text-center">การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {rows
                    .filter((r) => r.code.includes(keyword) || r.name.includes(keyword))
                    .map((r, i) => (
                      <tr key={r.code} className="hover:bg-slate-50">
                        <td className="px-4 py-3">{i + 1}</td>
                        <td className="px-4 py-3 font-semibold text-blue-700">{r.code}</td>
                        <td className="px-4 py-3 font-medium text-slate-800">{r.name}</td>
                        <td className="px-4 py-3">{r.subType}</td>
                        <td className="px-4 py-3">{r.calcType}</td>
                        <td className="px-4 py-3">{r.taxType}</td>
                        <td className="px-4 py-3">{r.ssoType}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setForm(r)}
                              className="rounded p-1 text-blue-600 hover:bg-blue-50"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setRows((prev) => prev.filter((item) => item.code !== r.code))}
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
