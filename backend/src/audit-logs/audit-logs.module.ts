import { Module } from '@nestjs/common';
import { AuditService } from './audit-logs.service';
import { AuditController } from './audit-logs.controller';

@Module({
  controllers: [AuditController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditLogsModule {}
