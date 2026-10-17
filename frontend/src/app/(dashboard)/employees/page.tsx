'use client';

import React, { useState } from 'react';
import {
  User,
  Landmark,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Save,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { validateThaiCitizenId, formatCitizenIdMask, formatCurrency } from '@/lib/utils';
import { apiFetch } from '@/lib/api';
import toast from 'react-hot-toast';

interface StaffRow {
  id: string;
  employeeCode: string;
  titleName: string;
  firstName: string;
  lastName: string;
  citizenId: string;
  birthDate: string;
  gender: string;
  phone: string;
  email: string;
  employeeTypeName: string;
  positionName: string;
  departmentName: string;
  hireDate: string;
  employmentStatus: string;
  baseSalary: number;
  bankName: string;
  accountNo: string;
}

const INITIAL_EMPLOYEES: StaffRow[] = [
  {
    id: 'emp-1',
    employeeCode: 'E0001',
    titleName: 'นาย',
    firstName: 'สมชาย',
    lastName: 'ใจดี',
    citizenId: '1234567890121',
    birthDate: '1992-05-15',
    gender: 'ชาย',
    phone: '0812345678',
    email: 'somchai@example.com',
    employeeTypeName: 'ข้าราชการ',
    positionName: 'พยาบาลวิชาชีพ',
    departmentName: 'แผนกการพยาบาล',
    hireDate: '2017-04-01',
    employmentStatus: 'ปฏิบัติงาน',
    baseSalary: 28000,
    bankName: 'กรุงไทย',
    accountNo: '123-4-56789-0',
  },
  {
    id: 'emp-2',
    employeeCode: 'E0002',
    titleName: 'นางสาว',
    firstName: 'สุภาพร',
    lastName: 'มีสุข',
    citizenId: '1130100045215',
    birthDate: '1990-08-20',
    gender: 'หญิง',
    phone: '0823456789',
    email: 'suda@example.com',
    employeeTypeName: 'พนักงานราชการ',
    positionName: 'นักวิชาการเงินและบัญชี',
    departmentName: 'งานการเงิน',
    hireDate: '2016-10-01',
    employmentStatus: 'ปฏิบัติงาน',
    baseSalary: 28500,
    bankName: 'กรุงไทย',
    accountNo: '123-4-56790-1',
  },
  {
    id: 'emp-3',
    employeeCode: 'E0003',
    titleName: 'นาย',
    firstName: 'กิตติพงศ์',
    lastName: 'แสนดี',
    citizenId: '1100500342117',
    birthDate: '1988-03-12',
    gender: 'ชาย',
    phone: '0834567890',
    email: 'kittipong@example.com',
    employeeTypeName: 'ลูกจ้างประจำ',
    positionName: 'เจ้าพนักงานธุรการ',
    departmentName: 'งานธุรการ',
    hireDate: '2015-05-01',
    employmentStatus: 'ปฏิบัติงาน',
    baseSalary: 24500,
    bankName: 'กรุงไทย',
    accountNo: '123-4-56791-2',
  },
  {
    id: 'emp-4',
    employeeCode: 'E0012',
    titleName: 'นางสาว',
    firstName: 'ศิริพร',
    lastName: 'แสงทอง',
    citizenId: '1100700198234',
    birthDate: '1991-11-05',
    gender: 'หญิง',
    phone: '0845678901',
    email: 'siriporn@samkokhosp.go.th',
    employeeTypeName: 'ข้าราชการ',
    positionName: 'พยาบาลวิชาชีพ',
    departmentName: 'แผนกการพยาบาล',
    hireDate: '2018-01-15',
    employmentStatus: 'ปฏิบัติงาน',
    baseSalary: 35250,
    bankName: 'กรุงไทย',
    accountNo: '123-4-56792-3',
  },
  {
    id: 'emp-5',
    employeeCode: 'E0018',
    titleName: 'นาย',
    firstName: 'วิทยา',
    lastName: 'กิตติศักดิ์',
    citizenId: '1100800541225',
    birthDate: '1993-02-18',
    gender: 'ชาย',
    phone: '0856789012',
    email: 'wittaya@samkokhosp.go.th',
    employeeTypeName: 'พนักงานกระทรวงสาธารณสุข',
    positionName: 'นักวิชาการสาธารณสุข',
    departmentName: 'ฝ่ายสนับสนุนบริการ',
    hireDate: '2019-06-01',
    employmentStatus: 'ปฏิบัติงาน',
    baseSalary: 27000,
    bankName: 'กรุงไทย',
    accountNo: '123-4-56793-4',
  },
];

export default function EmployeesPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'bank'>('general');
  const [employees, setEmployees] = useState<StaffRow[]>(INITIAL_EMPLOYEES);
  const [keyword, setKeyword] = useState('');
  const [filterDept, setFilterDept] = useState('ทั้งหมด');
  const [filterType, setFilterType] = useState('ทั้งหมด');
  const [filterStatus, setFilterStatus] = useState('ทั้งหมด');

  const [form, setForm] = useState<StaffRow>(INITIAL_EMPLOYEES[0]);

  const rawCitizenDigits = form.citizenId.replace(/\D/g, '');
  const isCitizenIdValid = validateThaiCitizenId(rawCitizenDigits);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCitizenIdValid) {
      toast.error(
        'เลขประจำตัวประชาชน 13 หลักไม่ถูกต้องตามหลัก Modulo 11 Check Digit Algorithm (หัวข้อ 2.1.3.4)',
      );
      return;
    }

    try {
      await apiFetch('/employees', {
        method: 'POST',
        body: JSON.stringify(form),
      });
    } catch {
      // Fallback update state locally
    }

    setEmployees((prev) => {
      const idx = prev.findIndex((item) => item.employeeCode === form.employeeCode);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = { ...form };
        return next;
      }
      return [{ ...form, id: `emp-${Date.now()}` }, ...prev];
    });
    toast.success(`บันทึกข้อมูลบุคลากร ${form.employeeCode} (${form.titleName}${form.firstName} ${form.lastName}) สำเร็จ`);
  };

  const handleSelectEdit = (emp: StaffRow) => {
    setForm({ ...emp });
    toast(`เลือกแก้ไขข้อมูล: ${emp.employeeCode} ${emp.titleName}${emp.firstName} ${emp.lastName}`);
  };

  const handleDelete = (code: string) => {
    setEmployees((prev) => prev.filter((e) => e.employeeCode !== code));
    toast.success(`ลบข้อมูลบุคลากรรหัส ${code} เรียบร้อยแล้ว`);
  };

  const filteredList = employees.filter((e) => {
    if (filterDept !== 'ทั้งหมด' && e.departmentName !== filterDept) return false;
    if (filterType !== 'ทั้งหมด' && e.employeeTypeName !== filterType) return false;
    if (filterStatus !== 'ทั้งหมด' && e.employmentStatus !== filterStatus) return false;
    if (keyword) {
      const kw = keyword.toLowerCase();
      const full = `${e.titleName}${e.firstName} ${e.lastName}`.toLowerCase();
      return (
        e.employeeCode.toLowerCase().includes(kw) ||
        full.includes(kw) ||
        e.citizenId.includes(kw)
      );
    }
    return true;
  });

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <Header breadcrumbs={['บุคลากร', 'ข้อมูลบุคลากร']} />

      <main className="flex-1 space-y-5 p-6">
        {/* ส่วนที่ 1: แบบฟอร์มบันทึกและจัดการข้อมูลบุคลากร (ตรงตามรูปที่ 3.66 - UC-06) */}
        <Card>
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <h2 className="text-base font-bold text-slate-800">ข้อมูลบุคลากร</h2>
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-semibold text-emerald-700">
              ใช้งาน
            </span>
          </div>

          <CardContent className="p-6">
            {/* แท็บสลับ ข้อมูลทั่วไป / บัญชีธนาคาร */}
            <div className="mb-5 flex gap-2 border-b border-slate-200 pb-3">
              <button
                type="button"
                onClick={() => setActiveTab('general')}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
                  activeTab === 'general'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <User className="h-3.5 w-3.5" /> ข้อมูลทั่วไป
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('bank')}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
                  activeTab === 'bank'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Landmark className="h-3.5 w-3.5" /> บัญชีธนาคาร (EmployeeBankAccount)
              </button>
            </div>

            <form onSubmit={handleSave}>
              {activeTab === 'general' ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      รหัสพนักงาน <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={form.employeeCode}
                      onChange={(e) => setForm({ ...form, employeeCode: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      คำนำหน้า <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.titleName}
                      onChange={(e) => setForm({ ...form, titleName: e.target.value })}
                      className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                    >
                      <option value="นาย">นาย</option>
                      <option value="นาง">นาง</option>
                      <option value="นางสาว">นางสาว</option>
                      <option value="นพ.">นพ.</option>
                      <option value="พญ.">พญ.</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      ชื่อ <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      นามสกุล <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      required
                    />
                  </div>

                  {/* เลขบัตรประชาชน 13 หลัก พร้อมการตรวจสอบ Modulo 11 แบบเรียลไทม์ */}
                  <div>
                    <label className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span>
                        เลขบัตรประชาชน <span className="text-red-500">*</span>
                      </span>
                      {rawCitizenDigits.length === 13 && (
                        <span
                          className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${
                            isCitizenIdValid ? 'text-emerald-600' : 'text-red-600'
                          }`}
                        >
                          {isCitizenIdValid ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" /> Modulo 11 ผ่าน
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-3 w-3" /> หลักที่ 13 ไม่ถูกต้อง
                            </>
                          )}
                        </span>
                      )}
                    </label>
                    <Input
                      value={formatCitizenIdMask(form.citizenId)}
                      onChange={(e) => setForm({ ...form, citizenId: e.target.value })}
                      placeholder="1-2345-67890-12-1"
                      className={
                        rawCitizenDigits.length === 13
                          ? isCitizenIdValid
                            ? 'border-emerald-500'
                            : 'border-red-500'
                          : ''
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      วันเกิด <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={form.birthDate}
                      onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      เพศ <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value })}
                      className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                    >
                      <option value="ชาย">ชาย</option>
                      <option value="หญิง">หญิง</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">เบอร์โทรศัพท์</label>
                    <Input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">อีเมล</label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      ประเภทบุคลากร <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.employeeTypeName}
                      onChange={(e) => setForm({ ...form, employeeTypeName: e.target.value })}
                      className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                    >
                      <option value="ข้าราชการ">ข้าราชการ</option>
                      <option value="พนักงานราชการ">พนักงานราชการ</option>
                      <option value="พนักงานกระทรวงสาธารณสุข">พนักงานกระทรวงสาธารณสุข</option>
                      <option value="ลูกจ้างประจำ">ลูกจ้างประจำ</option>
                      <option value="ลูกจ้างชั่วคราว">ลูกจ้างชั่วคราว</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      ตำแหน่ง <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.positionName}
                      onChange={(e) => setForm({ ...form, positionName: e.target.value })}
                      className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                    >
                      <option value="พยาบาลวิชาชีพ">พยาบาลวิชาชีพ</option>
                      <option value="นักวิชาการเงินและบัญชี">นักวิชาการเงินและบัญชี</option>
                      <option value="เจ้าพนักงานธุรการ">เจ้าพนักงานธุรการ</option>
                      <option value="นักวิชาการสาธารณสุข">นักวิชาการสาธารณสุข</option>
                      <option value="แพทย์">แพทย์</option>
                      <option value="เภสัชกร">เภสัชกร</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      หน่วยงาน <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.departmentName}
                      onChange={(e) => setForm({ ...form, departmentName: e.target.value })}
                      className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                    >
                      <option value="แผนกการพยาบาล">แผนกการพยาบาล</option>
                      <option value="งานการเงิน">งานการเงิน</option>
                      <option value="งานธุรการ">งานธุรการ</option>
                      <option value="ฝ่ายสนับสนุนบริการ">ฝ่ายสนับสนุนบริการ</option>
                      <option value="กลุ่มงานการแพทย์">กลุ่มงานการแพทย์</option>
                      <option value="กลุ่มงานเภสัชกรรม">กลุ่มงานเภสัชกรรม</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      วันที่เริ่มงาน <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={form.hireDate}
                      onChange={(e) => setForm({ ...form, hireDate: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      สถานะการจ้างงาน <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.employmentStatus}
                      onChange={(e) => setForm({ ...form, employmentStatus: e.target.value })}
                      className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                    >
                      <option value="ปฏิบัติงาน">ปฏิบัติงาน (ACTIVE)</option>
                      <option value="ลาศึกษาต่อ">ลาศึกษาต่อ (ON_LEAVE)</option>
                      <option value="ลาออก">ลาออก (RESIGNED)</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      เงินเดือนพื้นฐาน <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.baseSalary}
                      onChange={(e) => setForm({ ...form, baseSalary: Number(e.target.value) })}
                      className="text-right font-semibold"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">ธนาคาร</label>
                    <select
                      value={form.bankName}
                      onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                      className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                    >
                      <option value="กรุงไทย">ธนาคารกรุงไทย (KTB)</option>
                      <option value="ออมสิน">ธนาคารออมสิน (GSB)</option>
                      <option value="ไทยพาณิชย์">ธนาคารไทยพาณิชย์ (SCB)</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">เลขที่บัญชีธนาคาร</label>
                    <Input
                      value={form.accountNo}
                      onChange={(e) => setForm({ ...form, accountNo: e.target.value })}
                      placeholder="123-4-56789-0"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">ชื่อบัญชี</label>
                    <Input value={`${form.titleName}${form.firstName} ${form.lastName}`} readOnly className="bg-slate-50" />
                  </div>
                </div>
              )}

              <div className="mt-5 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setForm(INITIAL_EMPLOYEES[0])}
                >
                  ยกเลิก
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4" /> บันทึก
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* ส่วนที่ 2: ตารางรายการบุคลากร (ตรงตามรูปที่ 3.66) */}
        <Card>
          <div className="p-6">
            <h3 className="mb-4 text-sm font-bold text-slate-800">รายการบุคลากร</h3>

            <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-5">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="ค้นหารหัสพนักงาน, ชื่อ-นามสกุล, เลขบัตรประชาชน..."
                  className="pl-9"
                />
              </div>
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs"
              >
                <option value="ทั้งหมด">หน่วยงาน: ทั้งหมด</option>
                <option value="แผนกการพยาบาล">แผนกการพยาบาล</option>
                <option value="งานการเงิน">งานการเงิน</option>
                <option value="งานธุรการ">งานธุรการ</option>
                <option value="ฝ่ายสนับสนุนบริการ">ฝ่ายสนับสนุนบริการ</option>
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs"
              >
                <option value="ทั้งหมด">ประเภทบุคลากร: ทั้งหมด</option>
                <option value="ข้าราชการ">ข้าราชการ</option>
                <option value="พนักงานราชการ">พนักงานราชการ</option>
                <option value="พนักงานกระทรวงสาธารณสุข">พนักงานกระทรวงสาธารณสุข</option>
                <option value="ลูกจ้างประจำ">ลูกจ้างประจำ</option>
              </select>
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="h-9 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-xs"
                >
                  <option value="ทั้งหมด">สถานะ: ทั้งหมด</option>
                  <option value="ปฏิบัติงาน">ปฏิบัติงาน</option>
                  <option value="ลาออก">ลาออก</option>
                </select>
                <Button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...INITIAL_EMPLOYEES[0],
                      employeeCode: `E00${employees.length + 10}`,
                      firstName: '',
                      lastName: '',
                      citizenId: '1234567890121',
                    })
                  }
                >
                  <Plus className="h-4 w-4" /> เพิ่มบุคลากร
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold">ลำดับ</th>
                    <th className="px-4 py-3 font-semibold">รหัสพนักงาน</th>
                    <th className="px-4 py-3 font-semibold">ชื่อ-นามสกุล</th>
                    <th className="px-4 py-3 font-semibold">ตำแหน่ง</th>
                    <th className="px-4 py-3 font-semibold">หน่วยงาน</th>
                    <th className="px-4 py-3 font-semibold">ประเภทบุคลากร</th>
                    <th className="px-4 py-3 text-right font-semibold">เงินเดือนฐาน</th>
                    <th className="px-4 py-3 text-center font-semibold">สถานะ</th>
                    <th className="px-4 py-3 text-center font-semibold">การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredList.map((emp, idx) => (
                    <tr key={emp.employeeCode} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 text-slate-500">{idx + 1}</td>
                      <td className="px-4 py-3 font-semibold text-blue-700">{emp.employeeCode}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {emp.titleName}
                        {emp.firstName} {emp.lastName}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{emp.positionName}</td>
                      <td className="px-4 py-3 text-slate-600">{emp.departmentName}</td>
                      <td className="px-4 py-3 text-slate-600">{emp.employeeTypeName}</td>
                      <td className="px-4 py-3 text-right font-medium text-slate-800">
                        {formatCurrency(emp.baseSalary)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                          {emp.employmentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleSelectEdit(emp)}
                            className="rounded p-1 text-blue-600 hover:bg-blue-50"
                            title="แก้ไข"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(emp.employeeCode)}
                            className="rounded p-1 text-red-500 hover:bg-red-50"
                            title="ลบ"
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

            <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
              <span>แสดง 1 - {filteredList.length} จาก 150 รายการ</span>
              <div className="flex items-center gap-1">
                <button className="rounded border border-slate-200 px-2.5 py-1 bg-blue-600 text-white font-semibold">
                  1
                </button>
                <button className="rounded border border-slate-200 px-2.5 py-1 hover:bg-slate-100">2</button>
                <button className="rounded border border-slate-200 px-2.5 py-1 hover:bg-slate-100">3</button>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
