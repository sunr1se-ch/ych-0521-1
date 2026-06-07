import { create } from 'zustand';
import { umbrellaApi, stagnationApi } from '../services/api';
import type {
  UmbrellaListItem,
  UmbrellaDetail,
  StagnationWithUmbrella,
} from '@shared/types';

interface UmbrellaState {
  umbrellas: UmbrellaListItem[];
  umbrellaDetail: UmbrellaDetail | null;
  stagnations: StagnationWithUmbrella[];
  loading: boolean;
  error: string | null;

  fetchUmbrellas: (status?: string, search?: string) => Promise<void>;
  fetchUmbrellaDetail: (id: string) => Promise<void>;
  fetchStagnations: (resolved?: boolean) => Promise<void>;
  clearError: () => void;
}

export const useUmbrellaStore = create<UmbrellaState>((set) => ({
  umbrellas: [],
  umbrellaDetail: null,
  stagnations: [],
  loading: false,
  error: null,

  fetchUmbrellas: async (status, search) => {
    set({ loading: true, error: null });
    try {
      const data = await umbrellaApi.getUmbrellas(status, search);
      set({ umbrellas: data, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '获取伞号列表失败', loading: false });
    }
  },

  fetchUmbrellaDetail: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await umbrellaApi.getUmbrellaDetail(id);
      set({ umbrellaDetail: data, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '获取伞号详情失败', loading: false });
    }
  },

  fetchStagnations: async (resolved) => {
    set({ loading: true, error: null });
    try {
      const data = await stagnationApi.getStagnations(resolved);
      set({ stagnations: data, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '获取停滞列表失败', loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
