import type { RestorationPlan } from "./RestorationPlan";
import type { RestorationPlanCorrection } from "./RestorationPlanCorrection";

export interface RestorationPlanRevision {
  id: number;
  plan_id: number;
  revision_no: number;
  version_no: string;
  action: string;
  method_snapshot: string;
  risk_assessment_snapshot: string;
  review_opinion: string | null;
  actor_id: number;
  created_at: string;
}

export interface RestorationPlanDetail {
  plan: RestorationPlan;
  correction_items: RestorationPlanCorrection[];
  revisions: RestorationPlanRevision[];
  open_correction_count: number;
}
