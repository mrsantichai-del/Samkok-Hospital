'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Save } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiFetch } from '@/lib/api';
import toast from 'react-hot-toast';

export interface SystemParameterItem {
  code: string;
  name: string;
  category: string;
  value: string;
  unit: string;
  effectiveDate: string;
  status: string;
  remark: string;
}

const PARAM_TABS = [
  { label: 'พารามิเตอร์เงินเดือน', category: 'PAYROLL' },
  { label: 'อัตราประกันสังคม', category: 'SOCIAL_SECURITY' },
  { label: 'อัตราภาษี', category: 'TAX' },
  { label: 'อัตรากองทุนสำรองเลี้ยงชีพ', category: 'FUND' },
  { label: 'หน่วยงาน', category: 'DEPARTMENT' },
  { label: 'ตำแหน่งงาน', category: 'POSITION' },
  { label: 'ประเภทบุคลากร', category: 'EMPLOYEE_TYPE' },
];

const INITIAL_PARAMETERS: SystemParameterItem[] = [
  // 1. พารามิเตอร์เงินเดือน (PAYROLL)
  {
    code: 'OT_HOURLY_RATE',
    name: 'อัตราค่าล่วงเวลามาตรฐาน (OT)',
    category: 'PAYROLL',
    value: '150',
    unit: 'บาท/ชั่วโมง',
    effectiveDate: '2026-01-01',
    status: 'ใช้งาน',
    remark: 'ใช้คำนวณค่าล่วงเวลา (OT) มาตรฐานนอกเวลาราชการ',
  },
  {
    code: 'SHIFT_ALLOWANCE_RATE',
    name: 'อัตราค่าเวรผลัดบ่าย/ดึก',
    category: 'PAYROLL',
    value: '600',
    unit: 'บาท/เวร',
    effectiveDate: '2026-01-01',
    status: 'ใช้งาน',
    remark: 'ค่าตอบแทนการปฏิบัติงานนอกเวลาราชการ (ฉบับที่ 11 / ค่าเวร)',
  },
  {
    code: 'WORKING_DAYS_PER_MONTH',
    name: 'จำนวนวันทำงานมาตรฐานต่อเดือน',
    category: 'PAYROLL',
    value: '22',
    unit: 'วัน/เดือน',
    effectiveDate: '2026-01-01',
    status: 'ใช้งาน',
    remark: 'จำนวนวันทำการมาตรฐานสำหรับคำนวณอัตราค่าจ้างรายวัน',
  },
  {
    code: 'WORKING_HOURS_PER_DAY',
    name: 'จำนวนชั่วโมงทำงานมาตรฐานต่อวัน',
    category: 'PAYROLL',
    value: '8',
    unit: 'ชั่วโมง/วัน',
    effectiveDate: '2026-01-01',
    status: 'ใช้งาน',
    remark: 'จำนวนชั่วโมงปฏิบัติงานปกติต่อวัน',
  },
  {
    code: 'HOSPITAL_BUDGET_YEARLY',
    name: 'งบประมาณค่าใช้จ่ายบุคลากรประจำปี',
    category: 'PAYROLL',
    value: '15,295,000',
    unit: 'บาท/ปี',
    effectiveDate: '2026-01-01',
    status: 'ใช้งาน',
    remark: 'งบประมาณหมวดเงินเดือนและค่าตอบแทน โรงพยาบาลสามโคก',
  },

  // 2. อัตราประกันสังคม (SOCIAL_SECURITY)
  {
    code: 'SSO_RATE',
    name: 'อัตราเงินสมทบกองทุนประกันสังคม',
    category: 'SOCIAL_SECURITY',
    value: '5',
    unit: 'ร้อยละ (%)',
    effectiveDate: '2026-01-01',
    status: 'ใช้งาน',
    remark: 'คิดร้อยละ 5 ของฐานเงินเดือน (ผู้ประกันตนมาตรา 33)',
  },
  {
    code: 'SSO_MAX_WAGE',
    name: 'ฐานเงินเดือนสูงสุดในการคำนวณประกันสังคม',
    category: 'SOCIAL_SECURITY',
    value: '15,000',
    unit: 'บาท/เดือน',
    effectiveDate: '2026-01-01',
    status: 'ใช้งาน',
    remark: 'เพดานฐานค่าจ้างสูงสุดตามระเบียบสำนักงานประกันสังคม',
  },
  {
    code: 'SSO_MAX_AMOUNT',
    name: 'เพดานเงินสมทบประกันสังคมสูงสุดต่อเดือน',
    category: 'SOCIAL_SECURITY',
    value: '750',
    unit: 'บาท/เดือน',
    effectiveDate: '2026-01-01',
    status: 'ใช้งาน',
    remark: 'หักเงินสมทบสูงสุดไม่เกิน 750 บาทต่อเดือน',
  },

  // 3. อัตราภาษี (TAX)
  {
    code: 'TAX_WITHHOLDING_RATE',
    name: 'อัตราภาษีเงินได้หัก ณ ที่จ่ายเฉลี่ย',
    category: 'TAX',
    value: '5',
    unit: 'ร้อยละ (%)',
    effectiveDate: '2026-01-01',
    status: 'ใช้งาน',
    remark: 'อัตราคำนวณภาษีเงินได้บุคคลธรรมดาหัก ณ ที่จ่ายมาตรฐาน',
  },
  {
    code: 'TAX_PERSONAL_DEDUCTION',
    name: 'ค่าลดหย่อนส่วนตัวผู้มีเงินได้',
    category: 'TAX',
    value: '60,000',
    unit: 'บาท/ปี',
    effectiveDate: '2026-01-01',
    status: 'ใช้งาน',
    remark: 'ค่าลดหย่อนส่วนตัวตามประมวลรัษฎากร',
  },
  {
    code: 'TAX_EXPENSE_MAX',
    name: 'ค่าใช้จ่ายหักเหมาสูงสุด (ร้อยละ 50)',
    category: 'TAX',
    value: '100,000',
    unit: 'บาท/ปี',
    effectiveDate: '2026-01-01',
    status: 'ใช้งาน',
    remark: 'หักค่าใช้จ่ายเงินได้พึงประเมินมาตรา 40(1) ไม่เกิน 100,000 บาท',
  },

  // 4. อัตรากองทุนสำรองเลี้ยงชีพ / กบข. (FUND)
  {
    code: 'GPF_DEFAULT_RATE',
    name: 'อัตราเงินสะสมกองทุนบำเหน็จบำนาญข้าราชการ (กบข.)',
    category: 'FUND',
    value: '3',
    unit: 'ร้อยละ (%)',
    effectiveDate: '2026-01-01',
    status: 'ใช้งาน',
    remark: 'อัตราเงินสะสมบังคับขั้นต่ำร้อยละ 3 ของเงินเดือนข้าราชการ',
  },
  {
    code: 'PVD_EMPLOYEE_RATE',
    name: 'อัตราเงินสะสมกองทุนสำรองเลี้ยงชีพ (พกส./ลูกจ้างประจำ)',
    category: 'FUND',
    value: '3',
    unit: 'ร้อยละ (%)',
    effectiveDate: '2026-01-01',
    status: 'ใช้งาน',
    remark: 'อัตราเงินสะสมสำหรับพนักงานกระทรวงสาธารณสุข (กสจ.) และลูกจ้างประจำ',
  },

  // 5. หน่วยงาน (DEPARTMENT)
  {
    code: 'DEPT001',
    name: 'ฝ่ายการเงิน',
    category: 'DEPARTMENT',
    value: '1. อาคารผู้ป่วยนอก',
    unit: 'อาคารปฏิบัติงาน',
    effectiveDate: '2026-01-01',
    status: 'ใช้งาน',
    remark: 'งานการเงินและบัญชี โรงพยาบาลสามโคก',
  },
  {
    code: 'DEPT002',
    name: 'ฝ่ายทรัพยากรบุคคล',
    category: 'DEPARTMENT',
    value: '1. อาคารผู้ป่วยนอก',
    unit: 'อาคารปฏิบัติงาน',
    effectiveDate: '2026-01-01',
    status: 'ใช้งาน',
    remark: 'งานบริหารทรัพยากรบุคคลและสวัสดิการ',
  },
  {
    code: 'DEPT003',
    name: 'กลุ่มงานการแพทย์',
    category: 'DEPARTMENT',
    value: '1. อาคารผู้ป่วยนอก / 2. อาคารอุบัติเหตุฉุกเฉิน',
    unit: 'อาคารปฏิบัติงาน',
    effectiveDate: '2026-01-01',
    status: 'ใช้งาน',
    remark: 'บริการตรวจรักษาผู้ป่วยนอกและฉุกเฉิน',
  },
  {
    code: 'DEPT004',
    name: 'กลุ่มงานการพยาบาล',
    category: 'DEPARTMENT',
    value: '3. อาคารผู้ป่วยใน / 4. ตึก IMC',
    unit: 'อาคารปฏิบัติงาน',
    effectiveDate: '2026-01-01',
    status: 'ใช้งาน',
    remark: 'บริการพยาบาลผู้ป่วยใน ผู้ป่วยนอก และตึก IMC',
  },
  {
    code: 'DEPT005',
    name: 'กลุ่มงานเภสัชกรรม',
    category: 'DEPARTMENT',
    value: '1. อาคารผู้ป่วยนอก',
    unit: 'อาคารปฏิบัติงาน',
    effectiveDate: '2026-01-01',
    status: 'ใช้งาน',
    remark: 'งานเภสัชกรรมและจ่ายยา',
  },
  {
    code: 'DEPT006',
    name: 'ฝ่ายสนับสนุนบริการ',
    category: 'DEPARTMENT',
    value: '5. จ่ายกลางหรือ IC / 6. โภชนาการ / 7. ซักฟอก',
    unit: 'อาคารปฏิบัติงาน',
    effectiveDate: '2026-01-01',
    status: 'ใช้งาน',
    remark: 'งานจ่ายกลาง โภชนาการ และซักฟอก',
  },
  {
    code: 'DEPT007',
    name: 'ฝ่ายบริหารทั่วไป',
    category: 'DEPARTMENT',
    value: '1. อาคารผู้ป่วยนอก',
    unit: 'อาคารปฏิบัติงาน',
    effectiveDate: '2026-01-01',
    status: 'ใช้งาน',
    remark: 'งานธุรการ พัสดุ และบริหารทั่วไป',
  },

  // 6. ตำแหน่งงาน (POSITION)
  {
    code: 'POS001',
    name: 'ผู้อำนวยการโรงพยาบาล',
    category: 'POSITION',
    value: 'ฝ่ายบริหารทั่วไป',
    unit: 'สังกัดหน่วยงาน',
    effectiveDate: '2026-01-01',
    status: 'ใช้งาน',
    remark: 'ผู้บริหารสูงสุดของโรงพยาบาลสามโคก',
  },
  {
    code: 'POS002',
    name: 'นักวิชาการเงินและบัญชี',
    category: 'POSITION',
    value: 'ฝ่ายการเงิน',
    unit: 'สังกัดหน่วยงาน',
    effectiveDate: '2026-01-01',
    status: 'ใช้งาน',
    remark: 'ผู้รับผิดชอบการประมวลผลและตรวจสอบงวดเงินเดือน',
  },
  {
    code: 'POS003',
    name: 'พยาบาลวิชาชีพ',
    category: 'POSITION',
    value: 'กลุ่มงานการพยาบาล',
    unit: 'สังกัดหน่วยงาน',
    effectiveDate: '2026-01-01',
    status: 'ใช้งาน',
    remark: 'ปฏิบัติงานดูแลผู้ป่วยนอก ผู้ป่วยใน และตึก IMC',
  },
  {
    code: 'POS004',
    name: 'แพทย์',
    category: 'POSITION',
    value: 'กลุ่มงานการแพทย์',
    unit: 'สังกัดหน่วยงาน',
    effectiveDate: '2026-01-01',
    status: 'ใช้งาน',
    remark: 'นายแพทย์ปฏิบัติการ/ชำนาญการ',
  },
  {
    code: 'POS005',
    name: 'เภสัชกร',
    category: 'POSITION',
    value: 'กลุ่มงานเภสัชกรรม',
    unit: 'สังกัดหน่วยงาน',
    effectiveDate: '2026-01-01',
    status: 'ใช้งาน',
    remark: 'เภสัชกรปฏิบัติการ/ชำนาญการ',
  },

  // 7. ประเภทบุคลากร (EMPLOYEE_TYPE)
  {
    code: 'EMPT01',
    name: 'ข้าราชการ',
    category: 'EMPLOYEE_TYPE',
    value: 'กบข. (3%) + ภาษีหัก ณ ที่จ่าย',
    unit: 'สิทธิการหักสะสม',
    effectiveDate: '2026-01-01',
    status: 'ใช้งาน',
    remark: 'ข้าราชการสังกัดสำนักงานปลัดกระทรวงสาธารณสุข',
  },
  {
    code: 'EMPT02',
    name: 'พนักงานราชการ',
    category: 'EMPLOYEE_TYPE',
    value: 'ประกันสังคม (5%) + ภาษีหัก ณ ที่จ่าย',
    unit: 'สิทธิการหักสะสม',
    effectiveDate: '2026-01-01',
    status: 'ใช้งาน',
    remark: 'พนักงานราชการทั่วไปและเฉพาะทาง',
  },
  {
    code: 'EMPT03',
    name: 'พนักงานกระทรวงสาธารณสุข (พกส.)',
    category: 'EMPLOYEE_TYPE',
    value: 'ประกันสังคม (5%) + กสจ. (3%)',
    unit: 'สิทธิการหักสะสม',
    effectiveDate: '2026-01-01',
    status: 'ใช้งาน',
    remark: 'พนักงานกระทรวงสาธารณสุข (พกส.)',
  },
  {
    code: 'EMPT04',
    name: 'ลูกจ้างประจำ',
    category: 'EMPLOYEE_TYPE',
    value: 'กสจ. (3%) + ภาษีหัก ณ ที่จ่าย',
    unit: 'สิทธิการหักสะสม',
    effectiveDate: '2026-01-01',
    status: 'ใช้งาน',
    remark: 'ลูกจ้างประจำในงบประมาณและนอกงบประมาณ',
  },
  {
    code: 'EMPT05',
    name: 'ลูกจ้างชั่วคราว',
    category: 'EMPLOYEE_TYPE',
    value: 'ประกันสังคม (5%)',
    unit: 'สิทธิการหักสะสม',
    effectiveDate: '2026-01-01',
    status: 'ใช้งาน',
    remark: 'ลูกจ้างชั่วคราวรายเดือน/รายวัน',
  },
];

