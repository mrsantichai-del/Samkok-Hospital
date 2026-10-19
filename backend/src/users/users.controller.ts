import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { UserService } from './users.service';
import { SaveUserDto } from './dto/save-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(
    @Query('keyword') keyword?: string,
    @Query('role') role?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.userService.findAll({ keyword, role, isActive });
  }

  @Post()
  async createUser(@Body() dto: SaveUserDto, @Req() req: any) {
    return this.userService.saveUser(dto, req.user?.userId);
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() dto: SaveUserDto, @Req() req: any) {
    return this.userService.saveUser({ ...dto, id }, req.user?.userId);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
}
