import { restorationPlanRepository } from "../repositories/RestorationPlanRepository";
import { planCorrectionItemRepository } from "../repositories/PlanCorrectionItemRepository";
import { planRevisionRepository } from "../repositories/PlanRevisionRepository";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import type { ErrorCode } from "../constants/errorCodes";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { toAuditTarget, formatRevisionLabel, nextVersionNo } from "../utils/formatters";
import type { RestorationPlan } from "../models/RestorationPlan";
import type { ActorPayload } from "../types/RestorationPlanPayload";
import type { CorrectionItemInput } from "../types/PlanCorrectionItemPayload";
import type { ResubmitPlanPayload } from "../types/PlanRevisionPayload";

const fail = (code: ErrorCode, status = 400): never => {
  const err = new Error(ERROR_MESSAGES[code]) as Error & { status: number; code: string };
  err.status = status;
  err.code = ERROR_CODES[code];
  throw err;
};

const audit = (template: string, target: string, detail: string) => console.info(template, target, detail);

const mustGetPlan = (id: number) => {
  const plan = restorationPlanRepository.findById(id);
  if (!plan) return fail("PLAN_NOT_FOUND", 404);
  return plan;
};

const mustBeOwner = (plan: RestorationPlan, actor: ActorPayload) => {
  if (actor.role !== "admin" && plan.owner_id !== actor.id) return fail("NOT_PLAN_OWNER", 403);
};

const withOpenCount = (plan: RestorationPlan) => ({
  ...plan,
  open_correction_count: planCorrectionItemRepository
    .findByPlanAndRevision(plan.id, plan.revision_no)
    .filter((item) => item.status === "OPEN").length
});

