import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SaveParameterDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @IsNotEmpty({ message: 'กรุณาระบุรหัสพารามิเตอร์' })
  code: string;

  @IsString()
  @IsNotEmpty({ message: 'กรุณาระบุชื่อพารามิเตอร์' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'กรุณาระบุค่าพารามิเตอร์' })
  value: string;

  @IsOptional()
  @IsString()
  effectiveDate?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
