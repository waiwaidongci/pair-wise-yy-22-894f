import type { RestorationPlan } from "../models/RestorationPlan";

export type RestorationPlanPayload = Partial<RestorationPlan>;
export type ActorPayload = { id: number; role: string };
