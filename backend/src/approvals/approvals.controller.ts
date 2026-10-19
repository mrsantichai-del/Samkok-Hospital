import { Controller, Get, Post, Param, Body, Req } from '@nestjs/common';
import { ApprovalService } from './approvals.service';
import { ApprovalDecisionDto } from './dto/approval-decision.dto';

@Controller('approvals')
export class ApprovalController {
  constructor(private readonly approvalService: ApprovalService) {}

  @Get(':periodId')
  async getApprovalDetail(@Param('periodId') periodId: string) {
    return this.approvalService.getApprovalDetail(periodId);
  }

  @Post('decision')
  async decide(
    @Body() dto: ApprovalDecisionDto,
    @Req() req: any,
  ) {
    return this.approvalService.decide(dto, req.user?.userId);
  }
}
