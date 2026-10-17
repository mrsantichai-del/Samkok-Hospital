import { Controller, Get, Post, Query, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { ReportService } from './reports.service';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  // UC-19: GET /reports/payroll-summary (ตาม Sequence Diagram รูปที่ 3.27)
  @Get('payroll-summary')
  async payrollSummary(@Query('periodId') periodId?: string) {
    return this.reportService.payrollSummary(periodId);
  }

  // UC-20: GET /reports/personnel-cost (ตาม Sequence Diagram รูปที่ 3.28)
  @Get('personnel-cost')
  async personnelCost(
    @Query('year') year?: string,
    @Query('month') month?: string,
    @Query('department') department?: string,
  ) {
    return this.reportService.personnelCost({ year, month, department });
  }

  // UC-21: POST /reports/export (ตาม Sequence Diagram รูปที่ 3.29)
  @Post('export')
  async exportReport(
    @Body() body: { filter?: any; format?: 'PDF' | 'EXCEL' },
    @Res() res: Response,
  ) {
    const format = (body?.format || 'EXCEL').toUpperCase();
    if (format === 'PDF') {
      const pdfBuffer = await this.reportService.exportPdfReport();
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="samkok_payroll_report_2569.pdf"',
        'Content-Length': pdfBuffer.length,
      });
      return res.end(pdfBuffer);
    } else {
      const xlsxBuffer = await this.reportService.exportExcelReport();
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="samkok_payroll_report_2569.xlsx"',
        'Content-Length': xlsxBuffer.length,
      });
      return res.end(xlsxBuffer);
    }
  }
}
