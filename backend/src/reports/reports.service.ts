import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import PDFDocument = require('pdfkit');
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * UC-19: ตรวจสอบรายงานสรุปเงินเดือนรายงวด และแดชบอร์ดผู้บริหาร (Sequence Diagram รูปที่ 3.27, รูปที่ 3.80, 3.85)
   * GET /reports/payroll-summary -> payrollSummary(periodId)
   */
  async payrollSummary(periodId?: string) {
    return {
      kpis: {
        totalEmployees: 428,
        totalPersonnelCost: 12845000,
        totalBaseSalary: 10250000,
        totalExtraIncome: 1730000,
        totalDeduction: 1135000,
        remainingBudget: 2450000,
      },
      monthlyTrends: [
        { month: 'เม.ย. 2567', salary: 9600000, allowance: 1520000, deduction: 1050000 },
        { month: 'พ.ค. 2567', salary: 9750000, allowance: 1580000, deduction: 1080000 },
        { month: 'มิ.ย. 2567', salary: 9900000, allowance: 1620000, deduction: 1090000 },
        { month: 'ก.ค. 2567', salary: 10050000, allowance: 1650000, deduction: 1100000 },
        { month: 'ส.ค. 2567', salary: 10120000, allowance: 1690000, deduction: 1120000 },
        { month: 'ก.ย. 2567', salary: 10250000, allowance: 1730000, deduction: 1135000 },
      ],
      categoryShare: [
        { name: 'เงินเดือน', percent: 79.8, amount: 10250000, color: '#2563eb' },
        { name: 'OT/เวร', percent: 8.2, amount: 1050000, color: '#0ea5e9' },
        { name: 'วิชาชีพ', percent: 5.6, amount: 720000, color: '#10b981' },
        { name: 'สวัสดิการ', percent: 3.6, amount: 460000, color: '#f59e0b' },
        { name: 'รายการหัก', percent: 2.8, amount: 365000, color: '#ef4444' },
      ],
      departmentBarChart: [
        { department: 'กลุ่มการพยาบาล', amount: 4750000 },
        { department: 'เภสัชกรรม', amount: 2150000 },
        { department: 'เวชระเบียน', amount: 1850000 },
        { department: 'บริหารทั่วไป', amount: 1650000 },
        { department: 'ห้องปฏิบัติการ', amount: 1420000 },
      ],
      periodStatusCards: {
        draft: { count: 12, amount: 3210400 },
        pendingApproval: { count: 5, amount: 1880600 },
        approved: { count: 23, amount: 6950000 },
        returned: { count: 2, amount: 404000 },
      },
      departmentTable: [
        {
          department: 'กลุ่มการพยาบาล',
          employees: 136,
          baseSalary: 4210000,
          extraIncome: 980000,
          deduction: 430000,
          netPay: 4760000,
          sharePercent: 37.0,
          status: 'APPROVED',
        },
        {
          department: 'เภสัชกรรม',
          employees: 52,
          baseSalary: 1750000,
          extraIncome: 280000,
          deduction: 180000,
          netPay: 1850000,
          sharePercent: 17.2,
          status: 'APPROVED',
        },
        {
          department: 'เวชระเบียน',
          employees: 48,
          baseSalary: 1480000,
          extraIncome: 210000,
          deduction: 150000,
          netPay: 1540000,
          sharePercent: 12.6,
          status: 'PENDING_APPROVAL',
        },
        {
          department: 'บริหารทั่วไป',
          employees: 78,
          baseSalary: 1550000,
          extraIncome: 140000,
          deduction: 195000,
          netPay: 1495000,
          sharePercent: 14.4,
          status: 'APPROVED',
        },
        {
          department: 'ห้องปฏิบัติการ',
          employees: 114,
          baseSalary: 1260000,
          extraIncome: 120000,
          deduction: 180000,
          netPay: 1200000,
          sharePercent: 18.8,
          status: 'APPROVED',
        },
      ],
      insights: [
        {
          title: 'ค่าใช้จ่ายสูงสุดอยู่ที่กลุ่มการพยาบาล',
          detail: 'คิดเป็น 37.0% ของค่าใช้จ่ายรวมทุกหน่วยงาน จำนวน 4,760,000 บาท',
          type: 'info',
        },
        {
          title: 'งบประมาณคงเหลือ 16.0%',
          detail: 'จากงบประมาณทั้งหมด 15,295,000 บาท คงเหลือ 2,450,000 บาท',
          type: 'success',
        },
        {
          title: 'ค่า OT เพิ่มขึ้น 8% จากเดือนก่อน',
          detail: 'จาก 972,000 บาท เป็น 1,050,000 บาท เนื่องจากเพิ่มเวรบริการฉุกเฉิน',
          type: 'warning',
        },
      ],
    };
  }

  /**
   * UC-20: ตรวจสอบรายงานสรุปค่าใช้จ่ายด้านบุคลากรตามหน่วยงาน (Sequence Diagram รูปที่ 3.28, รูปที่ 3.81)
   * GET /reports/personnel-cost -> personnelCost(filter)
   */
  async personnelCost(filter?: { year?: string; month?: string; department?: string }) {
    const departments = [
      {
        order: 1,
        departmentName: 'ฝ่ายการเงิน',
        employeeCount: 28,
        grossPay: 812450.0,
        totalDeduction: 132600.0,
        netPay: 679850.0,
      },
      {
        order: 2,
        departmentName: 'ฝ่ายทรัพยากรบุคคล',
        employeeCount: 12,
        grossPay: 358200.0,
        totalDeduction: 61480.0,
        netPay: 296720.0,
      },
      {
        order: 3,
        departmentName: 'ฝ่ายการแพทย์',
        employeeCount: 45,
        grossPay: 1285600.0,
        totalDeduction: 238750.0,
        netPay: 1046850.0,
      },
      {
        order: 4,
        departmentName: 'ฝ่ายพยาบาล',
        employeeCount: 32,
        grossPay: 754320.0,
        totalDeduction: 130900.0,
        netPay: 623420.0,
      },
      {
        order: 5,
        departmentName: 'ฝ่ายสนับสนุนบริการ',
        employeeCount: 18,
        grossPay: 512430.0,
        totalDeduction: 92410.0,
        netPay: 420020.0,
      },
      {
        order: 6,
        departmentName: 'ฝ่ายบริหารทั่วไป',
        employeeCount: 10,
        grossPay: 356600.0,
        totalDeduction: 62180.0,
        netPay: 294420.0,
      },
      {
        order: 7,
        departmentName: 'ฝ่ายเภสัชกรรม',
        employeeCount: 5,
        grossPay: 146000.0,
        totalDeduction: 24500.0,
        netPay: 121500.0,
      },
    ];

    const filtered =
      filter?.department && filter.department !== 'ALL'
        ? departments.filter((d) => d.departmentName === filter.department)
        : departments;

    return {
      summary: {
        totalEmployees: 150,
        totalGross: 4325600.0,
        totalDeduction: 754320.0,
        totalNet: 3571280.0,
      },
      departments: filtered,
    };
  }

  /**
   * UC-21: ส่งออกรายงานในรูปแบบ PDF หรือ Excel (Sequence Diagram รูปที่ 3.29)
   * POST /reports/export -> exportReport(filter, format)
   */
  async exportExcelReport(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Payroll_Report_Samkok');

    sheet.columns = [
      { header: 'ลำดับ', key: 'order', width: 10 },
      { header: 'หน่วยงาน', key: 'departmentName', width: 30 },
      { header: 'จำนวนพนักงาน (คน)', key: 'employeeCount', width: 20 },
      { header: 'เงินได้รวม (บาท)', key: 'grossPay', width: 22 },
      { header: 'รายการหักรวม (บาท)', key: 'totalDeduction', width: 22 },
      { header: 'รับสุทธิ (บาท)', key: 'netPay', width: 22 },
    ];

    const data = await this.personnelCost();
    for (const row of data.departments) {
      sheet.addRow(row);
    }

    sheet.addRow({
      order: 'รวมทั้งสิ้น',
      departmentName: '',
      employeeCount: data.summary.totalEmployees,
      grossPay: data.summary.totalGross,
      totalDeduction: data.summary.totalDeduction,
      netPay: data.summary.totalNet,
    });

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer);
  }

  async exportPdfReport(): Promise<Buffer> {
    const data = await this.personnelCost();
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      doc.fontSize(16).fillColor('#0f172a').text('Samkok Hospital - Personnel Cost Summary Report', { align: 'center' });
      doc.fontSize(11).fillColor('#475569').text('Fiscal Year 2569 | Period: October 2569', { align: 'center' });
      doc.moveDown(1.5);

      let y = 120;
      doc.rect(40, y, 515, 24).fill('#1e3a8a');
      doc.fillColor('#ffffff').fontSize(10);
      doc.text('No.', 48, y + 7);
      doc.text('Department', 85, y + 7);
      doc.text('Staff', 240, y + 7);
      doc.text('Gross Pay (THB)', 300, y + 7);
      doc.text('Deduction (THB)', 395, y + 7);
      doc.text('Net Pay (THB)', 480, y + 7);

      y += 28;
      doc.fillColor('#0f172a');
      for (const d of data.departments) {
        doc.text(String(d.order), 48, y);
        doc.text(d.departmentName, 85, y);
        doc.text(String(d.employeeCount), 245, y);
        doc.text(d.grossPay.toLocaleString('en-US', { minimumFractionDigits: 2 }), 300, y);
        doc.text(d.totalDeduction.toLocaleString('en-US', { minimumFractionDigits: 2 }), 395, y);
        doc.text(d.netPay.toLocaleString('en-US', { minimumFractionDigits: 2 }), 480, y);
        y += 22;
      }

      y += 10;
      doc.rect(40, y, 515, 26).fill('#eff6ff');
      doc.fillColor('#1d4ed8').fontSize(11);
      doc.text('TOTAL', 85, y + 7);
      doc.text(String(data.summary.totalEmployees), 245, y + 7);
      doc.text(data.summary.totalGross.toLocaleString('en-US', { minimumFractionDigits: 2 }), 300, y + 7);
      doc.text(data.summary.totalDeduction.toLocaleString('en-US', { minimumFractionDigits: 2 }), 395, y + 7);
      doc.text(data.summary.totalNet.toLocaleString('en-US', { minimumFractionDigits: 2 }), 480, y + 7);

      doc.end();
    });
  }
}
