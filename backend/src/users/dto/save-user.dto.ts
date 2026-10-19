import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SaveUserDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @IsNotEmpty({ message: 'กรุณาระบุชื่อผู้ใช้งาน' })
  username: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  isActive?: boolean;
}
