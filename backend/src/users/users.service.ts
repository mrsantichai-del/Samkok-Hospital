import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database/prisma.service';
import { demoStore } from '../database/demo-store';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filter?: { keyword?: string; role?: string; isActive?: string }) {
    if (this.prisma.isConnected) {
      const users = await this.prisma.user.findMany({
        include: {
          employee: true,
          userRoles: { include: { role: true } },
        },
        orderBy: { createdAt: 'asc' },
      });

      return users
        .map((u) => ({
          id: u.id,
          username: u.username,
          fullName: u.employee
            ? `${u.employee.titleName}${u.employee.firstName} ${u.employee.lastName}`
            : u.remark || u.username,
          employeeId: u.employeeId,
          employeeCode: u.employee?.employeeCode || '-',
          role: u.userRoles[0]?.role.name || 'EMPLOYEE',
          roleDisplay: u.userRoles[0]?.role.displayName || 'บุคลากรทั่วไป',
          isActive: u.isActive,
          email: u.employee?.email || `${u.username}@example.com`,
          remark: u.remark,
        }))
        .filter((u) => {
          if (filter?.role && filter.role !== 'ALL' && u.role !== filter.role) return false;
          if (filter?.isActive !== undefined && filter.isActive !== 'ALL') {
            const activeBool = filter.isActive === 'true';
            if (u.isActive !== activeBool) return false;
          }
          if (filter?.keyword) {
            const kw = filter.keyword.toLowerCase();
            return (
              u.username.toLowerCase().includes(kw) ||
              u.fullName.toLowerCase().includes(kw) ||
              u.roleDisplay.toLowerCase().includes(kw)
            );
          }
          return true;
        });
    }

    return demoStore.users.filter((u) => {
      if (filter?.role && filter.role !== 'ALL' && u.role !== filter.role) return false;
      if (filter?.isActive !== undefined && filter.isActive !== 'ALL') {
        const activeBool = filter.isActive === 'true';
        if (u.isActive !== activeBool) return false;
      }
      if (filter?.keyword) {
        const kw = filter.keyword.toLowerCase();
        return (
          u.username.toLowerCase().includes(kw) ||
          u.fullName.toLowerCase().includes(kw) ||
          u.roleDisplay.toLowerCase().includes(kw)
        );
      }
      return true;
    });
  }

  /**
   * UC-02: การจัดการบัญชีผู้ใช้งาน (Sequence Diagram รูปที่ 3.10)
   * saveUser(dto) -> ตรวจสอบ Employee และ username -> INSERT / UPDATE User -> INSERT AuditLog
   */
  async saveUser(dto: any, actorUserId?: string) {
    if (!dto.username) {
      throw new BadRequestException('กรุณาระบุชื่อผู้ใช้งาน');
    }

    if (this.prisma.isConnected) {
      const passwordHash = dto.password
        ? await bcrypt.hash(dto.password, 10)
        : await bcrypt.hash('password123', 10);

      let userRecord: any;
      if (dto.id) {
        const existing = await this.prisma.user.findUnique({ where: { id: dto.id } });
        userRecord = await this.prisma.user.update({
          where: { id: dto.id },
          data: {
            username: dto.username,
            ...(dto.password ? { passwordHash } : {}),
            employeeId: dto.employeeId || null,
            isActive: dto.isActive !== undefined ? Boolean(dto.isActive) : true,
            remark: dto.remark || null,
          },
        });

        if (dto.role) {
          const roleObj = await this.prisma.role.findUnique({ where: { name: dto.role } });
          if (roleObj) {
            await this.prisma.userRole.deleteMany({ where: { userId: userRecord.id } });
            await this.prisma.userRole.create({
              data: { userId: userRecord.id, roleId: roleObj.id },
            });
          }
        }

        await this.prisma.auditLog.create({
          data: {
            userId: actorUserId || null,
            action: 'UPDATE',
            menuName: 'จัดการบัญชีผู้ใช้งาน',
            tableName: 'User',
            recordId: userRecord.id,
            summary: `แก้ไขบัญชีผู้ใช้งาน ${userRecord.username}`,
            status: 'สำเร็จ',
            oldValue: existing ? { username: existing.username, isActive: existing.isActive } : null,
            newValue: { username: userRecord.username, isActive: userRecord.isActive, role: dto.role },
          },
        });
      } else {
        const duplicate = await this.prisma.user.findUnique({ where: { username: dto.username } });
        if (duplicate) {
          throw new BadRequestException('ชื่อผู้ใช้งานนี้มีอยู่ในระบบแล้ว');
        }

        userRecord = await this.prisma.user.create({
          data: {
            username: dto.username,
            passwordHash,
            employeeId: dto.employeeId || null,
            isActive: dto.isActive !== undefined ? Boolean(dto.isActive) : true,
            remark: dto.remark || null,
          },
        });

        const roleName = dto.role || 'EMPLOYEE';
        const roleObj = await this.prisma.role.findUnique({ where: { name: roleName } });
        if (roleObj) {
          await this.prisma.userRole.create({
            data: { userId: userRecord.id, roleId: roleObj.id },
          });
        }

        await this.prisma.auditLog.create({
          data: {
            userId: actorUserId || null,
            action: 'CREATE',
            menuName: 'จัดการบัญชีผู้ใช้งาน',
            tableName: 'User',
            recordId: userRecord.id,
            summary: `เพิ่มบัญชีผู้ใช้งาน ${userRecord.username}`,
            status: 'สำเร็จ',
            newValue: { username: userRecord.username, role: roleName },
          },
        });
      }

      return this.findAll();
    }

    // Fallback mode
    const roleMap: Record<string, string> = {
      ADMIN: 'ผู้ดูแลระบบ',
      FINANCE: 'เจ้าหน้าที่ฝ่ายการเงิน',
      EXECUTIVE: 'ผู้อนุมัติ / ผู้บริหาร',
      EMPLOYEE: 'บุคลากรทั่วไป',
    };

    if (dto.id) {
      const idx = demoStore.users.findIndex((u) => u.id === dto.id);
      if (idx !== -1) {
        demoStore.users[idx] = {
          ...demoStore.users[idx],
          username: dto.username,
          fullName: dto.fullName || demoStore.users[idx].fullName,
          role: dto.role || demoStore.users[idx].role,
          roleDisplay: roleMap[dto.role] || demoStore.users[idx].roleDisplay,
          isActive: dto.isActive !== undefined ? Boolean(dto.isActive) : demoStore.users[idx].isActive,
          email: dto.email || demoStore.users[idx].email,
          remark: dto.remark ?? demoStore.users[idx].remark,
        };
      }
    } else {
      demoStore.users.push({
        id: `user-${Date.now()}`,
        username: dto.username,
        fullName: dto.fullName || dto.username,
        employeeId: dto.employeeId || 'emp-1',
        employeeCode: dto.employeeCode || 'E0001',
        role: dto.role || 'EMPLOYEE',
        roleDisplay: roleMap[dto.role || 'EMPLOYEE'] || 'บุคลากรทั่วไป',
        isActive: dto.isActive !== undefined ? Boolean(dto.isActive) : true,
        email: dto.email || `${dto.username}@example.com`,
        remark: dto.remark || '',
      });
    }
    return demoStore.users;
  }

  async deleteUser(id: string) {
    if (this.prisma.isConnected) {
      await this.prisma.user.delete({ where: { id } });
      return this.findAll();
    }
    const idx = demoStore.users.findIndex((u) => u.id === id);
    if (idx !== -1) demoStore.users.splice(idx, 1);
    return demoStore.users;
  }
}
