import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { demoStore } from '../database/demo-store';

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    if (this.prisma.isConnected) {
      return this.prisma.role.findMany({ orderBy: { createdAt: 'asc' } });
    }
    return demoStore.roles;
  }

  /**
   * UC-03: การจัดการสิทธิ์การเข้าถึงตามบทบาท (Sequence Diagram รูปที่ 3.11)
   * assignRole(userId, roleId) -> อ่าน Role และ UserRole -> INSERT / UPDATE UserRole -> INSERT AuditLog
   */
  async assignRole(userId: string, roleId: string, actorUserId?: string) {
    if (!userId || !roleId) {
      throw new BadRequestException('กรุณาระบุบัญชีผู้ใช้งานและบทบาทที่ต้องการกำหนด');
    }

    if (this.prisma.isConnected) {
      const role = await this.prisma.role.findFirst({
        where: { OR: [{ id: roleId }, { name: roleId }] },
      });
      if (!role) {
        throw new BadRequestException('ไม่พบบทบาทที่เลือกในระบบ');
      }

      await this.prisma.userRole.deleteMany({ where: { userId } });
      const assigned = await this.prisma.userRole.create({
        data: {
          userId,
          roleId: role.id,
        },
        include: { role: true, user: true },
      });

      await this.prisma.auditLog.create({
        data: {
          userId: actorUserId || null,
          action: 'UPDATE',
          menuName: 'กำหนดบทบาทการใช้งาน',
          tableName: 'UserRole',
          recordId: assigned.id,
          summary: `กำหนดบทบาท ${role.displayName || role.name} ให้แก่ผู้ใช้งาน ${assigned.user.username}`,
          status: 'สำเร็จ',
          newValue: { userId, roleId: role.id, roleName: role.name },
        },
      });

      return assigned;
    }

    const user = demoStore.users.find((u) => u.id === userId);
    const role = demoStore.roles.find((r) => r.id === roleId || r.name === roleId);
    if (user && role) {
      user.role = role.name;
      user.roleDisplay = role.displayName;
    }
    return { user, role };
  }

  async saveRolePermissions(dto: any, actorUserId?: string) {
    if (this.prisma.isConnected) {
      const role = await this.prisma.role.findFirst({
        where: { OR: [{ id: dto.id }, { name: dto.name }] },
      });
      if (role) {
        const updated = await this.prisma.role.update({
          where: { id: role.id },
          data: {
            displayName: dto.displayName || role.displayName,
            description: dto.description ?? role.description,
            isActive: dto.isActive !== undefined ? Boolean(dto.isActive) : role.isActive,
            permissions: dto.permissions || role.permissions,
          },
        });
        await this.prisma.auditLog.create({
          data: {
            userId: actorUserId || null,
            action: 'UPDATE',
            menuName: 'กำหนดบทบาทการใช้งาน',
            tableName: 'Role',
            recordId: updated.id,
            summary: `แก้ไขสิทธิ์เมนูของบทบาท ${updated.displayName || updated.name}`,
            status: 'สำเร็จ',
            newValue: dto.permissions,
          },
        });
        return updated;
      }
    }

    const idx = demoStore.roles.findIndex((r) => r.id === dto.id || r.name === dto.name);
    if (idx !== -1) {
      demoStore.roles[idx] = {
        ...demoStore.roles[idx],
        ...dto,
      };
      return demoStore.roles[idx];
    }
    const newRole = {
      id: `role-${Date.now()}`,
      name: dto.name || `CUSTOM_${Date.now()}`,
      displayName: dto.displayName || dto.name,
      roleType: dto.roleType || 'บทบาทภายใน',
      description: dto.description || '',
      isActive: dto.isActive ?? true,
      permissions: dto.permissions || demoStore.roles[1].permissions,
    };
    demoStore.roles.push(newRole);
    return newRole;
  }
}
