export const CorrectionItemStatus = ["PENDING","RESOLVED"] as const;
export type CorrectionItemStatus = (typeof CorrectionItemStatus)[number];

export const PlanRevisionAction = ["SUBMIT","RETURN","RESUBMIT","APPROVE"] as const;
export type PlanRevisionAction = (typeof PlanRevisionAction)[number];
