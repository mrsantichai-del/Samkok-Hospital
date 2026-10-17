'use client';

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Search, FileSpreadsheet, X } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';

interface AuditRow {
  id: number;
  createdAt: string;
  userFullName: string;
  roleDisplay: string;
  menuName: string;
  action: 'เพิ่ม' | 'นำเข้า' | 'อนุมัติ' | 'แก้ไข' | 'เข้าสู่ระบบ' | 'สร้าง';
  summary: string;
  status: string;
  oldData: string;
  newData: string;
}

const AUDIT_LOGS: AuditRow[] = [
  {
    id: 1,
    createdAt: '28/10/2569 10:15',
    userFullName: 'สมชาย ใจดี',
    roleDisplay: 'ผู้ดูแลระบบ',
    menuName: 'จัดการบัญชีผู้ใช้งาน',
    action: 'เพิ่ม',
    summary: 'เพิ่มบัญชีผู้ใช้งาน thanakrit',
    status: 'สำเร็จ',
    oldData: '-',
    newData: 'ชื่อผู้ใช้งาน: thanakrit\nบทบาท: เจ้าหน้าที่ฝ่ายการเงิน\nสถานะ: ใช้งาน',
  },
  {
    id: 2,
    createdAt: '28/10/2569 09:40',
    userFullName: 'สุภา มีสุข',
    roleDisplay: 'เจ้าหน้าที่ฝ่ายการเงิน',
    menuName: 'นำเข้าข้อมูลจาก Excel',
    action: 'นำเข้า',
    summary: 'นำเข้าข้อมูลเงินเดือนงวด ต.ค. 2569 จำนวน 150 รายการ',
    status: 'สำเร็จ',
    oldData: '-',
    newData: 'จำนวนรายการ : 150\nสำเร็จ : 150\nไม่สำเร็จ : 0',
  },
  {
    id: 3,
    createdAt: '27/10/2569 16:20',
    userFullName: 'อนุชา รักงาน',
    roleDisplay: 'ผู้อนุมัติ',
    menuName: 'อนุมัติงวดเงินเดือน',
    action: 'อนุมัติ',
    summary: 'อนุมัติงวดเงินเดือน เดือน ตุลาคม 2569',
    status: 'สำเร็จ',
    oldData: 'สถานะงวด: PENDING_APPROVAL',
    newData: 'สถานะงวด: APPROVED\nDigital Signature: SIG-SAMKOK-256910',
  },
  {
    id: 4,
    createdAt: '27/10/2569 14:10',
    userFullName: 'วิภาดา คนดี',
    roleDisplay: 'เจ้าหน้าที่ฝ่ายทรัพยากรบุคคล',
    menuName: 'ปรับปรุงเงินได้และรายการหัก',
    action: 'แก้ไข',
    summary: 'แก้ไขรายการเงินได้พิเศษ ของ กมลทิพย์ จันทรา',
    status: 'สำเร็จ',
    oldData: 'เงินได้พิเศษ: 1,500.00 บาท',
    newData: 'เงินได้พิเศษ: 2,000.00 บาท',
  },
  {
    id: 5,
    createdAt: '27/10/2569 11:05',
    userFullName: 'สมชาย ใจดี',
    roleDisplay: 'ผู้ดูแลระบบ',
    menuName: 'กำหนดบทบาทการใช้งาน',
    action: 'แก้ไข',
    summary: 'แก้ไขสิทธิ์เมนูของบทบาท แพทย์',
    status: 'สำเร็จ',
    oldData: 'ส่งออกรายงาน: ไม่อนุญาต',
    newData: 'ส่งออกรายงาน: อนุญาต',
  },
  {
    id: 6,
    createdAt: '26/10/2569 17:18',
    userFullName: 'ปัญญา ศรีศรี',
    roleDisplay: 'บุคลากรทั่วไป',
    menuName: 'เข้าสู่ระบบ',
    action: 'เข้าสู่ระบบ',
    summary: 'เข้าสู่ระบบสำเร็จ',
    status: 'สำเร็จ',
    oldData: '-',
    newData: 'IP Address: 192.168.1.50\nToken: JWT (RFC 7519)',
  },
  {
    id: 7,
    createdAt: '25/10/2569 15:42',
    userFullName: 'สุภา มีสุข',
    roleDisplay: 'เจ้าหน้าที่ฝ่ายการเงิน',
    menuName: 'จัดการงวดเงินเดือน',
    action: 'สร้าง',
    summary: 'สร้างงวดเงินเดือน เดือน พฤศจิกายน 2569',
    status: 'สำเร็จ',
    oldData: '-',
    newData: 'เดือน: พฤศจิกายน 2569\nสถานะ: DRAFT',
  },
  {
    id: 8,
    createdAt: '25/10/2569 14:21',
    userFullName: 'สมชาย ใจดี',
    roleDisplay: 'ผู้ดูแลระบบ',
    menuName: 'ค่าพื้นฐานและพารามิเตอร์',
    action: 'แก้ไข',
    summary: 'แก้ไขอัตราภาษีเงินได้บุคคลธรรมดา',
    status: 'สำเร็จ',
    oldData: 'อัตราเฉลี่ย: 4.5%',
    newData: 'อัตราเฉลี่ย: 5.0%',
  },
];

