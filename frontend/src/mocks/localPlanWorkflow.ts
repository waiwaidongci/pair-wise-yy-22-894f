import { mockData } from "./seedData";
import type { RestorationPlan } from "../types/RestorationPlan";
import type { PlanCorrectionItem } from "../types/PlanCorrectionItem";
import type { PlanRevision } from "../types/PlanRevision";
import { ERROR_CODES, type ErrorCode } from "../constants/errorCodes";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { formatRevision, nextVersionNo } from "../utils/formatters";

export type Actor = { id: number; role: string };
export type CorrectionItemInput = { requirement: string; deadline: string };
export type ResubmitPayload = { method?: string; risk_assessment?: string; change_note?: string };
export type PlanDetail = { plan: RestorationPlan; corrections: PlanCorrectionItem[]; revisions: PlanRevision[] };

export class WorkflowError extends Error {
  code: ErrorCode;
  constructor(code: ErrorCode) {
    super(ERROR_CODES[code]);
    this.code = code;
  }
}

const clone = <T>(rows: T): T => JSON.parse(JSON.stringify(rows)) as T;
const plans = clone(mockData.restorationPlan as unknown as RestorationPlan[]);
const corrections = clone(mockData.planCorrectionItem as unknown as PlanCorrectionItem[]);
const revisions = clone(mockData.planRevision as unknown as PlanRevision[]);
let nextCorrectionId = corrections.reduce((max, row) => Math.max(max, row.id), 0) + 1;
let nextRevisionId = revisions.reduce((max, row) => Math.max(max, row.id), 0) + 1;

const audit = (template: string, detail: string) => console.info(template, detail);

const mustGetPlan = (planId: number) => {
  const plan = plans.find((row) => row.id === planId);
  if (!plan) throw new WorkflowError("PLAN_NOT_FOUND");
  return plan;
};

const mustBeOwner = (plan: RestorationPlan, actor: Actor) => {
  if (actor.role !== "admin" && plan.owner_id !== actor.id) throw new WorkflowError("NOT_PLAN_OWNER");
};

const withOpenCount = (plan: RestorationPlan): RestorationPlan => ({
  ...plan,
  open_correction_count: corrections.filter((row) => row.plan_id === plan.id && row.revision_no === plan.revision_no && row.status === "OPEN").length
});

export const localPlanWorkflow = {
  list: (): RestorationPlan[] => plans.map(withOpenCount),

  detail: (planId: number): PlanDetail => {
    const plan = mustGetPlan(planId);
    return {
      plan: withOpenCount(plan),
      corrections: corrections
        .filter((row) => row.plan_id === planId)
        .sort((a, b) => b.revision_no - a.revision_no || a.item_no - b.item_no),
      revisions: revisions.filter((row) => row.plan_id === planId).sort((a, b) => b.revision_no - a.revision_no)
    };
  },

  returnForCorrection: (planId: number, items: CorrectionItemInput[], actor: Actor): PlanDetail => {
    const plan = mustGetPlan(planId);
    if (plan.approval_status !== "SUBMITTED") throw new WorkflowError("INVALID_PLAN_STATUS");
    const validItems = (items ?? []).filter((item) => item.requirement?.trim() && item.deadline?.trim());
    if (validItems.length === 0) throw new WorkflowError("CORRECTION_ITEMS_REQUIRED");
    const raisedAt = new Date().toISOString();
    validItems.forEach((item, index) => {
      corrections.push({
        id: nextCorrectionId++,
        plan_id: plan.id,
        revision_no: plan.revision_no,
        item_no: index + 1,
        requirement: item.requirement.trim(),
        deadline: item.deadline.trim(),
        raised_by: actor.id,
        raised_at: raisedAt,
        status: "OPEN",
        resolution_note: "",
        resolved_by: null,
        resolved_at: null
      });
    });
    plan.approval_status = "RETURNED";
    audit(LOG_TEMPLATES.RestorationPlan[4], `${plan.plan_title} ${formatRevision(plan.revision_no)} items=${validItems.length}`);
    audit(LOG_TEMPLATES.PlanRevision[2], `${plan.version_no} locked`);
    return localPlanWorkflow.detail(planId);
  },

  resolveItem: (planId: number, itemId: number, resolutionNote: string, actor: Actor): PlanCorrectionItem => {
    const plan = mustGetPlan(planId);
    if (plan.approval_status !== "RETURNED") throw new WorkflowError("INVALID_PLAN_STATUS");
    mustBeOwner(plan, actor);
    const item = corrections.find((row) => row.id === itemId);
    if (!item || item.plan_id !== planId || item.revision_no !== plan.revision_no) throw new WorkflowError("CORRECTION_ITEM_NOT_FOUND");
    if (!resolutionNote?.trim()) throw new WorkflowError("VALIDATION_FAILED");
    item.status = "RESOLVED";
    item.resolution_note = resolutionNote.trim();
    item.resolved_by = actor.id;
    item.resolved_at = new Date().toISOString();
    audit(LOG_TEMPLATES.PlanCorrectionItem[1], `item#${itemId} ${formatRevision(plan.revision_no)}`);
    return item;
  },

  resubmit: (planId: number, payload: ResubmitPayload, actor: Actor): PlanDetail => {
    const plan = mustGetPlan(planId);
    if (plan.approval_status !== "RETURNED") throw new WorkflowError("INVALID_PLAN_STATUS");
    mustBeOwner(plan, actor);
    const items = corrections.filter((row) => row.plan_id === planId && row.revision_no === plan.revision_no);
    if (items.some((item) => item.status !== "RESOLVED")) throw new WorkflowError("CORRECTION_ITEMS_UNRESOLVED");
    plan.revision_no += 1;
    plan.version_no = nextVersionNo(plan.version_no);
    plan.method = payload.method?.trim() || plan.method;
    plan.risk_assessment = payload.risk_assessment?.trim() || plan.risk_assessment;
    plan.approval_status = "SUBMITTED";
    revisions.push({
      id: nextRevisionId++,
      plan_id: planId,
      revision_no: plan.revision_no,
      version_no: plan.version_no,
      method: plan.method,
      risk_assessment: plan.risk_assessment,
      change_note: payload.change_note?.trim() || `resubmit after correction round ${plan.revision_no - 1}`,
      reason: "RESUBMIT",
      created_by: actor.id,
      created_at: new Date().toISOString()
    });
    audit(LOG_TEMPLATES.RestorationPlan[5], `${plan.plan_title} ${formatRevision(plan.revision_no)} ${plan.version_no}`);
    return localPlanWorkflow.detail(planId);
  },

  approve: (planId: number, actor: Actor): RestorationPlan => {
    const plan = mustGetPlan(planId);
    if (plan.approval_status === "RETURNED") throw new WorkflowError("PLAN_PENDING_CORRECTION");
    if (plan.approval_status !== "SUBMITTED") throw new WorkflowError("INVALID_PLAN_STATUS");
    plan.approval_status = "APPROVED";
    audit(LOG_TEMPLATES.RestorationPlan[6], `${plan.plan_title} by ${actor.id}`);
    return withOpenCount(plan);
  }
};
