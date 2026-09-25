import type { PlanRevision } from "../types/PlanRevision";

export const createDefaultPlanRevision = (overrides: Partial<PlanRevision> = {}): PlanRevision => ({
  id: 1 as never,
  plan_id: 1 as never,
  revision_no: 1 as never,
  version_no: "V1.0" as never,
  method: "method 1" as never,
  risk_assessment: "risk assessment 1" as never,
  change_note: "initial draft" as never,
  reason: "CREATE" as never,
  created_by: 1 as never,
  created_at: "2026-06-11T09:00:00Z" as never,
  ...overrides
});

export const createPlanRevisionForm = createDefaultPlanRevision;
export const createPlanRevisionResponse = createDefaultPlanRevision;
