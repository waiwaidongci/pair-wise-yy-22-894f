import type { RestorationPlanCorrection } from "../types/RestorationPlanCorrection";

export const createDefaultCorrectionItem = (overrides: Partial<RestorationPlanCorrection> = {}): RestorationPlanCorrection => ({
  id: 0,
  plan_id: 0,
  revision_no: 1,
  item_no: 1,
  requirement: "",
  deadline: "",
  status: "PENDING",
  resolution_note: null,
  created_by: 0,
  created_at: new Date(0).toISOString(),
  resolved_at: null,
  ...overrides
});

export const createCorrectionItemForm = (item_no: number, plan_id: number, revision_no: number) =>
  createDefaultCorrectionItem({ item_no, plan_id, revision_no });
