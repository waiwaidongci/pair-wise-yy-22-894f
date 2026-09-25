export interface RestorationPlanCorrection {
  id: number;
  plan_id: number;
  revision_no: number;
  item_no: number;
  requirement: string;
  deadline: string;
  status: string;
  resolution_note: string | null;
  created_by: number;
  created_at: string;
  resolved_at: string | null;
}
