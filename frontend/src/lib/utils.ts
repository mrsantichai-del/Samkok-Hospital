import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * ตรวจสอบเลขประจำตัวประชาชน 13 หลักด้วย Modulo 11 Check Digit Algorithm (หัวข้อ 2.1.3.4)
 */
export function validateThaiCitizenId(citizenId: string): boolean {
  if (!citizenId) return false;
  const cleaned = citizenId.replace(/[^0-9]/g, '');
  if (!/^\d{13}$/.test(cleaned)) return false;

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned.charAt(i), 10) * (13 - i);
  }
  const checkDigit = (11 - (sum % 11)) % 10;
  return checkDigit === parseInt(cleaned.charAt(12), 10);
}

export function formatCitizenIdMask(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 13);
  if (digits.length <= 1) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 1)}-${digits.slice(1)}`;
  if (digits.length <= 10) return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5)}`;
  if (digits.length <= 12)
    return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5, 10)}-${digits.slice(10)}`;
  return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5, 10)}-${digits.slice(10, 12)}-${digits.slice(12, 13)}`;
}

export function formatCurrency(num: number | string): string {
  const val = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(val)) return '0.00';
  return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * แปลงตัวเลขเป็นตัวอักษรภาษาไทย (Bahttext - หัวข้อ 2.2.6)
 */
export function bahtText(amount: number): string {
  if (!amount || amount === 0) return 'ศูนย์บาทถ้วน';
  const thaiNumbers = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const thaiPositions = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

  const convertInt = (str: string): string => {
    if (str.length > 6) {
      return convertInt(str.slice(0, str.length - 6)) + 'ล้าน' + convertInt(str.slice(str.length - 6));
    }
    let res = '';
    const len = str.length;
    for (let i = 0; i < len; i++) {
      const d = parseInt(str.charAt(i), 10);
      const pos = len - i - 1;
      if (d === 0) continue;
      if (pos === 1 && d === 1) res += 'สิบ';
      else if (pos === 1 && d === 2) res += 'ยี่สิบ';
      else if (pos === 0 && d === 1 && len > 1) res += 'เอ็ด';
      else res += thaiNumbers[d] + thaiPositions[pos];
    }
    return res;
  };

  const [b, s] = Math.abs(amount).toFixed(2).split('.');
  const bahtStr = parseInt(b, 10) > 0 ? convertInt(b) + 'บาท' : '';
  const satang = parseInt(s, 10);
  return satang === 0 ? `${bahtStr}ถ้วน` : `${bahtStr}${convertInt(String(satang))}สตางค์`;
}
