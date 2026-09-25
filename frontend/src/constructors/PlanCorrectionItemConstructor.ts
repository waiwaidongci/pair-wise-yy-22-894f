import type { PlanCorrectionItem } from "../types/PlanCorrectionItem";

export const createDefaultPlanCorrectionItem = (overrides: Partial<PlanCorrectionItem> = {}): PlanCorrectionItem => ({
  id: 1 as never,
  plan_id: 1 as never,
  revision_no: 1 as never,
  item_no: 1 as never,
  requirement: "correction requirement 1" as never,
  deadline: "2026-07-05" as never,
  raised_by: 90 as never,
  raised_at: "2026-06-25T09:00:00Z" as never,
  status: "OPEN" as never,
  resolution_note: "" as never,
  resolved_by: null as never,
  resolved_at: null as never,
  ...overrides
});

export const createPlanCorrectionItemForm = createDefaultPlanCorrectionItem;
export const createPlanCorrectionItemResponse = createDefaultPlanCorrectionItem;
