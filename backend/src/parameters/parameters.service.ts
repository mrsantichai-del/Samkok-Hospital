import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { demoStore } from '../database/demo-store';

@Injectable()
export class ParameterService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(category?: string) {
    if (this.prisma.isConnected) {
      return this.prisma.systemParameter.findMany({
        where: category && category !== 'ALL' ? { category } : undefined,
        include: { updatedBy: true },
        orderBy: { code: 'asc' },
      });
    }
    return demoStore.parameters.filter((p) => (!category || category === 'ALL' ? true : p.category === category));
  }

  /**
   * UC-04: การจัดการค่าพื้นฐานและพารามิเตอร์ (Sequence Diagram รูปที่ 3.12)
   * saveParameter(dto) -> ตรวจสอบ code / value / effectiveDate -> INSERT / UPDATE SystemParameter -> INSERT AuditLog
   */
  async saveParameter(dto: any, actorUserId?: string) {
    if (!dto.code || dto.value === undefined) {
      throw new BadRequestException('กรุณาระบุรหัสพารามิเตอร์ (code) และค่าพารามิเตอร์ (value)');
    }

    if (this.prisma.isConnected) {
      const existing = await this.prisma.systemParameter.findUnique({ where: { code: dto.code } });
      const saved = await this.prisma.systemParameter.upsert({
        where: { code: dto.code },
        update: {
          name: dto.name || existing?.name || dto.code,
          category: dto.category || existing?.category || 'GENERAL',
          value: String(dto.value),
          effectiveDate: dto.effectiveDate ? new Date(dto.effectiveDate) : new Date(),
          updatedById: actorUserId || null,
          isActive: dto.isActive !== undefined ? Boolean(dto.isActive) : true,
          remark: dto.remark ?? existing?.remark,
        },
        create: {
          code: dto.code,
          name: dto.name || dto.code,
          category: dto.category || 'GENERAL',
          value: String(dto.value),
          effectiveDate: dto.effectiveDate ? new Date(dto.effectiveDate) : new Date(),
          updatedById: actorUserId || null,
          isActive: dto.isActive !== undefined ? Boolean(dto.isActive) : true,
          remark: dto.remark || null,
        },
      });

      await this.prisma.auditLog.create({
        data: {
          userId: actorUserId || null,
          action: existing ? 'UPDATE' : 'CREATE',
          menuName: 'ค่าพื้นฐานและพารามิเตอร์',
          tableName: 'SystemParameter',
          recordId: saved.id,
          summary: `${existing ? 'แก้ไข' : 'เพิ่ม'}ค่าพารามิเตอร์ ${saved.name} (${saved.code})`,
          status: 'สำเร็จ',
          oldValue: existing ? { value: existing.value } : null,
          newValue: { code: saved.code, value: saved.value },
        },
      });

      return this.findAll();
    }

    const idx = demoStore.parameters.findIndex((p) => p.code === dto.code || p.id === dto.id);
    if (idx !== -1) {
      demoStore.parameters[idx] = {
        ...demoStore.parameters[idx],
        ...dto,
        value: String(dto.value),
      };
    } else {
      demoStore.parameters.push({
        id: `param-${Date.now()}`,
        code: dto.code,
        name: dto.name || dto.code,
        category: dto.category || 'GENERAL',
        value: String(dto.value),
        effectiveDate: dto.effectiveDate || new Date().toISOString().slice(0, 10),
        updatedBy: 'somchai',
        isActive: dto.isActive ?? true,
        remark: dto.remark || '',
      });
    }
    return demoStore.parameters;
  }
}