export default function AuditLogsPage() {
  const [selectedLog, setSelectedLog] = useState<AuditRow>(AUDIT_LOGS[1]);
  const [keyword, setKeyword] = useState('');
  const [actionFilter, setActionFilter] = useState('ทั้งหมด');

  const badgeStyle = (action: AuditRow['action']) => {
    switch (action) {
      case 'เพิ่ม':
      case 'สร้าง':
        return 'bg-emerald-100 text-emerald-700';
      case 'นำเข้า':
      case 'เข้าสู่ระบบ':
        return 'bg-sky-100 text-sky-700';
      case 'อนุมัติ':
        return 'bg-teal-100 text-teal-800';
      case 'แก้ไข':
        return 'bg-amber-100 text-amber-800';
    }
  };

  const filtered = AUDIT_LOGS.filter((l) => {
    if (actionFilter !== 'ทั้งหมด' && l.action !== actionFilter) return false;
    if (keyword) {
      const kw = keyword.toLowerCase();
      return (
        l.summary.toLowerCase().includes(kw) ||
        l.userFullName.toLowerCase().includes(kw) ||
        l.menuName.toLowerCase().includes(kw)
      );
    }
    return true;
  });

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filtered);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'AuditLogs');
    XLSX.writeFile(wb, 'บันทึกประวัติการใช้งาน_AuditLogs_รพ_สามโคก.xlsx');
    toast.success('ส่งออกรายการบันทึกการใช้งาน (AuditLog) เป็นไฟล์ Excel สำเร็จ');
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <Header breadcrumbs={['ตั้งค่าระบบ', 'บันทึกการใช้งานและการเปลี่ยนแปลงข้อมูล']} />

      <main className="flex-1 space-y-5 p-6">
        {/* ส่วนค้นหาบันทึกการใช้งาน (ตรงตามรูปที่ 3.74 - UC-05) */}
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 text-base font-bold text-slate-800">ค้นหาบันทึกการใช้งาน</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">ช่วงวันที่</label>
                <div className="flex items-center gap-2">
                  <Input defaultValue="01/10/2569" className="text-xs" />
                  <span className="text-slate-400">-</span>
                  <Input defaultValue="31/10/2569" className="text-xs" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">ประเภทการดำเนินการ</label>
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs"
                >
                  <option value="ทั้งหมด">ทั้งหมด</option>
                  <option value="เพิ่ม">เพิ่ม</option>
                  <option value="นำเข้า">นำเข้า</option>
                  <option value="อนุมัติ">อนุมัติ</option>
                  <option value="แก้ไข">แก้ไข</option>
                  <option value="เข้าสู่ระบบ">เข้าสู่ระบบ</option>
                  <option value="สร้าง">สร้าง</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">คำค้นหา</label>
                <Input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="ค้นหารายละเอียด..."
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">ผู้ใช้งาน</label>
                <select className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs">
                  <option>ทั้งหมด</option>
                  <option>สมชาย ใจดี</option>
                  <option>สุภา มีสุข</option>
                  <option>อนุชา รักงาน</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">โมดูล</label>
                <select className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs">
                  <option>ทั้งหมด</option>
                  <option>งวดเงินเดือน</option>
                  <option>ตั้งค่าระบบ</option>
                </select>
              </div>
              <div className="flex items-end justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setKeyword('');
                    setActionFilter('ทั้งหมด');
                  }}
                >
                  ล้างค่า
                </Button>
                <Button>
                  <Search className="h-4 w-4" /> ค้นหา
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ตารางรายการบันทึกการใช้งาน (ตรงตามรูปที่ 3.74) */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">รายการบันทึกการใช้งาน</h3>
              <Button variant="outline" size="sm" onClick={handleExportExcel}>
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> ส่งออก Excel
              </Button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">ลำดับ</th>
                    <th className="px-4 py-3">วันที่ / เวลา</th>
                    <th className="px-4 py-3">ผู้ใช้งาน</th>
                    <th className="px-4 py-3">บทบาท</th>
                    <th className="px-4 py-3">เมนู / ฟังก์ชัน</th>
                    <th className="px-4 py-3 text-center">ประเภทการดำเนินการ</th>
                    <th className="px-4 py-3">รายละเอียด</th>
                    <th className="px-4 py-3 text-center">สถานะ</th>
                    <th className="px-4 py-3 text-center">ดูรายละเอียด</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filtered.map((log) => (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className={`cursor-pointer ${
                        selectedLog.id === log.id ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="px-4 py-3">{log.id}</td>
                      <td className="px-4 py-3">{log.createdAt}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{log.userFullName}</td>
                      <td className="px-4 py-3 text-slate-600">{log.roleDisplay}</td>
                      <td className="px-4 py-3 text-slate-600">{log.menuName}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${badgeStyle(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{log.summary}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                          {log.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Search className="mx-auto h-3.5 w-3.5 text-blue-600" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* แผงแสดงรายละเอียดการดำเนินการ (oldValue vs newValue) ด้านล่าง (ตรงตามรูปที่ 3.74) */}
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-5 text-xs">
              <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="font-bold text-slate-800">รายละเอียดการดำเนินการ (Audit Trail / PDPA)</h4>
                <X className="h-4 w-4 text-slate-400 cursor-pointer" />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="space-y-1.5">
                  <div>
                    <span className="text-slate-500">วันที่ / เวลา:</span>{' '}
                    <strong className="text-slate-800">{selectedLog.createdAt}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">ผู้ใช้งาน:</span>{' '}
                    <strong className="text-slate-800">{selectedLog.userFullName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">บทบาท:</span>{' '}
                    <strong className="text-slate-800">{selectedLog.roleDisplay}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">เมนู / ฟังก์ชัน:</span>{' '}
                    <strong className="text-slate-800">{selectedLog.menuName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">ประเภทการดำเนินการ:</span>{' '}
                    <strong className="text-blue-700">{selectedLog.action}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">สถานะ:</span>{' '}
                    <strong className="text-emerald-600">{selectedLog.status}</strong>
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-slate-600 mb-1">รายละเอียด</p>
                  <div className="rounded-lg border border-slate-200 bg-white p-3 text-slate-700 min-h-[76px]">
                    {selectedLog.summary}
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-slate-600 mb-1">ข้อมูลก่อนการเปลี่ยนแปลง (oldValue)</p>
                  <pre className="rounded-lg border border-slate-200 bg-white p-3 font-sans text-slate-600 min-h-[76px] whitespace-pre-wrap">
                    {selectedLog.oldData}
                  </pre>
                </div>

                <div>
                  <p className="font-semibold text-slate-600 mb-1">ข้อมูลหลังการเปลี่ยนแปลง (newValue)</p>
                  <pre className="rounded-lg border border-slate-200 bg-white p-3 font-sans text-slate-800 min-h-[76px] whitespace-pre-wrap">
                    {selectedLog.newData}
                  </pre>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
