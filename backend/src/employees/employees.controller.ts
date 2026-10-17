import { Controller, Get, Post, Put, Body, Query, Req } from '@nestjs/common';
import { EmployeeService } from './employees.service';

@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get()
  async findAll(
    @Query('keyword') keyword?: string,
    @Query('department') department?: string,
    @Query('employeeType') employeeType?: string,
    @Query('status') status?: string,
  ) {
    return this.employeeService.findAll({ keyword, department, employeeType, status });
  }

  @Post()
  async createEmployee(@Body() dto: any, @Req() req: any) {
    return this.employeeService.saveEmployee(dto, req.user?.userId);
  }

  @Put()
  async updateEmployee(@Body() dto: any, @Req() req: any) {
    return this.employeeService.saveEmployee(dto, req.user?.userId);
  }
}
