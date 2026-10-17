import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { demoStore } from '../database/demo-store';
import { validateThaiCitizenId } from '../common/utils/modulo11.util';

@Injectable()
export class EmployeeService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filter?: {
    keyword?: string;
    department?: string;
    employeeType?: string;
    status?: string;
  }) {
    if (this.prisma.isConnected) {
      const employees = await this.prisma.employee.findMany({
        include: {
          department: true,
          position: true,
          employeeType: true,
          bankAccounts: true,
        },
        orderBy: { employeeCode: 'asc' },
      });

      return employees
        .map((emp) => ({
          id: emp.id,
          employeeCode: emp.employeeCode,
          titleName: emp.titleName,
          firstName: emp.firstName,
          lastName: emp.lastName,
          fullName: `${emp.titleName}${emp.firstName} ${emp.lastName}`,
          citizenId: emp.citizenId,
          birthDate: emp.birthDate ? emp.birthDate.toISOString().slice(0, 10) : '',
          gender: emp.gender || 'ชาย',
          phone: emp.phone || '',
          email: emp.email || '',
          hireDate: emp.hireDate.toISOString().slice(0, 10),
          employmentStatus: emp.employmentStatus,
          baseSalary: Number(emp.baseSalary),
          levelName: emp.levelName || 'ชำนาญการ',
          departmentId: emp.departmentId,
          departmentName: emp.department.name,
          positionId: emp.positionId,
          positionName: emp.position.name,
          employeeTypeId: emp.employeeTypeId,
          employeeTypeName: emp.employeeType.name,
          bankName: emp.bankAccounts[0]?.bankName || 'กรุงไทย',
          accountNo: emp.bankAccounts[0]?.accountNo || '123-4-56789-0',
        }))
        .filter((emp) => {
          if (filter?.department && filter.department !== 'ALL' && emp.departmentName !== filter.department)
            return false;
          if (filter?.employeeType && filter.employeeType !== 'ALL' && emp.employeeTypeName !== filter.employeeType)
            return false;
          if (filter?.status && filter.status !== 'ALL' && emp.employmentStatus !== filter.status)
            return false;
          if (filter?.keyword) {
            const kw = filter.keyword.toLowerCase();
            return (
              emp.employeeCode.toLowerCase().includes(kw) ||
              emp.fullName.toLowerCase().includes(kw) ||
              emp.citizenId.includes(kw)
            );
          }
          return true;
        });
    }

    return demoStore.employees
      .map((emp) => ({
        ...emp,
        fullName: `${emp.titleName}${emp.firstName} ${emp.lastName}`,
      }))
      .filter((emp) => {
        if (filter?.department && filter.department !== 'ALL' && emp.departmentName !== filter.department)
          return false;
        if (filter?.employeeType && filter.employeeType !== 'ALL' && emp.employeeTypeName !== filter.employeeType)
          return false;
        if (filter?.status && filter.status !== 'ALL' && emp.employmentStatus !== filter.status)
          return false;
        if (filter?.keyword) {
          const kw = filter.keyword.toLowerCase();
          return (
            emp.employeeCode.toLowerCase().includes(kw) ||
            emp.fullName.toLowerCase().includes(kw) ||
            emp.citizenId.includes(kw)
          );
        }
        return true;
      });
  }

  /**
   * UC-06: จัดการข้อมูลบุคลากร (Sequence Diagram รูปที่ 3.14)
   * saveEmployee(dto) -> ตรวจสอบ Modulo 11 Check Digit -> ตรวจสอบ Department / Position / EmployeeType
   * -> INSERT / UPDATE Employee -> INSERT AuditLog
   */
  async saveEmployee(dto: any, actorUserId?: string) {
    const cleanedCitizenId = (dto.citizenId || '').replace(/[^0-9]/g, '');
    if (!validateThaiCitizenId(cleanedCitizenId)) {
      throw new BadRequestException(
        'เลขประจำตัวประชาชน 13 หลักไม่ถูกต้องตามหลัก Modulo 11 Check Digit Algorithm (หัวข้อ 2.1.3.4)',
      );
    }

    if (this.prisma.isConnected) {
      let dept = await this.prisma.department.findFirst({
        where: { OR: [{ id: dto.departmentId || '' }, { name: dto.departmentName || 'ฝ่ายการเงิน' }] },
      });
      if (!dept) {
        dept = await this.prisma.department.findFirst();
      }

      let pos = await this.prisma.position.findFirst({
        where: { OR: [{ id: dto.positionId || '' }, { name: dto.positionName || 'พยาบาลวิชาชีพ' }] },
      });
      if (!pos) {
        pos = await this.prisma.position.findFirst();
      }

      let empType = await this.prisma.employeeType.findFirst({
        where: { OR: [{ id: dto.employeeTypeId || '' }, { name: dto.employeeTypeName || 'ข้าราชการ' }] },
      });
      if (!empType) {
        empType = await this.prisma.employeeType.findFirst();
      }

      const existing = await this.prisma.employee.findUnique({
        where: { employeeCode: dto.employeeCode },
      });

      const saved = await this.prisma.employee.upsert({
        where: { employeeCode: dto.employeeCode },
        update: {
          titleName: dto.titleName || 'นาย',
          firstName: dto.firstName,
          lastName: dto.lastName,
          citizenId: cleanedCitizenId,
          birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
          gender: dto.gender || 'ชาย',
          phone: dto.phone || null,
          email: dto.email || null,
          hireDate: dto.hireDate ? new Date(dto.hireDate) : new Date(),
          employmentStatus: dto.employmentStatus || 'ACTIVE',
          baseSalary: Number(dto.baseSalary || 0),
          departmentId: dept!.id,
          positionId: pos!.id,
          employeeTypeId: empType!.id,
        },
        create: {
          employeeCode: dto.employeeCode,
          titleName: dto.titleName || 'นาย',
          firstName: dto.firstName,
          lastName: dto.lastName,
          citizenId: cleanedCitizenId,
          birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
          gender: dto.gender || 'ชาย',
          phone: dto.phone || null,
          email: dto.email || null,
          hireDate: dto.hireDate ? new Date(dto.hireDate) : new Date(),
          employmentStatus: dto.employmentStatus || 'ACTIVE',
          baseSalary: Number(dto.baseSalary || 0),
          departmentId: dept!.id,
          positionId: pos!.id,
          employeeTypeId: empType!.id,
        },
      });

      if (dto.accountNo) {
        await this.prisma.employeeBankAccount.deleteMany({ where: { employeeId: saved.id } });
        await this.prisma.employeeBankAccount.create({
          data: {
            employeeId: saved.id,
            bankName: dto.bankName || 'กรุงไทย',
            accountNo: dto.accountNo,
            accountName: `${saved.titleName}${saved.firstName} ${saved.lastName}`,
            isPrimary: true,
          },
        });
      }

      await this.prisma.auditLog.create({
        data: {
          userId: actorUserId || null,
          action: existing ? 'UPDATE' : 'CREATE',
          menuName: 'จัดการข้อมูลบุคลากร',
          tableName: 'Employee',
          recordId: saved.id,
          summary: `${existing ? 'แก้ไข' : 'เพิ่ม'}ข้อมูลบุคลากร ${saved.employeeCode} ${saved.titleName}${saved.firstName} ${saved.lastName}`,
          status: 'สำเร็จ',
          oldValue: existing ? { baseSalary: Number(existing.baseSalary) } : null,
          newValue: { employeeCode: saved.employeeCode, baseSalary: Number(saved.baseSalary) },
        },
      });

      return this.findAll();
    }

    const idx = demoStore.employees.findIndex(
      (e) => e.employeeCode === dto.employeeCode || e.id === dto.id,
    );
    const payload = {
      id: dto.id || `emp-${Date.now()}`,
      employeeCode: dto.employeeCode,
      titleName: dto.titleName || 'นาย',
      firstName: dto.firstName,
      lastName: dto.lastName,
      citizenId: cleanedCitizenId,
      birthDate: dto.birthDate || '1992-05-15',
      gender: dto.gender || 'ชาย',
      phone: dto.phone || '0812345678',
      email: dto.email || 'staff@samkokhosp.go.th',
      hireDate: dto.hireDate || '2017-04-01',
      employmentStatus: dto.employmentStatus || 'ACTIVE',
      baseSalary: Number(dto.baseSalary || 25000),
      levelName: dto.levelName || 'ชำนาญการ',
      departmentId: dto.departmentId || 'dept-4',
      departmentName: dto.departmentName || 'กลุ่มงานการพยาบาล',
      positionId: dto.positionId || 'pos-4',
      positionName: dto.positionName || 'พยาบาลวิชาชีพ',
      employeeTypeId: dto.employeeTypeId || 'et-1',
      employeeTypeName: dto.employeeTypeName || 'ข้าราชการ',
      bankName: dto.bankName || 'กรุงไทย',
      accountNo: dto.accountNo || '123-4-56789-0',
    };

    if (idx !== -1) {
      demoStore.employees[idx] = payload;
    } else {
      demoStore.employees.unshift(payload);
    }

    return this.findAll();
  }
}
