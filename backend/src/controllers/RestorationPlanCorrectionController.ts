import type { Request, Response } from "express";
import { planCorrectionService } from "../services/PlanCorrectionService";
import { asyncHandler } from "../utils/asyncHandler";

const actorId = (req: Request) => Number((req as unknown as { user: { id: number } }).user?.id ?? 1);

export const restorationPlanCorrectionController = {
  resolve: asyncHandler((req: Request, res: Response) =>
    res.json(
      planCorrectionService.resolveItem(
        Number(req.params.planId),
        Number(req.params.itemId),
        actorId(req),
        req.body?.resolution_note
      )
    )
  )
};
