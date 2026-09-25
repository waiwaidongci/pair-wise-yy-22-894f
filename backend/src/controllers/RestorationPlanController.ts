import type { Request, Response } from "express";
import { restorationPlanService } from "../services/RestorationPlanService";
import { planCorrectionService } from "../services/PlanCorrectionService";
import { asyncHandler } from "../utils/asyncHandler";

const actorId = (req: Request) => Number((req as unknown as { user: { id: number } }).user?.id ?? 1);

export const restorationPlanController = {
  list: (_req: Request, res: Response) => res.json(restorationPlanService.list()),
  create: (req: Request, res: Response) => res.status(201).json(restorationPlanService.create(req.body)),
  detail: asyncHandler((req: Request, res: Response) =>
    res.json(planCorrectionService.getDetail(Number(req.params.id)))
  ),
  update: asyncHandler((req: Request, res: Response) =>
    res.json(planCorrectionService.update(Number(req.params.id), actorId(req), req.body))
  ),
  return: asyncHandler((req: Request, res: Response) =>
    res.status(201).json(planCorrectionService.returnPlan(Number(req.params.id), actorId(req), req.body))
  ),
  resubmit: asyncHandler((req: Request, res: Response) =>
    res.json(planCorrectionService.resubmit(Number(req.params.id), actorId(req), req.body))
  ),
  approve: asyncHandler((req: Request, res: Response) =>
    res.json(planCorrectionService.approve(Number(req.params.id), actorId(req), req.body?.opinion))
  )
};
