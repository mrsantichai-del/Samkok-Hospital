'use client';

import React, { useEffect, useState } from 'react';
import { SUPABASE_LOGO_URL, FALLBACK_LOGO_URL, apiFetch } from '@/lib/api';

interface HospitalLogoProps {
  className?: string;
  size?: number;
}

/**
 * คอมโพเนนต์แสดงตราสัญลักษณ์โรงพยาบาลสามโคก
 * ดึงรูปภาพจาก Supabase Storage Bucket: `hospital-assets` (https://spwtsuxwnrmcwmqihozf.supabase.co/storage/v1/object/public/hospital-assets/samkok-logo.jpg)
 * พร้อมระบบ Fallback อัตโนมัติหากยังไม่ได้อัปโหลดไฟล์หรือเครือข่ายขัดข้อง
 */
export const HospitalLogo: React.FC<HospitalLogoProps> = ({
  className = 'h-10 w-10',
}) => {
  const [logoSrc, setLogoSrc] = useState<string>(SUPABASE_LOGO_URL);

  useEffect(() => {
    // ตรวจสอบชื่อไฟล์ล่าสุดใน Supabase Bucket `hospital-assets` ผ่าน Backend API
    apiFetch<{ url: string | null }>('/logo-url')
      .then((res) => {
        if (res?.url) {
          setLogoSrc(res.url);
        }
      })
      .catch(() => {
        // ใช้ค่าเริ่มต้น SUPABASE_LOGO_URL
      });
  }, []);

  return (
    <img
      src={logoSrc}
      alt="ตราสัญลักษณ์โรงพยาบาลสามโคก"
      onError={() => {
        if (logoSrc !== FALLBACK_LOGO_URL) {
          setLogoSrc(FALLBACK_LOGO_URL);
        }
      }}
      className={`${className} rounded-full object-contain bg-white p-0.5 shadow-md shrink-0`}
    />
  );
};
