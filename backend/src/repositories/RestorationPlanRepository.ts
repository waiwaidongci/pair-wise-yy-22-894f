import { seed } from "../seed";
import type { RestorationPlan } from "../models/RestorationPlan";

const rows: RestorationPlan[] = (seed.restorationPlan as unknown as RestorationPlan[]).map((row) => ({ ...row }));

export const restorationPlanRepository = {
  findAll: () => rows,
  findById: (id: number) => rows.find((row) => row.id === id),
  save: (row: RestorationPlan) => { rows.push(row); return row; },
  update: (id: number, patch: Partial<RestorationPlan>) => {
    const row = rows.find((item) => item.id === id);
    if (!row) return undefined;
    Object.assign(row, patch);
    return row;
  }
};
