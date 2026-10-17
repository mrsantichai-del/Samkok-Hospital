import { create } from 'zustand';
import { UserProfile } from '@/types/user';

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  setUser: (user: UserProfile | null, token?: string | null) => void;
  switchRoleDemo: (role: 'ADMIN' | 'FINANCE' | 'EXECUTIVE' | 'EMPLOYEE') => void;
  logout: () => void;
}

const DEMO_USERS: Record<'ADMIN' | 'FINANCE' | 'EXECUTIVE' | 'EMPLOYEE', UserProfile> = {
  ADMIN: {
    id: 'user-1',
    username: 'somchai',
    fullName: 'สมชาย ใจดี',
    role: 'ADMIN',
    roleDisplay: 'ผู้ดูแลระบบ',
    employeeCode: 'E0001',
    departmentName: 'ศูนย์เทคโนโลยีสารสนเทศ',
    positionName: 'ผู้ดูแลระบบ',
  },
  FINANCE: {
    id: 'user-2',
    username: 'suda',
    fullName: 'สุภา มีสุข',
    role: 'FINANCE',
    roleDisplay: 'เจ้าหน้าที่ฝ่ายการเงิน',
    employeeCode: 'E0002',
    departmentName: 'ฝ่ายการเงิน',
    positionName: 'นักวิชาการเงินและบัญชี',
  },
  EXECUTIVE: {
    id: 'user-4',
    username: 'executive',
    fullName: 'ดร.ณัฐวุฒิ พัฒนา',
    role: 'EXECUTIVE',
    roleDisplay: 'ผู้บริหาร / ผู้อำนวยการ',
    employeeCode: 'E0040',
    departmentName: 'ฝ่ายบริหาร',
    positionName: 'ผู้อำนวยการโรงพยาบาล',
  },
  EMPLOYEE: {
    id: 'user-5',
    username: 'somchai',
    fullName: 'นางสาวกมลวรรณ ใจดี',
    role: 'EMPLOYEE',
    roleDisplay: 'บุคลากรทั่วไป',
    employeeCode: 'E0001',
    departmentName: 'ฝ่ายการเงิน',
    positionName: 'นักการเงิน',
  },
};

export const useAuthStore = create<AuthState>((set) => ({
  user: DEMO_USERS.FINANCE,
  token: 'demo-jwt-token',
  setUser: (user, token = null) => {
    if (typeof window !== 'undefined') {
      if (user) localStorage.setItem('samkok_user', JSON.stringify(user));
      else localStorage.removeItem('samkok_user');
      if (token) localStorage.setItem('samkok_token', token);
    }
    set({ user, token });
  },
  switchRoleDemo: (role) => {
    const selected = DEMO_USERS[role];
    if (typeof window !== 'undefined') {
      localStorage.setItem('samkok_user', JSON.stringify(selected));
    }
    set({ user: selected });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('samkok_user');
      localStorage.removeItem('samkok_token');
    }
    set({ user: null, token: null });
  },
}));
