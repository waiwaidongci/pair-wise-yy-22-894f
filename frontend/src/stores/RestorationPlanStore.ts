import { create } from "zustand";
import {
  listRestorationPlan,
  getRestorationPlanDetail,
  returnPlanForCorrection,
  resolveCorrectionItem,
  resubmitRestorationPlan,
  approveRestorationPlan
} from "../api/RestorationPlan";
import type { RestorationPlan } from "../types/RestorationPlan";
import type { PlanCorrectionItem } from "../types/PlanCorrectionItem";
import type { PlanRevision } from "../types/PlanRevision";
import type { Actor, CorrectionItemInput, ResubmitPayload } from "../mocks/localPlanWorkflow";
import { WorkflowError } from "../mocks/localPlanWorkflow";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";

type Notice = { kind: "ok" | "error"; text: string } | null;

type State = {
  rows: RestorationPlan[];
  corrections: PlanCorrectionItem[];
  revisions: PlanRevision[];
  selectedId: number | null;
  actor: Actor;
  loading: boolean;
  notice: Notice;
  setActor: (actor: Actor) => void;
  clearNotice: () => void;
  load: () => Promise<void>;
  select: (planId: number) => Promise<void>;
  returnForCorrection: (items: CorrectionItemInput[]) => Promise<boolean>;
  resolveItem: (itemId: number, resolutionNote: string) => Promise<boolean>;
  resubmit: (payload: ResubmitPayload) => Promise<boolean>;
  approve: () => Promise<boolean>;
};

const messageOf = (err: unknown) => (err instanceof WorkflowError ? ERROR_MESSAGES[err.code] : ERROR_MESSAGES.VALIDATION_FAILED);

export const useRestorationPlanStore = create<State>((set, get) => ({
  rows: [],
  corrections: [],
  revisions: [],
  selectedId: null,
  actor: { id: 1, role: "admin" },
  loading: false,
  notice: null,
  setActor: (actor) => set({ actor, notice: null }),
  clearNotice: () => set({ notice: null }),
  async load() {
    set({ loading: true });
    const rows = await listRestorationPlan(get().actor);
    set({ rows, loading: false });
    const selectedId = get().selectedId ?? rows.find((row) => row.approval_status === "RETURNED")?.id ?? rows[0]?.id ?? null;
    if (selectedId !== null) await get().select(selectedId);
  },
  async select(planId) {
    set({ selectedId: planId, notice: null });
    const detail = await getRestorationPlanDetail(planId, get().actor);
    set({ corrections: detail.corrections, revisions: detail.revisions });
  },
  async returnForCorrection(items) {
    const { selectedId, actor } = get();
    if (selectedId === null) return false;
    try {
      const detail = await returnPlanForCorrection(selectedId, items, actor);
      console.info(LOG_TEMPLATES.RestorationPlan[4], detail.plan.plan_title);
      set({ corrections: detail.corrections, revisions: detail.revisions });
      await get().load();
      set({ notice: { kind: "ok", text: "已退回补正，方法、风险评估和版本号已锁定" } });
      return true;
    } catch (err) {
      set({ notice: { kind: "error", text: messageOf(err) } });
      return false;
    }
  },
  async resolveItem(itemId, resolutionNote) {
    const { selectedId, actor } = get();
    if (selectedId === null) return false;
    try {
      await resolveCorrectionItem(selectedId, itemId, resolutionNote, actor);
      console.info(LOG_TEMPLATES.PlanCorrectionItem[1], `item#${itemId}`);
      await get().select(selectedId);
      await get().load();
      return true;
    } catch (err) {
      set({ notice: { kind: "error", text: messageOf(err) } });
      return false;
    }
  },
  async resubmit(payload) {
    const { selectedId, actor } = get();
    if (selectedId === null) return false;
    try {
      const detail = await resubmitRestorationPlan(selectedId, payload, actor);
      console.info(LOG_TEMPLATES.RestorationPlan[5], detail.plan.plan_title);
      set({ corrections: detail.corrections, revisions: detail.revisions });
      await get().load();
      set({ notice: { kind: "ok", text: `已重新提交，系统生成新修订 R${detail.plan.revision_no}（${detail.plan.version_no}）` } });
      return true;
    } catch (err) {
      set({ notice: { kind: "error", text: messageOf(err) } });
      return false;
    }
  },
  async approve() {
    const { selectedId, actor } = get();
    if (selectedId === null) return false;
    try {
      await approveRestorationPlan(selectedId, actor);
      console.info(LOG_TEMPLATES.RestorationPlan[6], `plan#${selectedId}`);
      await get().load();
      set({ notice: { kind: "ok", text: "方案已批准" } });
      return true;
    } catch (err) {
      set({ notice: { kind: "error", text: messageOf(err) } });
      return false;
    }
  }
}));
