import { seed } from "../seed";
import type { RestorationPlanCorrection } from "../models/RestorationPlanCorrection";

const items: RestorationPlanCorrection[] = JSON.parse(JSON.stringify(seed.restorationPlanCorrection));
let nextId = items.reduce((max, item) => Math.max(max, item.id), 0) + 1;

export const restorationPlanCorrectionRepository = {
  findByPlanId: (planId: number) => items.filter((item) => item.plan_id === planId),
  findById: (id: number) => items.find((item) => item.id === id),
  create: (row: Omit<RestorationPlanCorrection, "id">) => {
    const item = { ...row, id: nextId++ };
    items.push(item);
    return item;
  },
  save: (row: RestorationPlanCorrection) => {
    const index = items.findIndex((item) => item.id === row.id);
    if (index >= 0) items[index] = row;
    return row;
  }
};
