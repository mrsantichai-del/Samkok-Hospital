'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import ExecutiveDashboardPage from '../reports/executive-dashboard/page';

export default function MainDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const role = user?.role || 'FINANCE';
    if (role === 'ADMIN') {
      router.replace('/settings/users');
    } else if (role === 'FINANCE') {
      router.replace('/employees');
    } else if (role === 'EMPLOYEE') {
      router.replace('/my-payslips');
    }
  }, [user?.role, router]);

  if (user?.role === 'EXECUTIVE') {
    return <ExecutiveDashboardPage />;
  }

  return null;
}
