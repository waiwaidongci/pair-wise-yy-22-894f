export const createCorrectionItemDto = (overrides = {}) => ({
  id: 1,
  plan_id: 1,
  revision_no: 1,
  item_no: 1,
  requirement: "",
  deadline: "",
  status: "PENDING",
  resolution_note: null,
  created_by: 1,
  created_at: new Date(0).toISOString(),
  resolved_at: null,
  ...overrides
});
