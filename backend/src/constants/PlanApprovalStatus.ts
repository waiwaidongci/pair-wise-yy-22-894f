export const PlanApprovalStatus = ["DRAFT","SUBMITTED","RETURNED","APPROVED","REJECTED","ARCHIVED"] as const;
export type PlanApprovalStatus = (typeof PlanApprovalStatus)[number];
