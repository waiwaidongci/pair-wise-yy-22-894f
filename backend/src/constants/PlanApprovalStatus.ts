export const PlanApprovalStatus = ["DRAFT","SUBMITTED","PENDING_CORRECTION","APPROVED","REJECTED","ARCHIVED"] as const;
export type PlanApprovalStatus = (typeof PlanApprovalStatus)[number];
