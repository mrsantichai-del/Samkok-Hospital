import { Module } from '@nestjs/common';
import { ApprovalService } from './approvals.service';
import { ApprovalController } from './approvals.controller';

@Module({
  controllers: [ApprovalController],
  providers: [ApprovalService],
  exports: [ApprovalService],
})
export class ApprovalsModule {}
