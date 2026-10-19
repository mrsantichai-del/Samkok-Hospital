import { IsArray, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SavePeriodDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsInt()
  month: number;

  @IsInt()
  year: number;

  @IsOptional()
  @IsInt()
  round?: number;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  payDate?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  remark?: string;
}

export class SavePayrollAdjustmentDto {
  @IsOptional()
  @IsString()
  periodId?: string;

  @IsString()
  @IsNotEmpty({ message: 'กรุณาระบุรหัสพนักงาน' })
  employeeCode: string;

  @IsOptional()
  @IsArray()
  incomes: { code?: string; name: string; amount: number; remark?: string }[];

  @IsOptional()
  @IsArray()
  deductions: { code?: string; name: string; amount: number; remark?: string }[];

  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsString()
  payItemCode?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  remark?: string;
}
