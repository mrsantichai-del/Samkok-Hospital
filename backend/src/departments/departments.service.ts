import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { demoStore } from '../database/demo-store';

@Injectable()
export class DepartmentService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    if (this.prisma.isConnected) {
      return this.prisma.department.findMany({
        include: { positions: true, _count: { select: { employees: true } } },
        orderBy: { name: 'asc' },
      });
    }
    return demoStore.departments;
  }

  async findPositions() {
    if (this.prisma.isConnected) {
      return this.prisma.position.findMany({
        include: { department: true },
        orderBy: { name: 'asc' },
      });
    }
    return demoStore.positions;
  }

  async findEmployeeTypes() {
    if (this.prisma.isConnected) {
      return this.prisma.employeeType.findMany({ orderBy: { name: 'asc' } });
    }
    return demoStore.employeeTypes;
  }
}
