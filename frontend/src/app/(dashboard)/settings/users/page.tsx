'use client';

import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Save } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiFetch } from '@/lib/api';
import toast from 'react-hot-toast';

interface UserAccount {
  id: string;
  username: string;
  fullName: string;
  employeeCode: string;
  role: string;
  roleDisplay: string;
  status: 'ใช้งาน' | 'ระงับใช้งาน';
  email: string;
  remark: string;
}

const INITIAL_USERS: UserAccount[] = [
  {
    id: '1',
    username: 'somchai',
    fullName: 'นายสมชาย ใจดี',
    employeeCode: 'E0001 - นายสมชาย ใจดี',
    role: 'ADMIN',
    roleDisplay: 'ผู้ดูแลระบบ',
    status: 'ใช้งาน',
    email: 'somchai@example.com',
    remark: '',
  },
  {
    id: '2',
    username: 'suda',
    fullName: 'นางสุภา มีสุข',
    employeeCode: 'E0002 - นางสุภา มีสุข',
    role: 'FINANCE',
    roleDisplay: 'เจ้าหน้าที่ฝ่ายการเงิน',
    status: 'ใช้งาน',
    email: 'suda@example.com',
    remark: '',
  },
  {
    id: '3',
    username: 'wipada',
    fullName: 'นางวิภาดา คนดี',
    employeeCode: 'E0025 - นางวิภาดา คนดี',
    role: 'FINANCE',
    roleDisplay: 'เจ้าหน้าที่ฝ่ายทรัพยากรบุคคล',
    status: 'ใช้งาน',
    email: 'wipada@example.com',
    remark: '',
  },
  {
    id: '4',
    username: 'anucha',
    fullName: 'นายอนุชา รักงาน',
    employeeCode: 'E0040 - นายอนุชา รักงาน',
    role: 'EXECUTIVE',
    roleDisplay: 'ผู้อนุมัติ',
    status: 'ใช้งาน',
    email: 'anucha@example.com',
    remark: '',
  },
  {
    id: '5',
    username: 'panya',
    fullName: 'นายปัญญา ศรีศรี',
    employeeCode: 'E0018 - นายปัญญา ศรีศรี',
    role: 'EMPLOYEE',
    roleDisplay: 'บุคลากรทั่วไป',
    status: 'ใช้งาน',
    email: 'panya@example.com',
    remark: '',
  },
  {
    id: '6',
    username: 'kamon',
    fullName: 'นางกมลทิพย์ จันทรา',
    employeeCode: 'E0012 - นางกมลทิพย์ จันทรา',
    role: 'EMPLOYEE',
    roleDisplay: 'บุคลากรทั่วไป',
    status: 'ระงับใช้งาน',
    email: 'kamon@example.com',
    remark: 'ลาศึกษาต่อ',
  },
  {
    id: '7',
    username: 'thanakrit',
    fullName: 'นายธนกฤต นันทศิริ',
    employeeCode: 'E0003 - นายธนกฤต นันทศิริ',
    role: 'FINANCE',
    roleDisplay: 'เจ้าหน้าที่ฝ่ายการเงิน',
    status: 'ใช้งาน',
    email: 'thanakrit@example.com',
    remark: '',
  },
];

