import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException('ไม่มีสิทธิ์เข้าถึงทรัพยากรนี้');
    }
    const userRoles: string[] = Array.isArray(user.roles) ? user.roles : [user.role];
    const hasRole = requiredRoles.some((role) => userRoles.includes(role) || userRoles.includes('ADMIN'));
    if (!hasRole) {
      throw new ForbiddenException('สิทธิ์การใช้งานของคุณไม่เพียงพอสำหรับฟังก์ชันนี้ (RBAC)');
    }
    return true;
  }
}
