import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppMode = 'simple' | 'enterprise';

interface SettingsState {
  appMode: AppMode;
  currency: string;
  dateFormat: string;
  setAppMode: (mode: AppMode) => void;
  setCurrency: (currency: string) => void;
  setDateFormat: (format: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      appMode: 'enterprise', // Default to enterprise initially so they see all features
      currency: 'ج.م',
      dateFormat: 'ar-EG',
      setAppMode: (mode) => set({ appMode: mode }),
      setCurrency: (currency) => set({ currency }),
      setDateFormat: (format) => set({ dateFormat: format }),
    }),
    {
      name: 'hassad-settings',
    }
  )
);
