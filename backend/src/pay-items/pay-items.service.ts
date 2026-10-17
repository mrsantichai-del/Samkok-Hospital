import { Injectable, BadRequestException } from '@nestjs/common';
import { PayItemCategory } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { demoStore } from '../database/demo-store';

@Injectable()
export class PayItemService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(type?: string) {
    if (this.prisma.isConnected) {
      return this.prisma.payItemType.findMany({
        where:
          type && type !== 'ALL'
            ? { type: type === 'DEDUCTION' ? PayItemCategory.DEDUCTION : PayItemCategory.INCOME }
            : undefined,
        orderBy: { code: 'asc' },
      });
    }
    return demoStore.payItems.filter((item) => (!type || type === 'ALL' ? true : item.type === type));
  }

  /**
   * UC-07: จัดการข้อมูลพื้นฐานเงินเดือนและค่าตอบแทน (Sequence Diagram รูปที่ 3.15)
   * savePayItemType(dto) -> ตรวจสอบ INCOME / DEDUCTION -> อ่าน SystemParameter -> INSERT / UPDATE PayItemType -> INSERT AuditLog
   */
  async savePayItemType(dto: any, actorUserId?: string) {
    if (!dto.code || !dto.name) {
      throw new BadRequestException('กรุณาระบุรหัสรายการและชื่อรายการ');
    }

    const category =
      dto.type === 'DEDUCTION' ? PayItemCategory.DEDUCTION : PayItemCategory.INCOME;

    if (this.prisma.isConnected) {
      const existing = await this.prisma.payItemType.findUnique({ where: { code: dto.code } });
      const saved = await this.prisma.payItemType.upsert({
        where: { code: dto.code },
        update: {
          name: dto.name,
          type: category,
          subCategory: dto.subCategory || 'เงินได้ประจำ',
          calcMethod: dto.calcMethod || 'จำนวนเงินคงที่',
          defaultFormula: dto.defaultFormula || null,
          includeTax: dto.includeTax !== undefined ? Boolean(dto.includeTax) : true,
          includeSocialSecurity:
            dto.includeSocialSecurity !== undefined ? Boolean(dto.includeSocialSecurity) : false,
          isActive: dto.isActive !== undefined ? Boolean(dto.isActive) : true,
          remark: dto.remark || null,
        },
        create: {
          code: dto.code,
          name: dto.name,
          type: category,
          subCategory: dto.subCategory || 'เงินได้ประจำ',
          calcMethod: dto.calcMethod || 'จำนวนเงินคงที่',
          defaultFormula: dto.defaultFormula || null,
          includeTax: dto.includeTax !== undefined ? Boolean(dto.includeTax) : true,
          includeSocialSecurity:
            dto.includeSocialSecurity !== undefined ? Boolean(dto.includeSocialSecurity) : false,
          isActive: dto.isActive !== undefined ? Boolean(dto.isActive) : true,
          remark: dto.remark || null,
        },
      });

      await this.prisma.auditLog.create({
        data: {
          userId: actorUserId || null,
          action: existing ? 'UPDATE' : 'CREATE',
          menuName: 'ประเภทเงินได้และรายการหัก',
          tableName: 'PayItemType',
          recordId: saved.id,
          summary: `${existing ? 'แก้ไข' : 'เพิ่ม'}ประเภท${category === 'INCOME' ? 'เงินได้' : 'รายการหัก'} ${saved.code} ${saved.name}`,
          status: 'สำเร็จ',
          oldValue: existing ? { name: existing.name } : null,
          newValue: { code: saved.code, name: saved.name, type: saved.type },
        },
      });

      return this.findAll();
    }

    const idx = demoStore.payItems.findIndex((i) => i.code === dto.code || i.id === dto.id);
    const payload = {
      id: dto.id || `pi-${Date.now()}`,
      code: dto.code,
      name: dto.name,
      type: dto.type || 'INCOME',
      subCategory: dto.subCategory || 'เงินได้ประจำ',
      calcMethod: dto.calcMethod || 'จำนวนเงินคงที่',
      includeTax: dto.includeTax !== undefined ? Boolean(dto.includeTax) : true,
      includeSocialSecurity:
        dto.includeSocialSecurity !== undefined ? Boolean(dto.includeSocialSecurity) : false,
      isActive: dto.isActive !== undefined ? Boolean(dto.isActive) : true,
      remark: dto.remark || '',
    };

    if (idx !== -1) {
      demoStore.payItems[idx] = payload;
    } else {
      demoStore.payItems.push(payload);
    }
    return demoStore.payItems;
  }
}
