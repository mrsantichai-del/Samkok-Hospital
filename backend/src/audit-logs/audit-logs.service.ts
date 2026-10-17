import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { demoStore } from '../database/demo-store';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * UC-05: ตรวจสอบบันทึกการใช้งานและการเปลี่ยนแปลงข้อมูล (Sequence Diagram รูปที่ 3.13)
   * findLogs(filter) -> ค้นหา AuditLog JOIN User -> ส่งรายการประวัติกลับ
   */
  async findLogs(filter?: {
    keyword?: string;
    action?: string;
    menuName?: string;
    status?: string;
    user?: string;
  }) {
    if (this.prisma.isConnected) {
      const logs = await this.prisma.auditLog.findMany({
        include: {
          user: {
            include: {
              employee: true,
              userRoles: { include: { role: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });

      return logs
        .map((log) => {
          const userFullName = log.user?.employee
            ? `${log.user.employee.firstName} ${log.user.employee.lastName}`
            : log.user?.username || 'ระบบ';
          const roleDisplay = log.user?.userRoles?.[0]?.role?.displayName || 'ผู้ดูแลระบบ';
          return {
            id: log.id,
            createdAt: log.createdAt.toLocaleString('th-TH', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            userFullName,
            roleDisplay,
            menuName: log.menuName || log.tableName,
            action: log.action,
            summary: log.summary || `${log.action} ${log.tableName}`,
            status: log.status || 'สำเร็จ',
            oldValue: log.oldValue,
            newValue: log.newValue,
          };
        })
        .filter((l) => {
          if (filter?.action && filter.action !== 'ALL' && l.action !== filter.action) return false;
          if (filter?.menuName && filter.menuName !== 'ALL' && l.menuName !== filter.menuName) return false;
          if (filter?.keyword) {
            const kw = filter.keyword.toLowerCase();
            return (
              l.summary.toLowerCase().includes(kw) ||
              l.userFullName.toLowerCase().includes(kw) ||
              l.menuName.toLowerCase().includes(kw)
            );
          }
          return true;
        });
    }

    return demoStore.auditLogs.filter((l) => {
      if (filter?.action && filter.action !== 'ALL' && l.action !== filter.action) return false;
      if (filter?.menuName && filter.menuName !== 'ALL' && l.menuName !== filter.menuName) return false;
      if (filter?.keyword) {
        const kw = filter.keyword.toLowerCase();
        return (
          l.summary.toLowerCase().includes(kw) ||
          l.userFullName.toLowerCase().includes(kw) ||
          l.menuName.toLowerCase().includes(kw)
        );
      }
      return true;
    });
  }
}
