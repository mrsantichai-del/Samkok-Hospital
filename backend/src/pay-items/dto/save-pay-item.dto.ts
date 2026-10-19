import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SavePayItemDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @IsNotEmpty({ message: 'กรุณาระบุรหัสรายการ' })
  code: string;

  @IsString()
  @IsNotEmpty({ message: 'กรุณาระบุชื่อรายการเงินได้หรือรายการหัก' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'กรุณาระบุประเภทรายการ (INCOME หรือ DEDUCTION)' })
  type: string;

  @IsOptional()
  @IsString()
  subCategory?: string;

  @IsOptional()
  @IsString()
  calcMethod?: string;

  @IsOptional()
  @IsString()
  defaultFormula?: string;

  @IsOptional()
  @IsBoolean()
  includeTax?: boolean;

  @IsOptional()
  @IsBoolean()
  includeSocialSecurity?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  remark?: string;
}
