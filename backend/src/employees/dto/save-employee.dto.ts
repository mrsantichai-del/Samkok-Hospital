import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SaveEmployeeDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @IsNotEmpty({ message: 'กรุณาระบุรหัสพนักงาน' })
  employeeCode: string;

  @IsString()
  @IsNotEmpty({ message: 'กรุณาระบุคำนำหน้า' })
  titleName: string;

  @IsString()
  @IsNotEmpty({ message: 'กรุณาระบุชื่อ' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'กรุณาระบุนามสกุล' })
  lastName: string;

  @IsString()
  @IsNotEmpty({ message: 'กรุณาระบุเลขประจำตัวประชาชน 13 หลัก' })
  citizenId: string;

  @IsOptional()
  @IsString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
  email?: string;

  @IsOptional()
  @IsString()
  employeeTypeName?: string;

  @IsOptional()
  @IsString()
  positionName?: string;

  @IsOptional()
  @IsString()
  departmentName?: string;

  @IsOptional()
  @IsString()
  hireDate?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  baseSalary?: number | string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  accountNo?: string;

  @IsOptional()
  @IsString()
  accountName?: string;
}
