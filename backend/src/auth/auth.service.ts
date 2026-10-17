import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database/prisma.service';
import { demoStore } from '../database/demo-store';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    if (this.prisma.isConnected) {
      const user = await this.prisma.user.findUnique({
        where: { username },
        include: {
          employee: true,
          userRoles: { include: { role: true } },
        },
      });
      if (!user || !user.isActive) return null;
      const isMatch = await bcrypt.compare(pass, user.passwordHash);
      if (!isMatch) return null;
      return user;
    } else {
      const demoUser = demoStore.users.find((u) => u.username === username);
      if (!demoUser || !demoUser.isActive) return null;
      if (pass !== 'password123' && pass !== '123456' && pass !== 'admin123') return null;
      return demoUser;
    }
  }

  /**
   * UC-01: การเข้าสู่ระบบและยืนยันตัวตน (Sequence Diagram รูปที่ 3.9)
   * 1) ค้นหา User + UserRole + Role
   * 2) ตรวจสอบรหัสผ่านด้วย Bcrypt
   * 3) สร้าง JWT และกำหนด RBAC
   * 4) บันทึก AuditLog LOGIN
   */
  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    if (this.prisma.isConnected) {
      const user = await this.prisma.user.findUnique({
        where: { username },
        include: {
          employee: {
            include: {
              department: true,
              position: true,
            },
          },
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!user) {
        throw new UnauthorizedException('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
      }

      if (!user.isActive) {
        throw new UnauthorizedException('บัญชีผู้ใช้งานนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ');
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new UnauthorizedException('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
      }

      const roles = user.userRoles.map((ur) => ur.role.name);
      const primaryRole = roles[0] || 'EMPLOYEE';
      const roleDisplay = user.userRoles[0]?.role.displayName || 'บุคลากรทั่วไป';
      const fullName = user.employee
        ? `${user.employee.titleName}${user.employee.firstName} ${user.employee.lastName}`
        : user.username;

      // บันทึก AuditLog LOGIN
      await this.prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'LOGIN',
          menuName: 'เข้าสู่ระบบ',
          tableName: 'User',
          recordId: user.id,
          summary: `ผู้ใช้งาน ${username} (${fullName}) เข้าสู่ระบบสำเร็จ`,
          status: 'สำเร็จ',
          newValue: { username, role: primaryRole, loginAt: new Date().toISOString() },
        },
      });

      const payload = {
        sub: user.id,
        username: user.username,
        role: primaryRole,
        roles,
        employeeId: user.employeeId,
        fullName,
      };

      return {
        accessToken: this.jwtService.sign(payload),
        user: {
          id: user.id,
          username: user.username,
          fullName,
          role: primaryRole,
          roleDisplay,
          roles,
          employeeId: user.employeeId,
          employeeCode: user.employee?.employeeCode || 'E0001',
          departmentName: user.employee?.department?.name || 'ฝ่ายการเงิน',
          positionName: user.employee?.position?.name || 'เจ้าหน้าที่',
          permissions: user.userRoles[0]?.role.permissions || {},
        },
      };
    }

    // กรณี Fallback (รอกำหนดรหัสผ่าน Supabase)
    const demoUser = demoStore.users.find((u) => u.username === username);
    if (!demoUser) {
      throw new UnauthorizedException('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
    }
    if (!demoUser.isActive) {
      throw new UnauthorizedException('บัญชีผู้ใช้งานนี้ถูกระงับการใช้งาน');
    }
    if (password !== 'password123' && password !== '123456' && password !== 'admin123') {
      throw new UnauthorizedException('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
    }

    const roleObj = demoStore.roles.find((r) => r.name === demoUser.role);
    const payload = {
      sub: demoUser.id,
      username: demoUser.username,
      role: demoUser.role,
      roles: [demoUser.role],
      employeeId: demoUser.employeeId,
      fullName: demoUser.fullName,
    };

    demoStore.auditLogs.unshift({
      id: `log-${Date.now()}`,
      createdAt: new Date().toLocaleString('th-TH'),
      userFullName: demoUser.fullName,
      roleDisplay: demoUser.roleDisplay,
      menuName: 'เข้าสู่ระบบ',
      action: 'เข้าสู่ระบบ',
      summary: 'เข้าสู่ระบบสำเร็จ',
      status: 'สำเร็จ',
      oldValue: null,
      newValue: { username: demoUser.username, role: demoUser.role },
    });

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: demoUser.id,
        username: demoUser.username,
        fullName: demoUser.fullName,
        role: demoUser.role,
        roleDisplay: demoUser.roleDisplay,
        roles: [demoUser.role],
        employeeId: demoUser.employeeId,
        employeeCode: demoUser.employeeCode,
        permissions: roleObj?.permissions || {},
      },
    };
  }

  async getProfile(userId: string) {
    if (this.prisma.isConnected) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          employee: { include: { department: true, position: true } },
          userRoles: { include: { role: true } },
        },
      });
      if (!user) throw new UnauthorizedException('ไม่พบข้อมูลผู้ใช้งาน');
      return user;
    }
    return demoStore.users.find((u) => u.id === userId) || demoStore.users[0];
  }
}
