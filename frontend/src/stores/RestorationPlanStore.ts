import { create } from "zustand";
import {
  listRestorationPlan,
  getRestorationPlanDetail,
  returnRestorationPlan,
  resolveCorrectionItem,
  resubmitRestorationPlan,
  approveRestorationPlan
} from "../api/RestorationPlan";
import type { RestorationPlan } from "../types/RestorationPlan";
import type { RestorationPlanDetail } from "../types/RestorationPlanRevision";

type State = {
  rows: RestorationPlan[];
  loading: boolean;
  detail: RestorationPlanDetail | null;
  detailLoading: boolean;
  actionError: string | null;
  load: () => Promise<void>;
  selectPlan: (id: number) => Promise<void>;
  returnPlan: (id: number, payload: { opinion?: string; items: Array<{ requirement: string; deadline: string }> }) => Promise<boolean>;
  resolveItem: (planId: number, itemId: number, resolutionNote: string) => Promise<boolean>;
  resubmit: (id: number, payload?: { method?: string; risk_assessment?: string }) => Promise<boolean>;
  approve: (id: number, opinion?: string) => Promise<boolean>;
  clearError: () => void;
};

const errorText = (error: unknown) => (error instanceof Error ? error.message : "操作失败，请稍后再试");

export const useRestorationPlanStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  detail: null,
  detailLoading: false,
  actionError: null,

  async load() {
    set({ loading: true });
    try {
      set({ rows: await listRestorationPlan(), loading: false });
    } catch (error) {
      set({ loading: false, actionError: errorText(error) });
    }
  },

  async selectPlan(id) {
    set({ detailLoading: true, actionError: null });
    try {
      set({ detail: await getRestorationPlanDetail(id), detailLoading: false });
    } catch (error) {
      set({ detail: null, detailLoading: false, actionError: errorText(error) });
    }
  },

  async returnPlan(id, payload) {
    try {
      const detail = await returnRestorationPlan(id, payload);
      set({ detail, actionError: null });
      await get().load();
      return true;
    } catch (error) {
      set({ actionError: errorText(error) });
      return false;
    }
  },

  async resolveItem(planId, itemId, resolutionNote) {
    try {
      const detail = await resolveCorrectionItem(planId, itemId, resolutionNote);
      set({ detail, actionError: null });
      return true;
    } catch (error) {
      set({ actionError: errorText(error) });
      return false;
    }
  },

  async resubmit(id, payload) {
    try {
      const detail = await resubmitRestorationPlan(id, payload);
      set({ detail, actionError: null });
      await get().load();
      return true;
    } catch (error) {
      set({ actionError: errorText(error) });
      return false;
    }
  },

  async approve(id, opinion) {
    try {
      const detail = await approveRestorationPlan(id, opinion);
      set({ detail, actionError: null });
      await get().load();
      return true;
    } catch (error) {
      set({ actionError: errorText(error) });
      return false;
    }
  },

  clearError() {
    set({ actionError: null });
  }
}));
