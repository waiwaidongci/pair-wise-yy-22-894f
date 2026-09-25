export interface RestorationPlanUpdatePayload {
  plan_title?: string;
  method?: string;
  risk_assessment?: string;
}

export interface CorrectionItemInput {
  requirement: string;
  deadline: string;
}

export interface PlanReturnPayload {
  opinion?: string;
  items: CorrectionItemInput[];
}

export interface PlanResubmitPayload {
  method?: string;
  risk_assessment?: string;
}

export interface CorrectionResolvePayload {
  resolution_note: string;
}
