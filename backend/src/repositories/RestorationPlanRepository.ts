import { seed } from "../seed";
import type { RestorationPlan } from "../models/RestorationPlan";

const plans: RestorationPlan[] = JSON.parse(JSON.stringify(seed.restorationPlan));

export const restorationPlanRepository = {
  findAll: () => plans,
  findById: (id: number) => plans.find((plan) => plan.id === id),
  save: (row: RestorationPlan) => {
    const index = plans.findIndex((plan) => plan.id === row.id);
    if (index >= 0) plans[index] = row;
    else plans.push(row);
    return row;
  }
};
