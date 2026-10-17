'use client';

import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Save } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiFetch } from '@/lib/api';
import toast from 'react-hot-toast';

interface PayItemRow {
  id: string;
  code: string;
  name: string;
  type: 'INCOME' | 'DEDUCTION';
  subCategory: string;
  calcMethod: string;
  includeTax: boolean;
  includeSocialSecurity: boolean;
  status: string;
  remark: string;
}

const INITIAL_ITEMS: PayItemRow[] = [
  {
    id: '1',
    code: 'IN001',
    name: 'เงินเดือน',
    type: 'INCOME',
    subCategory: 'เงินได้ประจำ',
    calcMethod: 'จำนวนเงินคงที่',
    includeTax: true,
    includeSocialSecurity: true,
    status: 'ใช้งาน',
    remark: 'เงินเดือนประจำตามสัญญาจ้าง',
  },
  {
    id: '2',
    code: 'IN002',
    name: 'ค่าจ้างประจำ',
    type: 'INCOME',
    subCategory: 'เงินได้ประจำ',
    calcMethod: 'จำนวนเงินคงที่',
    includeTax: true,
    includeSocialSecurity: true,
    status: 'ใช้งาน',
    remark: 'ค่าจ้างลูกจ้างประจำ',
  },
  {
    id: '3',
    code: 'IN003',
    name: 'ค่าล่วงเวลา',
    type: 'INCOME',
    subCategory: 'เงินได้อื่น',
    calcMethod: 'ตามชั่วโมง/อัตรา',
    includeTax: true,
    includeSocialSecurity: false,
    status: 'ใช้งาน',
    remark: 'ค่าตอบแทน OT นอกเวลาราชการ',
  },
  {
    id: '4',
    code: 'IN004',
    name: 'ค่าตำแหน่ง',
    type: 'INCOME',
    subCategory: 'เงินได้ประจำ',
    calcMethod: 'จำนวนเงินคงที่',
    includeTax: true,
    includeSocialSecurity: true,
    status: 'ใช้งาน',
    remark: 'เงินประจำตำแหน่ง',
  },
  {
    id: '5',
    code: 'IN005',
    name: 'ค่าตอบแทนวิชาชีพ (พ.ต.ส.)',
    type: 'INCOME',
    subCategory: 'เงินได้อื่น',
    calcMethod: 'จำนวนเงินคงที่',
    includeTax: true,
    includeSocialSecurity: false,
    status: 'ใช้งาน',
    remark: 'พ.ต.ส.',
  },
  {
    id: '6',
    code: 'IN006',
    name: 'เงินเพิ่มพิเศษ (ฉบับที่ 11)',
    type: 'INCOME',
    subCategory: 'เงินได้อื่น',
    calcMethod: 'จำนวนเงินคงที่',
    includeTax: true,
    includeSocialSecurity: false,
    status: 'ใช้งาน',
    remark: 'เบี้ยเลี้ยงเหมาจ่าย ฉบับที่ 11',
  },
  {
    id: '7',
    code: 'IN007',
    name: 'เงินรางวัล',
    type: 'INCOME',
    subCategory: 'เงินได้อื่น',
    calcMethod: 'จำนวนเงินคงที่',
    includeTax: true,
    includeSocialSecurity: false,
    status: 'ใช้งาน',
    remark: 'โบนัส/เงินรางวัลประจำปี',
  },
  {
    id: '8',
    code: 'IN008',
    name: 'เงินช่วยเหลือ',
    type: 'INCOME',
    subCategory: 'เงินได้อื่น',
    calcMethod: 'จำนวนเงินคงที่',
    includeTax: false,
    includeSocialSecurity: false,
    status: 'ใช้งาน',
    remark: 'สวัสดิการช่วยเหลือบุคลากร',
  },
  {
    id: '9',
    code: 'IN009',
    name: 'ค่าที่พัก',
    type: 'INCOME',
    subCategory: 'เงินได้อื่น',
    calcMethod: 'จำนวนเงินคงที่',
    includeTax: false,
    includeSocialSecurity: false,
    status: 'ใช้งาน',
    remark: 'ค่าเช่าบ้าน/ที่พัก',
  },
  {
    id: '10',
    code: 'IN010',
    name: 'ค่าเดินทาง',
    type: 'INCOME',
    subCategory: 'เงินได้อื่น',
    calcMethod: 'จำนวนเงินคงที่',
    includeTax: false,
    includeSocialSecurity: false,
    status: 'ใช้งาน',
    remark: 'ค่าพาหนะเดินทางไปราชการ',
  },
];

