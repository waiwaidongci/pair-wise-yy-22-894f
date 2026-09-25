export const createPlanRevisionDto = (overrides = {}) => ({
  id: 1,
  plan_id: 1,
  revision_no: 1,
  version_no: "V1.0",
  action: "SUBMIT",
  method_snapshot: "",
  risk_assessment_snapshot: "",
  review_opinion: null,
  actor_id: 1,
  created_at: new Date(0).toISOString(),
  ...overrides
});
