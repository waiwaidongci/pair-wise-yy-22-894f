export interface RestorationPlan {
  id: number;
  relic_id: number;
  damage_record_id: number;
  plan_title: string;
  method: string;
  risk_assessment: string;
  version_no: string;
  revision_no: number;
  approval_status: string;
  owner_id: number;
  reviewer_id: number | null;
  current_assignee_id: number;
  open_correction_count?: number;
}
