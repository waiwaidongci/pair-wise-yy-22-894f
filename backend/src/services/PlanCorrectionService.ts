import { restorationPlanRepository } from "../repositories/RestorationPlanRepository";
import { restorationPlanCorrectionRepository } from "../repositories/RestorationPlanCorrectionRepository";
import { restorationPlanRevisionRepository } from "../repositories/RestorationPlanRevisionRepository";
import { createRestorationPlanDto } from "../constructors/RestorationPlanDtoFactory";
import { createCorrectionItemDto } from "../constructors/RestorationPlanCorrectionDtoFactory";
import { createPlanRevisionDto } from "../constructors/RestorationPlanRevisionDtoFactory";
import { bumpVersionNo } from "../utils/formatters";
import { createHttpError } from "../utils/httpError";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { RestorationPlan } from "../models/RestorationPlan";
import type { PlanReturnPayload, PlanResubmitPayload } from "../types/RestorationPlanPayload";

const log = (template: string, message: string) => console.info(`[audit:${template}] ${message}`);

const requirePlan = (planId: number): RestorationPlan => {
  const plan = restorationPlanRepository.findById(planId);
  if (!plan) throw createHttpError(404, ERROR_CODES.PLAN_NOT_FOUND, ERROR_MESSAGES.PLAN_NOT_FOUND);
  return plan;
};

