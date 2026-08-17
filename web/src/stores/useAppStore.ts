import { create } from 'zustand';

export type ActiveTab = 'dashboard' | 'services' | 'hosts' | 'containers' | 'topology' | 'incidents' | 'optimizer' | 'settings';

interface AppState {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;

  // User Feature Controls (Stored locally)
  isOptimizerEnabled: boolean;
  toggleOptimizer: () => void;
  isCorrelationEnabled: boolean;
  toggleCorrelation: () => void;
  isSensorsEnabled: boolean;
  toggleSensors: () => void;
}

const getStoredBool = (key: string, defaultValue: boolean): boolean => {
  const val = localStorage.getItem(key);
  return val !== null ? val === 'true' : defaultValue;
};

export const useAppStore = create<AppState>((set) => ({
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),
  isCommandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  selectedCategory: '',
  setSelectedCategory: (category) => set({ selectedCategory: category }),

  // User Feature Controls
  isOptimizerEnabled: getStoredBool('kizuna_opt_enabled', true),
  toggleOptimizer: () =>
    set((state) => {
      const next = !state.isOptimizerEnabled;
      localStorage.setItem('kizuna_opt_enabled', String(next));
      return { isOptimizerEnabled: next };
    }),

  isCorrelationEnabled: getStoredBool('kizuna_corr_enabled', true),
  toggleCorrelation: () =>
    set((state) => {
      const next = !state.isCorrelationEnabled;
      localStorage.setItem('kizuna_corr_enabled', String(next));
      return { isCorrelationEnabled: next };
    }),

  isSensorsEnabled: getStoredBool('kizuna_sens_enabled', true),
  toggleSensors: () =>
    set((state) => {
      const next = !state.isSensorsEnabled;
      localStorage.setItem('kizuna_sens_enabled', String(next));
      return { isSensorsEnabled: next };
    }),
}));
