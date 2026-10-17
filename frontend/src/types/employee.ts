export interface EmployeeRecord {
  id: string;
  employeeCode: string;
  titleName: string;
  firstName: string;
  lastName: string;
  fullName: string;
  citizenId: string;
  birthDate: string;
  gender: string;
  phone: string;
  email: string;
  hireDate: string;
  employmentStatus: 'ACTIVE' | 'RESIGNED' | 'ON_LEAVE';
  baseSalary: number;
  levelName?: string;
  departmentId?: string;
  departmentName: string;
  positionId?: string;
  positionName: string;
  employeeTypeId?: string;
  employeeTypeName: string;
  bankName?: string;
  accountNo?: string;
}
