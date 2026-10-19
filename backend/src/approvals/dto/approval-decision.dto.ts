import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ApprovalDecisionDto {
  @IsString()
  @IsNotEmpty({ message: 'กรุณาระบุรหัสงวดเงินเดือน' })
  periodId: string;

  @IsString()
  @IsIn(['APPROVE', 'RETURN', 'APPROVED', 'RETURNED'], {
    message: 'ผลการพิจารณาต้องเป็น APPROVE หรือ RETURN เท่านั้น',
  })
  decision: 'APPROVE' | 'RETURN';

  @IsOptional()
  @IsString()
  remark?: string;
}
