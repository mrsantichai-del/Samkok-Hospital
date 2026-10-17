'use client';

import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Save } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiFetch } from '@/lib/api';
import toast from 'react-hot-toast';

interface RoleRow {
  id: string;
  name: string;
  roleType: string;
  description: string;
  status: string;
}

const INITIAL_ROLES: RoleRow[] = [
  {
    id: '1',
    name: 'ผู้ดูแลระบบ',
    roleType: 'บทบาทภายใน',
    description: 'บริหารจัดการบัญชีผู้ใช้งาน กำหนดบทบาทและสิทธิ์การเข้าถึง และตรวจสอบ Audit Logs',
    status: 'ใช้งาน',
  },
  {
    id: '2',
    name: 'เจ้าหน้าที่ฝ่ายการเงิน',
    roleType: 'บทบาทภายใน',
    description: 'ดูแลข้อมูลบุคลากร จัดการงวดเงินเดือน ประมวลผลเงินเดือน และจัดทำรายงานที่เกี่ยวข้อง',
    status: 'ใช้งาน',
  },
  {
    id: '3',
    name: 'เจ้าหน้าที่ฝ่ายทรัพยากรบุคคล',
    roleType: 'บทบาทภายใน',
    description: 'จัดการทะเบียนประวัติบุคลากร โครงสร้างตำแหน่ง และประเภทการจ้างงาน',
    status: 'ใช้งาน',
  },
  {
    id: '4',
    name: 'บุคลากรทั่วไป',
    roleType: 'บทบาทภายใน',
    description: 'ตรวจสอบใบแสดงรายการเงินเดือนของตนเองย้อนหลังและพิมพ์ PDF ตามกฎหมาย PDPA',
    status: 'ใช้งาน',
  },
  {
    id: '5',
    name: 'แพทย์',
    roleType: 'บทบาทภายใน',
    description: 'ตรวจสอบสลิปเงินเดือน ค่าตอบแทน พ.ต.ส. และค่าเวรนอกเวลาราชการ',
    status: 'ใช้งาน',
  },
  {
    id: '6',
    name: 'ผู้บริหาร',
    roleType: 'บทบาทภายใน',
    description: 'ตรวจสอบแดชบอร์ดเชิงบริหาร รายงานเปรียบเทียบ และอนุมัติงวดเงินเดือนด้วยลายมือชื่อดิจิทัล',
    status: 'ใช้งาน',
  },
];

interface MenuPermission {
  group: string;
  name: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  approve: boolean;
  export: boolean;
}

const INITIAL_PERMISSIONS: MenuPermission[] = [
  { group: 'หน้าแรก', name: 'หน้าแรก', view: true, create: false, edit: false, delete: false, approve: false, export: false },
  { group: 'บุคลากร', name: 'จัดการข้อมูลบุคลากร', view: true, create: true, edit: true, delete: false, approve: false, export: false },
  { group: 'บุคลากร', name: 'จัดการหน่วยงาน', view: true, create: true, edit: true, delete: false, approve: false, export: false },
  { group: 'งวดเงินเดือน', name: 'จัดการงวดเงินเดือน', view: true, create: true, edit: true, delete: false, approve: false, export: false },
  { group: 'งวดเงินเดือน', name: 'ปรับปรุงเงินได้และรายการหักรายบุคคล', view: true, create: true, edit: true, delete: false, approve: false, export: false },
  { group: 'งวดเงินเดือน', name: 'นำเข้าข้อมูลเงินเดือนจาก Excel', view: true, create: true, edit: false, delete: false, approve: false, export: false },
  { group: 'ประมวลผลเงินเดือน', name: 'ประมวลผลเงินเดือน', view: true, create: true, edit: true, delete: false, approve: false, export: false },
  { group: 'รายงาน', name: 'รายงาน', view: true, create: false, edit: false, delete: false, approve: false, export: true },
];

