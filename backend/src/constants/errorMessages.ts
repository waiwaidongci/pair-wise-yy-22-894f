export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "missing bearer token",
  RBAC_DENIED: "role denied",
  VALIDATION_FAILED: "invalid payload",
  RATE_LIMITED: "too many requests",
  PLAN_NOT_FOUND: "restoration plan not found",
  INVALID_PLAN_STATUS: "plan status does not allow this action",
  PLAN_LOCKED: "plan is returned and locked; method, risk assessment and version are frozen",
  PLAN_PENDING_CORRECTION: "plan is pending correction and cannot be approved directly",
  CORRECTION_ITEMS_REQUIRED: "at least one correction item with requirement and deadline is required",
  CORRECTION_ITEMS_UNRESOLVED: "correction items are not all resolved; resubmit is blocked",
  CORRECTION_ITEM_NOT_FOUND: "correction item not found",
  NOT_PLAN_OWNER: "only the current plan owner can handle correction items"
};
