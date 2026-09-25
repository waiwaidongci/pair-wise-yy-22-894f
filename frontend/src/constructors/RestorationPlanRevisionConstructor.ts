import type { RestorationPlanRevision } from "../types/RestorationPlanRevision";

export const createDefaultPlanRevision = (overrides: Partial<RestorationPlanRevision> = {}): RestorationPlanRevision => ({
  id: 0,
  plan_id: 0,
  revision_no: 1,
  version_no: "V1.0",
  action: "SUBMIT",
  method_snapshot: "",
  risk_assessment_snapshot: "",
  review_opinion: null,
  actor_id: 0,
  created_at: new Date(0).toISOString(),
  ...overrides
});
