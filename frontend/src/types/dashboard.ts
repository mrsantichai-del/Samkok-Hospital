export interface DashboardSummary {
  totalEmployees: number;
  totalPersonnelCost: number;
  totalBaseSalary: number;
  totalExtraIncome: number;
  totalDeduction: number;
  remainingBudget: number;
}

export type DashboardFilterState = {
  selectedPeriod: string;
  selectedYear: string;
  selectedDepartment: string;
  selectedPersonnelType: string;
  compareType: 'monthly' | 'yearly';
  keyword: string;
};
