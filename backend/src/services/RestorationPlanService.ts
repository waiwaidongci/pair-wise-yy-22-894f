import { restorationPlanRepository } from "../repositories/RestorationPlanRepository";
import { restorationPlanCorrectionRepository } from "../repositories/RestorationPlanCorrectionRepository";
import { createRestorationPlanDto } from "../constructors/RestorationPlanDtoFactory";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { RestorationPlan } from "../models/RestorationPlan";

export const restorationPlanService = {
  list: () =>
    restorationPlanRepository.findAll().map((plan) => ({
      ...plan,
      open_correction_count: restorationPlanCorrectionRepository
        .findByPlanId(plan.id)
        .filter((item) => item.status === "PENDING").length
    })),
  create: (row: Partial<RestorationPlan>) => {
    const plan = restorationPlanRepository.save(
      createRestorationPlanDto({
        ...row,
        id: row.id ?? restorationPlanRepository.findAll().length + 1,
        version_no: row.version_no ?? "V1.0",
        revision_no: row.revision_no ?? 1,
        approval_status: row.approval_status ?? "DRAFT",
        current_assignee_id: row.current_assignee_id ?? row.owner_id ?? 1
      }) as RestorationPlan
    );
    console.info(`[audit:${LOG_TEMPLATES.RestorationPlan[0]}] plan#${plan.id} created`);
    return plan;
  }
};
