import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor: string;
  trend?: {
    label: string;
    value: number;
    isUp: boolean;
  };
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon, bgColor, trend }) => {
  return (
    <div className={`rounded-xl border border-slate-200 p-4 shadow-sm ${bgColor}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-white/80 p-2.5 text-blue-600 shadow-sm">{icon}</div>
          <div>
            <p className="text-xs font-medium text-slate-500">{title}</p>
            <p className="text-xl font-bold text-slate-900">{value}</p>
          </div>
        </div>
      </div>
      {trend && (
        <div className={`mt-2 flex items-center gap-1.5 text-xs ${trend.isUp ? 'text-emerald-600' : 'text-red-600'}`}>
          <span className="font-semibold">
            {trend.isUp ? '▲ เพิ่มขึ้น' : '▼ ลดลง'} {trend.value}%
          </span>
          <span className="text-slate-400">จากเดือนก่อน</span>
        </div>
      )}
    </div>
  );
};
