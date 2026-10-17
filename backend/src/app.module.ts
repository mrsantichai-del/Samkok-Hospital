import { Controller, Get, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { ParametersModule } from './parameters/parameters.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { DepartmentsModule } from './departments/departments.module';
import { EmployeesModule } from './employees/employees.module';
import { PayItemsModule } from './pay-items/pay-items.module';
import { PayrollModule } from './payroll/payroll.module';
import { ApprovalsModule } from './approvals/approvals.module';
import { PayslipsModule } from './payslips/payslips.module';
import { ReportsModule } from './reports/reports.module';

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      status: 'ok',
      service: 'Samkok Hospital Payroll Backend API (NestJS + Prisma + Supabase PostgreSQL)',
      hospital: 'โรงพยาบาลสามโคก จังหวัดปทุมธานี',
      endpoints: [
        '/departments',
        '/employees',
        '/pay-items',
        '/payroll/periods',
        '/reports/summary',
        '/auth/login',
      ],
    };
  }

  @Get('health')
  getHealth() {
    return { status: 'healthy', timestamp: new Date().toISOString() };
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    RolesModule,
    ParametersModule,
    AuditLogsModule,
    DepartmentsModule,
    EmployeesModule,
    PayItemsModule,
    PayrollModule,
    ApprovalsModule,
    PayslipsModule,
    ReportsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
