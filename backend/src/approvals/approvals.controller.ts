import { Controller, Get, Post, Param, Body, Req } from '@nestjs/common';
import { ApprovalService } from './approvals.service';

@Controller('approvals')
export class ApprovalController {
  constructor(private readonly approvalService: ApprovalService) {}

  @Get(':periodId')
  async getApprovalDetail(@Param('periodId') periodId: string) {
    return this.approvalService.getApprovalDetail(periodId);
  }

  @Post('decision')
  async decide(
    @Body() dto: { periodId: string; decision: 'APPROVE' | 'RETURN'; remark?: string },
    @Req() req: any,
  ) {
    return this.approvalService.decide(dto, req.user?.userId);
  }
}
