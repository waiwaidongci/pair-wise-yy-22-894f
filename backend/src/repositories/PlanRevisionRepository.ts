import { seed } from "../seed";
import type { PlanRevision } from "../models/PlanRevision";

const rows: PlanRevision[] = (seed.planRevision as unknown as PlanRevision[]).map((row) => ({ ...row }));
let nextId = rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;

export const planRevisionRepository = {
  findAll: () => rows,
  findByPlan: (planId: number) => rows.filter((row) => row.plan_id === planId).sort((a, b) => b.revision_no - a.revision_no),
  save: (row: Omit<PlanRevision, "id">) => {
    const saved: PlanRevision = { ...row, id: nextId++ };
    rows.push(saved);
    return saved;
  }
};
