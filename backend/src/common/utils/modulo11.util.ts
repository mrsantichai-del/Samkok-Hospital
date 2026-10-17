/**
 * ขั้นตอนวิธีตรวจสอบความถูกต้องของเลขประจำตัวประชาชน 13 หลัก (Modulo 11 Check Digit Algorithm)
 * อ้างอิงตามหัวข้อ 2.1.3.4:
 * นำตัวเลข 12 หลักแรกมาคูณด้วยค่าน้ำหนักถ่วง (Weight) ตั้งแต่ 13 ลดหลั่นลงมาถึง 2
 * แล้วนำผลรวมมาหารด้วย 11 เพื่อหาเศษ นำ (11 - เศษ) % 10 เทียบกับหลักที่ 13
 */
export function validateThaiCitizenId(citizenId: string): boolean {
  if (!citizenId) return false;
  const cleaned = citizenId.replace(/[^0-9]/g, '');
  if (!/^\d{13}$/.test(cleaned)) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(cleaned.charAt(i), 10);
    const weight = 13 - i;
    sum += digit * weight;
  }

  const remainder = sum % 11;
  const checkDigit = (11 - remainder) % 10;
  const lastDigit = parseInt(cleaned.charAt(12), 10);

  return checkDigit === lastDigit;
}

export function formatThaiCitizenId(citizenId: string): string {
  const cleaned = (citizenId || '').replace(/[^0-9]/g, '');
  if (cleaned.length !== 13) return citizenId;
  return `${cleaned[0]}-${cleaned.slice(1, 5)}-${cleaned.slice(5, 10)}-${cleaned.slice(10, 12)}-${cleaned[12]}`;
}