export const planCorrectionService = {
  getDetail(planId: number) {
    const plan = requirePlan(planId);
    const items = restorationPlanCorrectionRepository.findByPlanId(planId);
    const revisions = restorationPlanRevisionRepository.findByPlanId(planId);
    const openCount = items.filter((item) => item.status === "PENDING").length;
    return {
      plan: createRestorationPlanDto(plan),
      correction_items: items.map((item) => createCorrectionItemDto(item)),
      revisions: revisions.map((revision) => createPlanRevisionDto(revision)),
      open_correction_count: openCount
    };
  },

  returnPlan(planId: number, actorId: number, payload: PlanReturnPayload) {
    const plan = requirePlan(planId);
    if (plan.approval_status !== "SUBMITTED") {
      throw createHttpError(409, ERROR_CODES.INVALID_PLAN_STATUS, ERROR_MESSAGES.INVALID_PLAN_STATUS);
    }
    const items = Array.isArray(payload?.items) ? payload.items : [];
    if (items.length === 0) {
      throw createHttpError(400, ERROR_CODES.VALIDATION_FAILED, ERROR_MESSAGES.VALIDATION_FAILED);
    }
    items.forEach((item) => {
      if (!String(item.requirement ?? "").trim()) {
        throw createHttpError(400, ERROR_CODES.CORRECTION_REQUIREMENT_MISSING, ERROR_MESSAGES.CORRECTION_REQUIREMENT_MISSING);
      }
      if (!String(item.deadline ?? "").trim()) {
        throw createHttpError(400, ERROR_CODES.CORRECTION_DEADLINE_MISSING, ERROR_MESSAGES.CORRECTION_DEADLINE_MISSING);
      }
    });

    const now = new Date().toISOString();
    items.forEach((item, index) => {
      restorationPlanCorrectionRepository.create(
        createCorrectionItemDto({
          plan_id: plan.id,
          revision_no: plan.revision_no,
          item_no: index + 1,
          requirement: item.requirement.trim(),
          deadline: item.deadline,
          status: "PENDING",
          resolution_note: null,
          created_by: actorId,
          created_at: now,
          resolved_at: null
        })
      );
    });

    plan.approval_status = "PENDING_CORRECTION";
    plan.reviewer_id = actorId;
    plan.current_assignee_id = plan.owner_id;
    restorationPlanRepository.save(plan);

    restorationPlanRevisionRepository.create(
      createPlanRevisionDto({
        plan_id: plan.id,
        revision_no: plan.revision_no,
        version_no: plan.version_no,
        action: "RETURN",
        method_snapshot: plan.method,
        risk_assessment_snapshot: plan.risk_assessment,
        review_opinion: payload?.opinion ?? null,
        actor_id: actorId,
        created_at: now
      })
    );

    log(LOG_TEMPLATES.RestorationPlan[5], `plan#${plan.id} returned with ${items.length} correction item(s)`);
    log(LOG_TEMPLATES.RestorationPlanCorrection[0], `${items.length} correction item(s) created for plan#${plan.id}`);
    return planCorrectionService.getDetail(plan.id);
  },

  resolveItem(planId: number, itemId: number, actorId: number, resolutionNote: string) {
    const plan = requirePlan(planId);
    const item = restorationPlanCorrectionRepository.findById(itemId);
    if (!item || item.plan_id !== planId) {
      throw createHttpError(404, ERROR_CODES.CORRECTION_ITEM_NOT_FOUND, ERROR_MESSAGES.CORRECTION_ITEM_NOT_FOUND);
    }
    if (plan.approval_status !== "PENDING_CORRECTION" || item.status !== "PENDING") {
      throw createHttpError(409, ERROR_CODES.INVALID_PLAN_STATUS, ERROR_MESSAGES.INVALID_PLAN_STATUS);
    }
    if (!String(resolutionNote ?? "").trim()) {
      throw createHttpError(400, ERROR_CODES.CORRECTION_RESOLUTION_MISSING, ERROR_MESSAGES.CORRECTION_RESOLUTION_MISSING);
    }
    item.status = "RESOLVED";
    item.resolution_note = resolutionNote.trim();
    item.resolved_at = new Date().toISOString();
    restorationPlanCorrectionRepository.save(item);
    log(LOG_TEMPLATES.RestorationPlanCorrection[2], `correction#${item.id} of plan#${planId} resolved by user#${actorId}`);
    return planCorrectionService.getDetail(planId);
  },

  resubmit(planId: number, actorId: number, payload: PlanResubmitPayload) {
    const plan = requirePlan(planId);
    if (plan.approval_status !== "PENDING_CORRECTION") {
      throw createHttpError(409, ERROR_CODES.INVALID_PLAN_STATUS, ERROR_MESSAGES.INVALID_PLAN_STATUS);
    }
    const items = restorationPlanCorrectionRepository.findByPlanId(planId);
    const openItems = items.filter((entry) => entry.status === "PENDING");
    if (openItems.length > 0) {
      throw createHttpError(409, ERROR_CODES.CORRECTION_ITEMS_OPEN, ERROR_MESSAGES.CORRECTION_ITEMS_OPEN);
    }

    const now = new Date().toISOString();
    plan.method = payload?.method?.trim() || plan.method;
    plan.risk_assessment = payload?.risk_assessment?.trim() || plan.risk_assessment;
    plan.revision_no += 1;
    plan.version_no = bumpVersionNo(plan.revision_no);
    plan.approval_status = "SUBMITTED";
    plan.current_assignee_id = plan.reviewer_id ?? actorId;
    restorationPlanRepository.save(plan);

    restorationPlanRevisionRepository.create(
      createPlanRevisionDto({
        plan_id: plan.id,
        revision_no: plan.revision_no,
        version_no: plan.version_no,
        action: "RESUBMIT",
        method_snapshot: plan.method,
        risk_assessment_snapshot: plan.risk_assessment,
        review_opinion: `第 ${plan.revision_no} 次重提，补正清单 ${items.length} 条已逐条处理。`,
        actor_id: actorId,
        created_at: now
      })
    );

    log(LOG_TEMPLATES.RestorationPlan[6], `plan#${plan.id} resubmitted as revision ${plan.revision_no} (${plan.version_no})`);
    log(LOG_TEMPLATES.RestorationPlan[8], `revision ${plan.revision_no} generated for plan#${plan.id}; previous opinions kept in history`);
    return planCorrectionService.getDetail(plan.id);
  },

  approve(planId: number, actorId: number, opinion?: string) {
    const plan = requirePlan(planId);
    if (plan.approval_status !== "SUBMITTED") {
      throw createHttpError(409, ERROR_CODES.INVALID_PLAN_STATUS, ERROR_MESSAGES.INVALID_PLAN_STATUS);
    }
    const openCount = restorationPlanCorrectionRepository
      .findByPlanId(planId)
      .filter((item) => item.status === "PENDING").length;
    if (openCount > 0) {
      throw createHttpError(409, ERROR_CODES.CORRECTION_ITEMS_OPEN, ERROR_MESSAGES.CORRECTION_ITEMS_OPEN);
    }

    plan.approval_status = "APPROVED";
    plan.current_assignee_id = plan.owner_id;
    restorationPlanRepository.save(plan);

    restorationPlanRevisionRepository.create(
      createPlanRevisionDto({
        plan_id: plan.id,
        revision_no: plan.revision_no,
        version_no: plan.version_no,
        action: "APPROVE",
        method_snapshot: plan.method,
        risk_assessment_snapshot: plan.risk_assessment,
        review_opinion: opinion ?? null,
        actor_id: actorId,
        created_at: new Date().toISOString()
      })
    );

    log(LOG_TEMPLATES.RestorationPlan[7], `plan#${plan.id} approved at revision ${plan.revision_no} by user#${actorId}`);
    return planCorrectionService.getDetail(plan.id);
  },

  update(planId: number, actorId: number, payload: { plan_title?: string; method?: string; risk_assessment?: string }) {
    const plan = requirePlan(planId);
    const touchingLockedFields =
      (payload?.method !== undefined && payload.method !== plan.method) ||
      (payload?.risk_assessment !== undefined && payload.risk_assessment !== plan.risk_assessment);
    if (plan.approval_status === "PENDING_CORRECTION" && touchingLockedFields) {
      throw createHttpError(423, ERROR_CODES.PLAN_FIELDS_LOCKED, ERROR_MESSAGES.PLAN_FIELDS_LOCKED);
    }
    if (payload?.plan_title !== undefined) plan.plan_title = payload.plan_title;
    if (payload?.method !== undefined) plan.method = payload.method;
    if (payload?.risk_assessment !== undefined) plan.risk_assessment = payload.risk_assessment;
    restorationPlanRepository.save(plan);
    log(LOG_TEMPLATES.RestorationPlan[1], `plan#${plan.id} updated by user#${actorId}`);
    return plan;
  }
};
