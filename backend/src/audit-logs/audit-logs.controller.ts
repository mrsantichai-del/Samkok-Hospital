import { Controller, Get, Query } from '@nestjs/common';
import { AuditService } from './audit-logs.service';

@Controller('audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  async findLogs(
    @Query('keyword') keyword?: string,
    @Query('action') action?: string,
    @Query('menuName') menuName?: string,
    @Query('status') status?: string,
  ) {
    return this.auditService.findLogs({ keyword, action, menuName, status });
  }
}
