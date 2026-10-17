import { Controller, Get, Post, Put, Body, Req } from '@nestjs/common';
import { RoleService } from './roles.service';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  async findAll() {
    return this.roleService.findAll();
  }

  @Post('assign')
  async assignRole(@Body() body: { userId: string; roleId: string }, @Req() req: any) {
    return this.roleService.assignRole(body.userId, body.roleId, req.user?.userId);
  }

  @Put()
  async saveRolePermissions(@Body() dto: any, @Req() req: any) {
    return this.roleService.saveRolePermissions(dto, req.user?.userId);
  }
}
