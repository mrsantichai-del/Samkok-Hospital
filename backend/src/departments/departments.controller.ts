import { Controller, Get } from '@nestjs/common';
import { DepartmentService } from './departments.service';

@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get()
  async findAll() {
    return this.departmentService.findAll();
  }

  @Get('positions')
  async findPositions() {
    return this.departmentService.findPositions();
  }

  @Get('employee-types')
  async findEmployeeTypes() {
    return this.departmentService.findEmployeeTypes();
  }
}
