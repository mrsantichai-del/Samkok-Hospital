/**
 * ฟังก์ชันแปลงตัวเลขจำนวนเงินเป็นตัวอักษรภาษาไทย (Bahttext)
 * อ้างอิงตามหัวข้อ 2.2.6 สำหรับใบแจ้งยอดเงินเดือนและหนังสือรับรองภาษี 50 ทวิ
 */
export function bahtText(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num) || num === 0) return 'ศูนย์บาทถ้วน';

  const thaiNumbers = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const thaiPositions = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

  const convertInteger = (intStr: string): string => {
    if (intStr.length > 6) {
      const millions = intStr.slice(0, intStr.length - 6);
      const remainder = intStr.slice(intStr.length - 6);
      return convertInteger(millions) + 'ล้าน' + convertInteger(remainder);
    }

    let result = '';
    const len = intStr.length;
    for (let i = 0; i < len; i++) {
      const digit = parseInt(intStr.charAt(i), 10);
      const pos = len - i - 1;
      if (digit === 0) continue;

      if (pos === 1 && digit === 1) {
        result += 'สิบ';
      } else if (pos === 1 && digit === 2) {
        result += 'ยี่สิบ';
      } else if (pos === 0 && digit === 1 && len > 1 && intStr !== '01') {
        const prevNonZero = intStr.slice(0, len - 1).replace(/0/g, '').length > 0;
        result += prevNonZero ? 'เอ็ด' : 'หนึ่ง';
      } else {
        result += thaiNumbers[digit] + thaiPositions[pos];
      }
    }
    return result;
  };

  const fixed = Math.abs(num).toFixed(2);
  const [bahtPart, satangPart] = fixed.split('.');

  const bahtWords = parseInt(bahtPart, 10) > 0 ? convertInteger(bahtPart) + 'บาท' : '';
  const satangVal = parseInt(satangPart, 10);

  if (satangVal === 0) {
    return (num < 0 ? 'ลบ' : '') + (bahtWords || 'ศูนย์บาท') + 'ถ้วน';
  } else {
    const satangWords = convertInteger(String(satangVal)) + 'สตางค์';
    return (num < 0 ? 'ลบ' : '') + bahtWords + satangWords;
  }
}