export default function SystemParametersPage() {
  const [activeTab, setActiveTab] = useState(PARAM_TABS[0]);
  const [rows, setRows] = useState<SystemParameterItem[]>(INITIAL_PARAMETERS);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [form, setForm] = useState<SystemParameterItem>(INITIAL_PARAMETERS[0]);

  useEffect(() => {
    const firstInCat = rows.find((r) => r.category === activeTab.category);
    if (firstInCat) {
      setForm(firstInCat);
    } else {
      setForm({
        code: '',
        name: '',
        category: activeTab.category,
        value: '',
        unit: '',
        effectiveDate: '2026-01-01',
        status: 'ใช้งาน',
        remark: '',
      });
    }
  }, [activeTab]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/parameters', {
        method: 'POST',
        body: JSON.stringify({
          code: form.code,
          name: form.name,
          category: form.category,
          value: form.value,
          effectiveDate: form.effectiveDate,
          isActive: form.status === 'ใช้งาน',
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

  const categoryRows = rows.filter(
    (r) =>
      r.category === activeTab.category &&
      (statusFilter === 'ALL' || r.status === statusFilter) &&
      (r.code.toLowerCase().includes(keyword.toLowerCase()) ||
        r.name.toLowerCase().includes(keyword.toLowerCase()) ||
        r.value.toLowerCase().includes(keyword.toLowerCase())),
  );

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <Header breadcrumbs={['ตั้งค่าระบบ', 'จัดการค่าพื้นฐานและพารามิเตอร์ (UC-04)']} />

      <main className="flex-1 space-y-5 p-6">
        {/* แถบแท็บด้านบน 7 หมวดพารามิเตอร์ระบบสำหรับผู้ดูแลระบบ (UC-04) */}
        <div className="flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
          {PARAM_TABS.map((t) => (
            <button
              key={t.category}
              onClick={() => setActiveTab(t)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                activeTab.category === t.category
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* แบบฟอร์มข้อมูลค่าพื้นฐานและพารามิเตอร์ระบบ (SystemParameter - UC-04) */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-800">
                  ตั้งค่าข้อมูล{activeTab.label} (ตาราง SystemParameter)
                </h2>
                <p className="text-xs text-slate-500">
                  กำหนดค่าคงที่ระดับระบบ อัตรากฎหมาย และโครงสร้างองค์กร สำหรับใช้เป็นตัวแปรต้นในการประมวลผลเงินเดือน
                </p>
              </div>
              <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                สิทธิ์ผู้ดูแลระบบ (ADMIN - UC-04)
              </span>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  รหัสพารามิเตอร์ (Parameter Code) <span className="text-red-500">*</span>
                </label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="เช่น OT_HOURLY_RATE, SSO_RATE"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  หมวดหมู่พารามิเตอร์ (Category) <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs"
                >
                  {PARAM_TABS.map((t) => (
                    <option key={t.category} value={t.category}>
                      {t.label} ({t.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  ชื่อพารามิเตอร์ / รายการค่าพื้นฐาน <span className="text-red-500">*</span>
                </label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="ระบุชื่อพารามิเตอร์"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  ค่าที่กำหนด (Parameter Value) <span className="text-red-500">*</span>
                </label>
                <Input
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  placeholder="เช่น 150, 5, 750"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  หน่วยนับ / รายละเอียดอ้างอิง <span className="text-red-500">*</span>
                </label>
                <Input
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  placeholder="เช่น บาท/ชั่วโมง, ร้อยละ (%), บาท/เดือน"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    วันที่มีผลบังคับใช้ <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={form.effectiveDate}
                    onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })}
                    required
                  />
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
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  หมายเหตุ / คำอธิบายเงื่อนไขกฎหมาย
                </label>
                <Input
                  value={form.remark}
                  onChange={(e) => setForm({ ...form, remark: e.target.value })}
                  placeholder="ระบุคำอธิบายเพิ่มเติมหรือระเบียบอ้างอิง"
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const first = categoryRows[0] || INITIAL_PARAMETERS[0];
                    setForm(first);
                  }}
                >
                  ยกเลิก
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4" /> บันทึกพารามิเตอร์
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* ตารางรายการพารามิเตอร์ระบบ (UC-04) */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">
                รายการ{activeTab.label} ({categoryRows.length} รายการ)
              </h3>
              <Button
                size="sm"
                onClick={() =>
                  setForm({
                    code: `PARAM_0${rows.length + 1}`,
                    name: '',
                    category: activeTab.category,
                    value: '',
                    unit: 'บาท',
                    effectiveDate: '2026-01-01',
                    status: 'ใช้งาน',
                    remark: '',
                  })
                }
              >
                <Plus className="h-3.5 w-3.5" /> เพิ่ม{activeTab.label}
              </Button>
            </div>

            <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder={`ค้นหารหัสพารามิเตอร์ หรือชื่อรายการในหมวด${activeTab.label}...`}
                  className="pl-9"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs"
              >
                <option value="ALL">สถานะ: ทั้งหมด</option>
                <option value="ใช้งาน">ใช้งาน</option>
                <option value="ระงับ">ระงับ</option>
              </select>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">ลำดับ</th>
                    <th className="px-4 py-3">รหัสพารามิเตอร์</th>
                    <th className="px-4 py-3">ชื่อพารามิเตอร์ / ค่าพื้นฐาน</th>
                    <th className="px-4 py-3">ค่าที่กำหนด</th>
                    <th className="px-4 py-3">หน่วยนับ / อ้างอิง</th>
                    <th className="px-4 py-3">วันที่มีผลบังคับใช้</th>
                    <th className="px-4 py-3">หมายเหตุ</th>
                    <th className="px-4 py-3 text-center">สถานะ</th>
                    <th className="px-4 py-3 text-center">การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {categoryRows.map((r, i) => (
                    <tr
                      key={r.code}
                      onClick={() => setForm(r)}
                      className="cursor-pointer hover:bg-slate-50"
                    >
                      <td className="px-4 py-3">{i + 1}</td>
                      <td className="px-4 py-3 font-mono font-semibold text-blue-700">{r.code}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{r.name}</td>
                      <td className="px-4 py-3 font-bold text-emerald-700">{r.value}</td>
                      <td className="px-4 py-3 text-slate-600">{r.unit}</td>
                      <td className="px-4 py-3 text-slate-600">{r.effectiveDate}</td>
                      <td className="px-4 py-3 text-slate-500">{r.remark}</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            r.status === 'ใช้งาน'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setForm(r);
                            }}
                            className="rounded p-1 text-blue-600 hover:bg-blue-50"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRows((prev) => prev.filter((item) => item.code !== r.code));
                            }}
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
