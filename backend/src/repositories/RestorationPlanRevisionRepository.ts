import { seed } from "../seed";
import type { RestorationPlanRevision } from "../models/RestorationPlanRevision";

const revisions: RestorationPlanRevision[] = JSON.parse(JSON.stringify(seed.restorationPlanRevision));
let nextId = revisions.reduce((max, revision) => Math.max(max, revision.id), 0) + 1;

export const restorationPlanRevisionRepository = {
  findByPlanId: (planId: number) => revisions.filter((revision) => revision.plan_id === planId),
  create: (row: Omit<RestorationPlanRevision, "id">) => {
    const revision = { ...row, id: nextId++ };
    revisions.push(revision);
    return revision;
  }
};
