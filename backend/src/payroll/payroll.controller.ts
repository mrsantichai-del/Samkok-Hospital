import { Controller, Get, Post, Put, Body, Query, Req } from '@nestjs/common';
import { PayrollService } from './payroll.service';

@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Get('periods')
  async findAllPeriods() {
    return this.payrollService.findAllPeriods();
  }

  @Post('periods')
  async createPeriod(@Body() dto: any, @Req() req: any) {
    return this.payrollService.savePeriod(dto, req.user?.userId);
  }

  @Put('periods')
  async updatePeriod(@Body() dto: any, @Req() req: any) {
    return this.payrollService.savePeriod(dto, req.user?.userId);
  }

  @Post('calculate-base')
  async calculateBase(@Body('periodId') periodId: string, @Req() req: any) {
    return this.payrollService.calculateBase(periodId, req.user?.userId);
  }

  @Post('calculate-ot')
  async calculateOT(@Body('periodId') periodId: string, @Req() req: any) {
    return this.payrollService.calculateOT(periodId, req.user?.userId);
  }

  @Post('income-item')
  async saveIncomeItem(@Body() dto: any) {
    return this.payrollService.savePayrollAdjustment(dto);
  }

  @Post('deduction-item')
  async saveDeductionItem(@Body() dto: any) {
    return this.payrollService.savePayrollAdjustment(dto);
  }

  @Get('review')
  async reviewResult(@Query('periodId') periodId?: string) {
    return this.payrollService.reviewResult(periodId);
  }

  @Post('submit')
  async submit(@Body('periodId') periodId: string, @Req() req: any) {
    return this.payrollService.submit(periodId, req.user?.userId);
  }

  @Get('returned')
  async getReturnedPeriod(@Query('periodId') periodId?: string) {
    return this.payrollService.getReturnedPeriod(periodId);
  }

  @Put('revise')
  async revisePeriod(@Body() dto: any, @Req() req: any) {
    return this.payrollService.revisePeriod(dto, req.user?.userId);
  }
}
