import { create } from 'zustand';

export type DashboardFilterState = {
  selectedPeriod: string;
  selectedYear: string;
  selectedDepartment: string;
  selectedPersonnelType: string;
  compareType: 'monthly' | 'yearly';
  keyword: string;
};

type DashboardStore = {
  filter: DashboardFilterState;
  setFilter: (values: Partial<DashboardFilterState>) => void;
  resetFilter: () => void;
  setPeriod: (period: string) => void;
  setDepartment: (department: string) => void;
  setKeyword: (keyword: string) => void;
};

const defaultFilter: DashboardFilterState = {
  selectedPeriod: 'กันยายน 2567',
  selectedYear: '2567',
  selectedDepartment: 'ทุกหน่วยงาน',
  selectedPersonnelType: 'ทั้งหมด',
  compareType: 'monthly',
  keyword: '',
};

export const useDashboardStore = create<DashboardStore>((set) => ({
  filter: defaultFilter,
  setFilter: (values) =>
    set((state) => ({
      filter: { ...state.filter, ...values },
    })),
  resetFilter: () => set({ filter: defaultFilter }),
  setPeriod: (period) =>
    set((state) => ({
      filter: { ...state.filter, selectedPeriod: period },
    })),
  setDepartment: (department) =>
    set((state) => ({
      filter: { ...state.filter, selectedDepartment: department },
    })),
  setKeyword: (keyword) =>
    set((state) => ({
      filter: { ...state.filter, keyword },
    })),
}));
