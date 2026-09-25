export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "missing bearer token",
  RBAC_DENIED: "role denied",
  VALIDATION_FAILED: "invalid payload",
  RATE_LIMITED: "too many requests",
  PLAN_NOT_FOUND: "restoration plan not found",
  CORRECTION_ITEM_NOT_FOUND: "correction item not found",
  INVALID_PLAN_STATUS: "plan status does not allow this action",
  PLAN_FIELDS_LOCKED: "method, risk assessment and version_no are locked while pending correction",
  CORRECTION_ITEMS_OPEN: "every correction item must be handled before resubmit or approval",
  CORRECTION_REQUIREMENT_MISSING: "correction item requirement is required",
  CORRECTION_DEADLINE_MISSING: "correction item deadline is required",
  CORRECTION_RESOLUTION_MISSING: "correction item resolution note is required"
};
