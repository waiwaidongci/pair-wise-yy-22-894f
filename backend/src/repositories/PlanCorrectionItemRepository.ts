import { seed } from "../seed";
import type { PlanCorrectionItem } from "../models/PlanCorrectionItem";

const rows: PlanCorrectionItem[] = (seed.planCorrectionItem as unknown as PlanCorrectionItem[]).map((row) => ({ ...row }));
let nextId = rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;

export const planCorrectionItemRepository = {
  findAll: () => rows,
  findByPlan: (planId: number) => rows.filter((row) => row.plan_id === planId),
  findByPlanAndRevision: (planId: number, revisionNo: number) => rows.filter((row) => row.plan_id === planId && row.revision_no === revisionNo),
  findById: (id: number) => rows.find((row) => row.id === id),
  save: (row: Omit<PlanCorrectionItem, "id">) => {
    const saved: PlanCorrectionItem = { ...row, id: nextId++ };
    rows.push(saved);
    return saved;
  },
  update: (id: number, patch: Partial<PlanCorrectionItem>) => {
    const row = rows.find((item) => item.id === id);
    if (!row) return undefined;
    Object.assign(row, patch);
    return row;
  }
};
