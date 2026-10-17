import { Module } from '@nestjs/common';
import { PayslipService } from './payslips.service';
import { PayslipController } from './payslips.controller';

@Module({
  controllers: [PayslipController],
  providers: [PayslipService],
  exports: [PayslipService],
})
export class PayslipsModule {}
