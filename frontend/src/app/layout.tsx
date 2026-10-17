import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'โปรแกรมบริหารจัดการเงินเดือนและค่าตอบแทน | โรงพยาบาลสามโคก',
  description:
    'โปรแกรมบริหารจัดการเงินเดือนและค่าตอบแทนบุคลากร โรงพยาบาลสามโคก จังหวัดปทุมธานี (Next.js + NestJS + Prisma + Supabase PostgreSQL)',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="antialiased">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