export default function UsersSettingsPage() {
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('ทั้งหมด');
  const [roleFilter, setRoleFilter] = useState('ทั้งหมด');

  const [form, setForm] = useState({
    id: '1',
    username: 'somchai',
    employeeCode: 'E0001 - นายสมชาย ใจดี',
    password: 'password123',
    confirmPassword: 'password123',
    roleDisplay: 'ผู้ดูแลระบบ',
    email: 'somchai@example.com',
    status: 'ใช้งาน' as 'ใช้งาน' | 'ระงับใช้งาน',
    remark: '',
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    try {
      await apiFetch('/users', {
        method: 'POST',
        body: JSON.stringify(form),
      });
    } catch {
      // Fallback
    }

    setUsers((prev) => {
      const idx = prev.findIndex((u) => u.username === form.username);
      const updated: UserAccount = {
        id: form.id || String(Date.now()),
        username: form.username,
        fullName: form.employeeCode.split(' - ')[1] || form.username,
        employeeCode: form.employeeCode,
        role:
          form.roleDisplay === 'ผู้ดูแลระบบ'
            ? 'ADMIN'
            : form.roleDisplay === 'ผู้อนุมัติ'
            ? 'EXECUTIVE'
            : form.roleDisplay.includes('การเงิน')
            ? 'FINANCE'
            : 'EMPLOYEE',
        roleDisplay: form.roleDisplay,
        status: form.status,
        email: form.email,
        remark: form.remark,
      };
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = updated;
        return next;
      }
      return [...prev, updated];
    });
    toast.success(`บันทึกข้อมูลบัญชีผู้ใช้งาน ${form.username} สำเร็จ (UC-02)`);
  };

  const filtered = users.filter((u) => {
    if (statusFilter !== 'ทั้งหมด' && u.status !== statusFilter) return false;
    if (roleFilter !== 'ทั้งหมด' && u.roleDisplay !== roleFilter) return false;
    if (keyword) {
      const kw = keyword.toLowerCase();
      return (
        u.username.toLowerCase().includes(kw) ||
        u.fullName.toLowerCase().includes(kw) ||
        u.roleDisplay.toLowerCase().includes(kw)
      );
    }
    return true;
  });

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <Header breadcrumbs={['ตั้งค่าระบบ', 'จัดการบัญชีผู้ใช้งาน']} />

      <main className="flex-1 space-y-5 p-6">
        {/* แบบฟอร์มจัดการบัญชีผู้ใช้งาน (ตรงตามรูปที่ 3.71 - UC-02) */}
        <Card>
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <h2 className="text-base font-bold text-slate-800">ข้อมูลบัญชีผู้ใช้งาน</h2>
            <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-semibold text-emerald-700">
              {form.status}
            </span>
          </div>
          <CardContent className="p-6">
            <form onSubmit={handleSave} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  ชื่อผู้ใช้งาน <span className="text-red-500">*</span>
                </label>
                <Input
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  บุคลากร <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.employeeCode}
                  onChange={(e) => setForm({ ...form, employeeCode: e.target.value })}
                  className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs"
                >
                  <option>E0001 - นายสมชาย ใจดี</option>
                  <option>E0002 - นางสุภา มีสุข</option>
                  <option>E0003 - นายธนกฤต นันทศิริ</option>
                  <option>E0012 - นางกมลทิพย์ จันทรา</option>
                  <option>E0040 - นายอนุชา รักงาน</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  รหัสผ่าน <span className="text-red-500">*</span>
                </label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  บทบาท <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.roleDisplay}
                  onChange={(e) => setForm({ ...form, roleDisplay: e.target.value })}
                  className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs"
                >
                  <option value="ผู้ดูแลระบบ">ผู้ดูแลระบบ</option>
                  <option value="เจ้าหน้าที่ฝ่ายการเงิน">เจ้าหน้าที่ฝ่ายการเงิน</option>
                  <option value="เจ้าหน้าที่ฝ่ายทรัพยากรบุคคล">เจ้าหน้าที่ฝ่ายทรัพยากรบุคคล</option>
                  <option value="ผู้อนุมัติ">ผู้อนุมัติ</option>
                  <option value="บุคลากรทั่วไป">บุคลากรทั่วไป</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  ยืนยันรหัสผ่าน <span className="text-red-500">*</span>
                </label>
                <Input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  required
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
                  สถานะ <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                  className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs"
                >
                  <option value="ใช้งาน">ใช้งาน (Active)</option>
                  <option value="ระงับใช้งาน">ระงับใช้งาน (Inactive)</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">หมายเหตุ</label>
                <Input
                  value={form.remark}
                  onChange={(e) => setForm({ ...form, remark: e.target.value })}
                  placeholder="-"
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline">
                  ยกเลิก
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4" /> บันทึก
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* ตารางรายการบัญชีผู้ใช้งาน (ตรงตามรูปที่ 3.71) */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">รายการบัญชีผู้ใช้งาน</h3>
              <Button
                size="sm"
                onClick={() =>
                  setForm({
                    id: String(Date.now()),
                    username: '',
                    employeeCode: 'E0001 - นายสมชาย ใจดี',
                    password: 'password123',
                    confirmPassword: 'password123',
                    roleDisplay: 'เจ้าหน้าที่ฝ่ายการเงิน',
                    email: '',
                    status: 'ใช้งาน',
                    remark: '',
                  })
                }
              >
                <Plus className="h-3.5 w-3.5" /> เพิ่มบัญชีผู้ใช้งาน
              </Button>
            </div>

            <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="ค้นหา ชื่อผู้ใช้งาน, ชื่อ-นามสกุล, บทบาท..."
                  className="pl-9"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs"
              >
                <option value="ทั้งหมด">สถานะ: ทั้งหมด</option>
                <option value="ใช้งาน">ใช้งาน</option>
                <option value="ระงับใช้งาน">ระงับใช้งาน</option>
              </select>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs"
              >
                <option value="ทั้งหมด">บทบาท: ทั้งหมด</option>
                <option value="ผู้ดูแลระบบ">ผู้ดูแลระบบ</option>
                <option value="เจ้าหน้าที่ฝ่ายการเงิน">เจ้าหน้าที่ฝ่ายการเงิน</option>
                <option value="ผู้อนุมัติ">ผู้อนุมัติ</option>
                <option value="บุคลากรทั่วไป">บุคลากรทั่วไป</option>
              </select>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">ลำดับ</th>
                    <th className="px-4 py-3">ชื่อผู้ใช้งาน</th>
                    <th className="px-4 py-3">ชื่อ-นามสกุล</th>
                    <th className="px-4 py-3">บทบาท</th>
                    <th className="px-4 py-3 text-center">สถานะ</th>
                    <th className="px-4 py-3">อีเมล</th>
                    <th className="px-4 py-3 text-center">การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filtered.map((u, idx) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">{idx + 1}</td>
                      <td className="px-4 py-3 font-semibold text-blue-700">{u.username}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{u.fullName}</td>
                      <td className="px-4 py-3 text-slate-600">{u.roleDisplay}</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            u.status === 'ใช้งาน'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{u.email}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() =>
                              setForm({
                                id: u.id,
                                username: u.username,
                                employeeCode: u.employeeCode,
                                password: 'password123',
                                confirmPassword: 'password123',
                                roleDisplay: u.roleDisplay,
                                email: u.email,
                                status: u.status,
                                remark: u.remark,
                              })
                            }
                            className="rounded p-1 text-blue-600 hover:bg-blue-50"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setUsers((prev) => prev.filter((item) => item.id !== u.id))}
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