export const restorationPlanService = {
  list: () => restorationPlanRepository.findAll().map(withOpenCount),

  detail: (id: number) => {
    const plan = mustGetPlan(id);
    return {
      plan: withOpenCount(plan),
      corrections: planCorrectionItemRepository
        .findByPlan(id)
        .slice()
        .sort((a, b) => b.revision_no - a.revision_no || a.item_no - b.item_no),
      revisions: planRevisionRepository.findByPlan(id)
    };
  },

  create: (row: RestorationPlan, actor: ActorPayload) => {
    const saved = restorationPlanRepository.save(row);
    planRevisionRepository.save({
      plan_id: saved.id,
      revision_no: saved.revision_no,
      version_no: saved.version_no,
      method: saved.method,
      risk_assessment: saved.risk_assessment,
      change_note: "initial draft",
      reason: "CREATE",
      created_by: actor.id,
      created_at: new Date().toISOString()
    });
    audit(LOG_TEMPLATES.RestorationPlan[0], toAuditTarget("RestorationPlan", saved.id), formatRevisionLabel(saved.revision_no));
    return saved;
  },

  update: (id: number, patch: Partial<RestorationPlan>, actor: ActorPayload) => {
    const plan = mustGetPlan(id);
    const touchesLocked = ["method", "risk_assessment", "version_no"].some((field) => field in patch);
    if (plan.approval_status === "RETURNED" && touchesLocked) {
      audit(LOG_TEMPLATES.RestorationPlan[7], toAuditTarget("RestorationPlan", id), "locked field write rejected");
      return fail("PLAN_LOCKED", 409);
    }
    mustBeOwner(plan, actor);
    const saved = restorationPlanRepository.update(id, patch);
    audit(LOG_TEMPLATES.RestorationPlan[1], toAuditTarget("RestorationPlan", id), Object.keys(patch).join(","));
    return saved;
  },

  returnForCorrection: (id: number, items: CorrectionItemInput[], actor: ActorPayload) => {
    const plan = mustGetPlan(id);
    if (plan.approval_status !== "SUBMITTED") return fail("INVALID_PLAN_STATUS", 409);
    const validItems = (items ?? []).filter((item) => item.requirement?.trim() && item.deadline?.trim());
    if (validItems.length === 0) return fail("CORRECTION_ITEMS_REQUIRED");
    const raisedAt = new Date().toISOString();
    const raised = validItems.map((item, index) =>
      planCorrectionItemRepository.save({
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
      })
    );
    restorationPlanRepository.update(id, { approval_status: "RETURNED" });
    audit(LOG_TEMPLATES.RestorationPlan[4], toAuditTarget("RestorationPlan", id), `${formatRevisionLabel(plan.revision_no)} items=${raised.length}`);
    raised.forEach((item) => audit(LOG_TEMPLATES.PlanCorrectionItem[0], toAuditTarget("PlanCorrectionItem", item.id), item.deadline));
    audit(LOG_TEMPLATES.PlanRevision[2], toAuditTarget("RestorationPlan", id), `${plan.version_no} locked`);
    return restorationPlanService.detail(id);
  },

  resolveCorrectionItem: (planId: number, itemId: number, resolutionNote: string, actor: ActorPayload) => {
    const plan = mustGetPlan(planId);
    if (plan.approval_status !== "RETURNED") return fail("INVALID_PLAN_STATUS", 409);
    mustBeOwner(plan, actor);
    const item = planCorrectionItemRepository.findById(itemId);
    if (!item || item.plan_id !== planId || item.revision_no !== plan.revision_no) return fail("CORRECTION_ITEM_NOT_FOUND", 404);
    if (!resolutionNote?.trim()) return fail("VALIDATION_FAILED");
    const saved = planCorrectionItemRepository.update(itemId, {
      status: "RESOLVED",
      resolution_note: resolutionNote.trim(),
      resolved_by: actor.id,
      resolved_at: new Date().toISOString()
    });
    audit(LOG_TEMPLATES.PlanCorrectionItem[1], toAuditTarget("PlanCorrectionItem", itemId), formatRevisionLabel(plan.revision_no));
    return saved;
  },

  resubmit: (id: number, payload: ResubmitPlanPayload, actor: ActorPayload) => {
    const plan = mustGetPlan(id);
    if (plan.approval_status !== "RETURNED") return fail("INVALID_PLAN_STATUS", 409);
    mustBeOwner(plan, actor);
    const items = planCorrectionItemRepository.findByPlanAndRevision(id, plan.revision_no);
    if (items.some((item) => item.status !== "RESOLVED")) return fail("CORRECTION_ITEMS_UNRESOLVED", 409);
    const nextRevisionNo = plan.revision_no + 1;
    const nextPlan = {
      revision_no: nextRevisionNo,
      version_no: nextVersionNo(plan.version_no),
      method: payload.method?.trim() || plan.method,
      risk_assessment: payload.risk_assessment?.trim() || plan.risk_assessment,
      approval_status: "SUBMITTED"
    };
    restorationPlanRepository.update(id, nextPlan);
    planRevisionRepository.save({
      plan_id: id,
      revision_no: nextRevisionNo,
      version_no: nextPlan.version_no,
      method: nextPlan.method,
      risk_assessment: nextPlan.risk_assessment,
      change_note: payload.change_note?.trim() || `resubmit after correction round ${plan.revision_no}`,
      reason: "RESUBMIT",
      created_by: actor.id,
      created_at: new Date().toISOString()
    });
    audit(LOG_TEMPLATES.RestorationPlan[5], toAuditTarget("RestorationPlan", id), `${formatRevisionLabel(nextRevisionNo)} ${nextPlan.version_no}`);
    audit(LOG_TEMPLATES.PlanRevision[1], toAuditTarget("RestorationPlan", id), formatRevisionLabel(nextRevisionNo));
    return restorationPlanService.detail(id);
  },

  approve: (id: number, actor: ActorPayload) => {
    const plan = mustGetPlan(id);
    if (plan.approval_status === "RETURNED") return fail("PLAN_PENDING_CORRECTION", 409);
    if (plan.approval_status !== "SUBMITTED") return fail("INVALID_PLAN_STATUS", 409);
    const saved = restorationPlanRepository.update(id, { approval_status: "APPROVED" });
    audit(LOG_TEMPLATES.RestorationPlan[6], toAuditTarget("RestorationPlan", id), `by ${actor.id}`);
    return saved;
  }
};
