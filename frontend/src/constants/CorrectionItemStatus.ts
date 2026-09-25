export const CorrectionItemStatus = ["PENDING", "RESOLVED"] as const;
export type CorrectionItemStatus = (typeof CorrectionItemStatus)[number];
export const CorrectionItemStatusText: Record<CorrectionItemStatus, string> = {
  PENDING: "待补正",
  RESOLVED: "已处理"
};

export const PlanRevisionAction = ["SUBMIT", "RETURN", "RESUBMIT", "APPROVE"] as const;
export type PlanRevisionAction = (typeof PlanRevisionAction)[number];
export const PlanRevisionActionText: Record<PlanRevisionAction, string> = {
  SUBMIT: "提交",
  RETURN: "退回补正",
  RESUBMIT: "重提修订",
  APPROVE: "批准"
};
