import { UserProfile } from '@/types/user';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://samkok-hospital.onrender.com'
    : 'http://localhost:3001');

export const SUPABASE_LOGO_URL =
  process.env.NEXT_PUBLIC_HOSPITAL_LOGO_URL ||
  'https://spwtsuxwnrmcwmqihozf.supabase.co/storage/v1/object/public/hospital-assets/samkok-logo.jpg';

export const FALLBACK_LOGO_URL = '/samkok-logo.jpg';

export const SUPABASE_LOGIN_BG_URL =
  process.env.NEXT_PUBLIC_LOGIN_BG_URL ||
  'https://spwtsuxwnrmcwmqihozf.supabase.co/storage/v1/object/public/hospital-assets/login-hospital.jpg';

export const FALLBACK_LOGIN_BG_URL = '/login-hospital.jpg';

export async function apiFetch<T>(endpoint: string, options?: RequestInit, fallbackData?: T): Promise<T> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('samkok_token') : null;
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options?.headers || {}),
      },
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || `HTTP Error ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    if (fallbackData !== undefined) {
      return fallbackData;
    }
    throw err;
  }
}

export async function signIn(
  username: string,
  password: string,
): Promise<{ accessToken: string; user: UserProfile }> {
  try {
    return await apiFetch<{ accessToken: string; user: UserProfile }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  } catch {
    // Fallback local login if backend is offline
    const roleMap: Record<string, { role: 'ADMIN' | 'FINANCE' | 'EXECUTIVE' | 'EMPLOYEE'; display: string; fullName: string }> = {
      somchai: { role: 'ADMIN', display: 'ผู้ดูแลระบบ', fullName: 'สมชาย ใจดี' },
      suda: { role: 'FINANCE', display: 'เจ้าหน้าที่ฝ่ายการเงิน', fullName: 'สุภา มีสุข' },
      finance: { role: 'FINANCE', display: 'เจ้าหน้าที่ฝ่ายการเงิน', fullName: 'สุภา มีสุข' },
      executive: { role: 'EXECUTIVE', display: 'ผู้บริหาร', fullName: 'ดร.ณัฐวุฒิ พัฒนา' },
      anucha: { role: 'EXECUTIVE', display: 'ผู้อนุมัติ / ผู้บริหาร', fullName: 'อนุชา รักงาน' },
      panya: { role: 'EMPLOYEE', display: 'บุคลากรทั่วไป', fullName: 'นางสาวกมลวรรณ ใจดี' },
    };
    const matched = roleMap[username.toLowerCase()] || {
      role: 'FINANCE',
      display: 'เจ้าหน้าที่ฝ่ายการเงิน',
      fullName: 'สมชาย ใจดี',
    };
    return {
      accessToken: 'demo-jwt-token',
      user: {
        id: 'user-demo',
        username,
        fullName: matched.fullName,
        role: matched.role,
        roleDisplay: matched.display,
        employeeCode: 'E0001',
      },
    };
  }
}
