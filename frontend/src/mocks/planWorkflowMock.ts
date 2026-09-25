import { mockData } from "./seedData";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import type { RestorationPlan } from "../types/RestorationPlan";
import type { RestorationPlanCorrection } from "../types/RestorationPlanCorrection";
import type { RestorationPlanDetail, RestorationPlanRevision } from "../types/RestorationPlanRevision";

const plans: RestorationPlan[] = JSON.parse(JSON.stringify(mockData.restorationPlan));
const items: RestorationPlanCorrection[] = JSON.parse(JSON.stringify(mockData.restorationPlanCorrection));
const revisions: RestorationPlanRevision[] = JSON.parse(JSON.stringify(mockData.restorationPlanRevision));

let itemId = items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
let revisionId = revisions.reduce((max, revision) => Math.max(max, revision.id), 0) + 1;

export interface MockHttpError extends Error {
  status: number;
  code: string;
}

function fail(status: number, code: string): never {
  throw Object.assign(new Error(ERROR_MESSAGES[code] ?? code), { status, code }) as MockHttpError;
}

const requirePlan = (planId: number) => {
  const plan = plans.find((entry) => entry.id === planId);
  if (!plan) fail(404, "PLAN_NOT_FOUND");
  return plan;
};

const detail = (planId: number): RestorationPlanDetail => {
  const plan = requirePlan(planId);
  const planItems = items.filter((item) => item.plan_id === planId);
  const planRevisions = revisions.filter((revision) => revision.plan_id === planId);
  return {
    plan: JSON.parse(JSON.stringify(plan)),
    correction_items: JSON.parse(JSON.stringify(planItems)),
    revisions: JSON.parse(JSON.stringify(planRevisions)),
    open_correction_count: planItems.filter((item) => item.status === "PENDING").length
  };
};

const bumpVersionNo = (revisionNo: number) => `V${revisionNo}.0`;

export const planWorkflowMock = {
  list: (): RestorationPlan[] =>
    (JSON.parse(JSON.stringify(plans)) as RestorationPlan[]).map((plan) => ({
      ...plan,
      open_correction_count: items.filter((item) => item.plan_id === plan.id && item.status === "PENDING").length
    })),
  detail,

  returnPlan(planId: number, actorId: number, payload: { opinion?: string; items: Array<{ requirement: string; deadline: string }> }): RestorationPlanDetail {
    const plan = requirePlan(planId);
    if (plan.approval_status !== "SUBMITTED") fail(409, "INVALID_PLAN_STATUS");
    const inputs = payload?.items ?? [];
    if (inputs.length === 0) fail(400, "VALIDATION_FAILED");
    inputs.forEach((input) => {
      if (!String(input.requirement ?? "").trim()) fail(400, "CORRECTION_REQUIREMENT_MISSING");
      if (!String(input.deadline ?? "").trim()) fail(400, "CORRECTION_DEADLINE_MISSING");
    });

    const now = new Date().toISOString();
    inputs.forEach((input, index) => {
      items.push({
        id: itemId++,
        plan_id: plan.id,
        revision_no: plan.revision_no,
        item_no: index + 1,
        requirement: input.requirement.trim(),
        deadline: input.deadline,
        status: "PENDING",
        resolution_note: null,
        created_by: actorId,
        created_at: now,
        resolved_at: null
      });
    });

    plan.approval_status = "PENDING_CORRECTION";
    plan.reviewer_id = actorId;
    plan.current_assignee_id = plan.owner_id;

    revisions.push({
      id: revisionId++,
      plan_id: plan.id,
      revision_no: plan.revision_no,
      version_no: plan.version_no,
      action: "RETURN",
      method_snapshot: plan.method,
      risk_assessment_snapshot: plan.risk_assessment,
      review_opinion: payload?.opinion ?? null,
      actor_id: actorId,
      created_at: now
    });
    return detail(plan.id);
  },

  resolveItem(planId: number, itemIdValue: number, actorId: number, resolutionNote: string): RestorationPlanDetail {
    const plan = requirePlan(planId);
    const item = items.find((entry) => entry.id === itemIdValue && entry.plan_id === planId);
    if (!item) fail(404, "CORRECTION_ITEM_NOT_FOUND");
    if (plan.approval_status !== "PENDING_CORRECTION" || item.status !== "PENDING") fail(409, "INVALID_PLAN_STATUS");
    if (!String(resolutionNote ?? "").trim()) fail(400, "CORRECTION_RESOLUTION_MISSING");
    item.status = "RESOLVED";
    item.resolution_note = resolutionNote.trim();
    item.resolved_at = new Date().toISOString();
    void actorId;
    return detail(planId);
  },

  resubmit(planId: number, actorId: number, payload: { method?: string; risk_assessment?: string }): RestorationPlanDetail {
    const plan = requirePlan(planId);
    if (plan.approval_status !== "PENDING_CORRECTION") fail(409, "INVALID_PLAN_STATUS");
    const planItems = items.filter((item) => item.plan_id === planId);
    if (planItems.some((item) => item.status === "PENDING")) fail(409, "CORRECTION_ITEMS_OPEN");

    plan.method = payload?.method?.trim() || plan.method;
    plan.risk_assessment = payload?.risk_assessment?.trim() || plan.risk_assessment;
    plan.revision_no += 1;
    plan.version_no = bumpVersionNo(plan.revision_no);
    plan.approval_status = "SUBMITTED";
    plan.current_assignee_id = plan.reviewer_id ?? actorId;

    revisions.push({
      id: revisionId++,
      plan_id: plan.id,
      revision_no: plan.revision_no,
      version_no: plan.version_no,
      action: "RESUBMIT",
      method_snapshot: plan.method,
      risk_assessment_snapshot: plan.risk_assessment,
      review_opinion: `第 ${plan.revision_no} 次重提，补正清单 ${planItems.length} 条已逐条处理。`,
      actor_id: actorId,
      created_at: new Date().toISOString()
    });
    return detail(plan.id);
  },

  approve(planId: number, actorId: number, opinion?: string): RestorationPlanDetail {
    const plan = requirePlan(planId);
    if (plan.approval_status !== "SUBMITTED") fail(409, "INVALID_PLAN_STATUS");
    if (items.some((item) => item.plan_id === planId && item.status === "PENDING")) fail(409, "CORRECTION_ITEMS_OPEN");
    plan.approval_status = "APPROVED";
    plan.current_assignee_id = plan.owner_id;
    revisions.push({
      id: revisionId++,
      plan_id: plan.id,
      revision_no: plan.revision_no,
      version_no: plan.version_no,
      action: "APPROVE",
      method_snapshot: plan.method,
      risk_assessment_snapshot: plan.risk_assessment,
      review_opinion: opinion ?? null,
      actor_id: actorId,
      created_at: new Date().toISOString()
    });
    return detail(plan.id);
  }
};
