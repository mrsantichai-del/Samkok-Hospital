import { Controller, Get, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './database/prisma.module';
import { PrismaService } from './database/prisma.service';
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
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  getRoot() {
    return {
      status: 'ok',
      service: 'Samkok Hospital Payroll Backend API (NestJS + Prisma + Supabase PostgreSQL)',
      hospital: 'โรงพยาบาลสามโคก จังหวัดปทุมธานี',
      logoBucket: 'https://spwtsuxwnrmcwmqihozf.supabase.co/storage/v1/object/public/hospital-assets/samkok-logo.jpg',
      endpoints: [
        '/departments',
        '/employees',
        '/pay-items',
        '/payroll/periods',
        '/reports/summary',
        '/auth/login',
        '/logo-url',
      ],
    };
  }

  @Get('health')
  getHealth() {
    return { status: 'healthy', timestamp: new Date().toISOString() };
  }

  @Get('logo-url')
  async getLogoUrl() {
    try {
      const rows = await this.prisma.$queryRawUnsafe<Array<{ name: string }>>(
        `SELECT name FROM storage.objects WHERE bucket_id = 'hospital-assets' AND name NOT ILIKE '%login%' AND name NOT ILIKE '%hospital.jpg%' ORDER BY created_at DESC LIMIT 1`,
      );
      if (rows && rows.length > 0 && rows[0].name) {
        return {
          bucket: 'hospital-assets',
          fileName: rows[0].name,
          url: `https://spwtsuxwnrmcwmqihozf.supabase.co/storage/v1/object/public/hospital-assets/${encodeURIComponent(rows[0].name)}`,
        };
      }
    } catch {
      // Fallback if storage schema is not accessible
    }
    return {
      bucket: 'hospital-assets',
      fileName: 'samkok-logo.jpg',
      url: 'https://spwtsuxwnrmcwmqihozf.supabase.co/storage/v1/object/public/hospital-assets/samkok-logo.jpg',
    };
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
