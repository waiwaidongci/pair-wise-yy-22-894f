export const LOG_TEMPLATES = {
  RelicItem: ["RelicItem.create", "RelicItem.update", "RelicItem.status", "RelicItem.export"],
  DamageRecord: ["DamageRecord.create", "DamageRecord.update", "DamageRecord.status", "DamageRecord.export"],
  RestorationPlan: ["RestorationPlan.create", "RestorationPlan.update", "RestorationPlan.status", "RestorationPlan.export", "RestorationPlan.returnForCorrection", "RestorationPlan.resubmit", "RestorationPlan.approve", "RestorationPlan.lock"],
  RestorationStep: ["RestorationStep.create", "RestorationStep.update", "RestorationStep.status", "RestorationStep.export"],
  ImageVersion: ["ImageVersion.create", "ImageVersion.update", "ImageVersion.status", "ImageVersion.export"],
  PlanCorrectionItem: ["PlanCorrectionItem.raise", "PlanCorrectionItem.resolve", "PlanCorrectionItem.reopen", "PlanCorrectionItem.export"],
  PlanRevision: ["PlanRevision.create", "PlanRevision.resubmit", "PlanRevision.lock", "PlanRevision.export"]
};
