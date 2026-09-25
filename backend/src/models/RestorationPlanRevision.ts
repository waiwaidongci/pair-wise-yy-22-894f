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