export default function MasterPayItemsPage() {
  const [tab, setTab] = useState<'INCOME' | 'DEDUCTION'>('INCOME');
  const [items, setItems] = useState<PayItemRow[]>(INITIAL_ITEMS);
  const [keyword, setKeyword] = useState('');
  const [form, setForm] = useState<PayItemRow>(INITIAL_ITEMS[0]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/pay-items', {
        method: 'POST',
        body: JSON.stringify(form),
      });
    } catch {
      // Fallback
    }
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.code === form.code);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = { ...form };
        return next;
      }
      return [...prev, { ...form, id: String(Date.now()) }];
    });
    toast.success(`บันทึกรายการ ${form.code} (${form.name}) สำเร็จ (UC-07)`);
  };

  const filtered = items.filter(
    (i) =>
      i.code.toLowerCase().includes(keyword.toLowerCase()) ||
      i.name.toLowerCase().includes(keyword.toLowerCase()),
  );

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <Header breadcrumbs={['ข้อมูลพื้นฐาน', 'ประเภทเงินได้และรายการหัก']} />

      <main className="flex-1 p-6">
        {/* แบ่ง 2 คอลัมน์: ซ้ายตารางรายการ ขวาแบบฟอร์มรายละเอียด (ตรงตามรูปที่ 3.75 - UC-07) */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <div className="mb-4 flex gap-2 border-b border-slate-200 pb-3">
                <button
                  onClick={() => setTab('INCOME')}
                  className={`rounded-lg px-4 py-2 text-xs font-semibold ${
                    tab === 'INCOME' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  ประเภทเงินได้ (INCOME)
                </button>
                <button
                  onClick={() => setTab('DEDUCTION')}
                  className={`rounded-lg px-4 py-2 text-xs font-semibold ${
                    tab === 'DEDUCTION' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  รายการหัก (DEDUCTION)
                </button>
              </div>

              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="ค้นหารหัส ชื่อรายการ หรือประเภท..."
                    className="pl-9"
                  />
                </div>
                <Button
                  size="sm"
                  onClick={() =>
                    setForm({
                      id: String(Date.now()),
                      code: `IN0${items.length + 1}`,
                      name: '',
                      type: tab,
                      subCategory: 'เงินได้ประจำ',
                      calcMethod: 'จำนวนเงินคงที่',
                      includeTax: true,
                      includeSocialSecurity: false,
                      status: 'ใช้งาน',
                      remark: '',
                    })
                  }
                >
                  <Plus className="h-3.5 w-3.5" /> เพิ่มประเภทเงินได้
                </Button>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2.5">ลำดับ</th>
                      <th className="px-3 py-2.5">รหัสรายการ</th>
                      <th className="px-3 py-2.5">ชื่อรายการ</th>
                      <th className="px-3 py-2.5">ประเภท</th>
                      <th className="px-3 py-2.5">การคำนวณ</th>
                      <th className="px-3 py-2.5 text-center">มีผลต่อภาษี</th>
                      <th className="px-3 py-2.5 text-center">ประกันสังคม</th>
                      <th className="px-3 py-2.5 text-center">สถานะ</th>
                      <th className="px-3 py-2.5 text-center">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filtered.map((item, idx) => (
                      <tr
                        key={item.code}
                        onClick={() => setForm(item)}
                        className="cursor-pointer hover:bg-slate-50"
                      >
                        <td className="px-3 py-2.5">{idx + 1}</td>
                        <td className="px-3 py-2.5 font-bold text-blue-700">{item.code}</td>
                        <td className="px-3 py-2.5 font-medium text-slate-800">{item.name}</td>
                        <td className="px-3 py-2.5">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              item.subCategory === 'เงินได้ประจำ'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {item.subCategory}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-slate-600">{item.calcMethod}</td>
                        <td className="px-3 py-2.5 text-center">
                          <input type="checkbox" checked={item.includeTax} readOnly className="accent-blue-600" />
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <input
                            type="checkbox"
                            checked={item.includeSocialSecurity}
                            readOnly
                            className="accent-blue-600"
                          />
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                            {item.status}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <Edit2 className="h-3.5 w-3.5 text-blue-600" />
                            <Trash2 className="h-3.5 w-3.5 text-red-500" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* ฟอร์มรายละเอียดประเภทเงินได้ด้านขวา (ตรงตามรูปที่ 3.75) */}
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-4 text-sm font-bold text-slate-800 border-b border-slate-200 pb-2.5">
                รายละเอียดประเภทเงินได้
              </h3>
              <form onSubmit={handleSave} className="space-y-3.5 text-xs">
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">
                    รหัสรายการ <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">
                    ชื่อรายการ <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">ประเภทเงินได้</label>
                  <select
                    value={form.subCategory}
                    onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
                    className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs"
                  >
                    <option value="เงินได้ประจำ">เงินได้ประจำ</option>
                    <option value="เงินได้อื่น">เงินได้อื่น</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">วิธีการคำนวณ</label>
                  <select
                    value={form.calcMethod}
                    onChange={(e) => setForm({ ...form, calcMethod: e.target.value })}
                    className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs"
                  >
                    <option value="จำนวนเงินคงที่">จำนวนเงินคงที่</option>
                    <option value="ตามชั่วโมง/อัตรา">ตามชั่วโมง/อัตรา</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-slate-700">มีผลต่อการคำนวณภาษีเงินได้</label>
                  <div className="flex gap-4 pt-1">
                    <label className="flex items-center gap-1.5">
                      <input
                        type="radio"
                        checked={form.includeTax}
                        onChange={() => setForm({ ...form, includeTax: true })}
                      />
                      <span>มีผล</span>
                    </label>
                    <label className="flex items-center gap-1.5">
                      <input
                        type="radio"
                        checked={!form.includeTax}
                        onChange={() => setForm({ ...form, includeTax: false })}
                      />
                      <span>ไม่มีผล</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-slate-700">มีผลต่อการคำนวณประกันสังคม</label>
                  <div className="flex gap-4 pt-1">
                    <label className="flex items-center gap-1.5">
                      <input
                        type="radio"
                        checked={form.includeSocialSecurity}
                        onChange={() => setForm({ ...form, includeSocialSecurity: true })}
                      />
                      <span>มีผล</span>
                    </label>
                    <label className="flex items-center gap-1.5">
                      <input
                        type="radio"
                        checked={!form.includeSocialSecurity}
                        onChange={() => setForm({ ...form, includeSocialSecurity: false })}
                      />
                      <span>ไม่มีผล</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-slate-700">สถานะ</label>
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
                  <label className="mb-1 block font-semibold text-slate-700">หมายเหตุ</label>
                  <textarea
                    rows={2}
                    value={form.remark}
                    onChange={(e) => setForm({ ...form, remark: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setForm(INITIAL_ITEMS[0])}>
                    ยกเลิก
                  </Button>
                  <Button type="submit">
                    <Save className="h-4 w-4" /> บันทึก
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
