import { Controller, Get, Post, Param, Body, Query, Res, Req } from '@nestjs/common';
import { Response } from 'express';
import { PayslipService } from './payslips.service';

@Controller()
export class PayslipController {
  constructor(private readonly payslipService: PayslipService) {}

  // UC-16: POST /payslip/generate (ตาม Sequence Diagram รูปที่ 3.24)
  @Post('payslip/generate')
  async generatePayslip(@Body() body: { employeeId?: string; periodId?: string }) {
    return this.payslipService.getPayslipData(body.employeeId || 'E0001', body.periodId);
  }

  // UC-22: GET /me/payslip/:periodId (ตาม Sequence Diagram รูปที่ 3.30)
  @Get('me/payslip/:periodId')
  async getMyPayslip(@Param('periodId') periodId: string, @Req() req: any) {
    return this.payslipService.getMyPayslip(req.user?.userId || 'user-5', periodId);
  }

  // UC-23: GET /me/payslips (ตาม Sequence Diagram รูปที่ 3.31)
  @Get('me/payslips')
  async getMyPayslipHistory(@Query('year') year?: string, @Req() req?: any) {
    return this.payslipService.getMyPayslipHistory(req?.user?.userId, year);
  }

  // UC-24: GET /me/payslip/:periodId/pdf (ตาม Sequence Diagram รูปที่ 3.32)
  @Get('me/payslip/:periodId/pdf')
  async downloadMyPayslipPdf(
    @Param('periodId') periodId: string,
    @Query('employeeCode') employeeCode = 'E0001',
    @Res() res: Response,
  ) {
    const buffer = await this.payslipService.createPayslipPdfBuffer(employeeCode, periodId);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="payslip_${employeeCode}_2569_10.pdf"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}