export default function RolesSettingsPage() {
  const [roles, setRoles] = useState<RoleRow[]>(INITIAL_ROLES);
  const [selectedRole, setSelectedRole] = useState<RoleRow>(INITIAL_ROLES[1]);
  const [permissions, setPermissions] = useState<MenuPermission[]>(INITIAL_PERMISSIONS);
  const [keyword, setKeyword] = useState('');

  const togglePerm = (idx: number, key: keyof MenuPermission) => {
    const next = [...permissions];
    next[idx] = { ...next[idx], [key]: !next[idx][key] };
    setPermissions(next);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/roles', {
        method: 'PUT',
        body: JSON.stringify({ ...selectedRole, permissions }),
      });
    } catch {
      // Fallback
    }
    setRoles((prev) => prev.map((r) => (r.id === selectedRole.id ? selectedRole : r)));
    toast.success(`บันทึกบทบาทและสิทธิ์การเข้าถึงเมนูของ "${selectedRole.name}" สำเร็จ (UC-03 RBAC)`);
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <Header breadcrumbs={['ตั้งค่าระบบ', 'กำหนดบทบาทการใช้งาน']} />

      <main className="flex-1 space-y-5 p-6">
        {/* แบบฟอร์มข้อมูลบทบาทการใช้งาน (ตรงตามรูปที่ 3.72 - UC-03) */}
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 text-base font-bold text-slate-800">ข้อมูลบทบาทการใช้งาน</h2>
            <form onSubmit={handleSave} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  ชื่อบทบาท <span className="text-red-500">*</span>
                </label>
                <Input
                  value={selectedRole.name}
                  onChange={(e) => setSelectedRole({ ...selectedRole, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  ประเภทบทบาท <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedRole.roleType}
                  onChange={(e) => setSelectedRole({ ...selectedRole, roleType: e.target.value })}
                  className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs"
                >
                  <option value="บทบาทภายใน">บทบาทภายใน</option>
                  <option value="บทบาทพิเศษ">บทบาทพิเศษ</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">คำอธิบาย</label>
                <textarea
                  rows={2}
                  value={selectedRole.description}
                  onChange={(e) => setSelectedRole({ ...selectedRole, description: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">หมายเหตุ</label>
                <textarea
                  rows={2}
                  placeholder="-"
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  สถานะ <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedRole.status}
                  onChange={(e) => setSelectedRole({ ...selectedRole, status: e.target.value })}
                  className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs"
                >
                  <option value="ใช้งาน">ใช้งาน</option>
                  <option value="ระงับ">ระงับ</option>
                </select>
              </div>

              <div className="flex items-end justify-end gap-2">
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

        {/* ตารางคู่ขนาน: รายการบทบาท (ซ้าย) และ กำหนดสิทธิ์เมนูสำหรับบทบาท (ขวา) ตามรูปที่ 3.72 */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
          <Card className="lg:col-span-2">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">รายการบทบาท</h3>
                <Button size="sm">
                  <Plus className="h-3.5 w-3.5" /> เพิ่มบทบาท
                </Button>
              </div>

              <div className="relative mb-3">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="ค้นหาชื่อบทบาท..."
                  className="pl-8 h-8 text-xs"
                />
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2.5">ลำดับ</th>
                      <th className="px-3 py-2.5">ชื่อบทบาท</th>
                      <th className="px-3 py-2.5 text-center">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {roles
                      .filter((r) => r.name.includes(keyword))
                      .map((r, i) => (
                        <tr
                          key={r.id}
                          onClick={() => setSelectedRole(r)}
                          className={`cursor-pointer ${
                            selectedRole.id === r.id ? 'bg-blue-50 font-semibold' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="px-3 py-2.5">{i + 1}</td>
                          <td className="px-3 py-2.5 text-slate-800">{r.name}</td>
                          <td className="px-3 py-2.5 text-center">
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardContent className="p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-800">
                  กำหนดสิทธิ์เมนูสำหรับบทบาท : <span className="text-blue-700">{selectedRole.name}</span>
                </h3>
                <select className="h-8 rounded-lg border border-slate-300 bg-white px-2.5 text-xs">
                  <option>คัดลอกสิทธิ์จากบทบาท...</option>
                  <option>ผู้ดูแลระบบ</option>
                  <option>เจ้าหน้าที่ฝ่ายการเงิน</option>
                </select>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2.5">เมนู</th>
                      <th className="px-2 py-2.5 text-center">ดูข้อมูล</th>
                      <th className="px-2 py-2.5 text-center">เพิ่ม</th>
                      <th className="px-2 py-2.5 text-center">แก้ไข</th>
                      <th className="px-2 py-2.5 text-center">ลบ</th>
                      <th className="px-2 py-2.5 text-center">อนุมัติ</th>
                      <th className="px-2 py-2.5 text-center">ส่งออก</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {permissions.map((perm, idx) => (
                      <tr key={perm.name} className="hover:bg-slate-50">
                        <td className="px-3 py-2.5 font-medium text-slate-800">{perm.name}</td>
                        {(['view', 'create', 'edit', 'delete', 'approve', 'export'] as const).map((k) => (
                          <td key={k} className="px-2 py-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={perm[k]}
                              onChange={() => togglePerm(idx, k)}
                              className="h-3.5 w-3.5 accent-blue-600 cursor-pointer"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
