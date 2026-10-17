export type RoleType = 'ADMIN' | 'FINANCE' | 'EXECUTIVE' | 'EMPLOYEE';

export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  role: RoleType;
  roleDisplay: string;
  roles?: string[];
  employeeId?: string;
  employeeCode?: string;
  departmentName?: string;
  positionName?: string;
  permissions?: Record<string, any>;
}
