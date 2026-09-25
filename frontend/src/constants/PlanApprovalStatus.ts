export const PlanApprovalStatus = ["DRAFT","SUBMITTED","PENDING_CORRECTION","APPROVED","REJECTED","ARCHIVED"] as const;
export type PlanApprovalStatus = (typeof PlanApprovalStatus)[number];
export const PlanApprovalStatusText: Record<PlanApprovalStatus, string> = {
  DRAFT: "草稿",
  SUBMITTED: "待审批",
  PENDING_CORRECTION: "待补正",
  APPROVED: "已批准",
  REJECTED: "已否决",
  ARCHIVED: "已归档"
};
