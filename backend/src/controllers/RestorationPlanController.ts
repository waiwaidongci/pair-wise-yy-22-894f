import type { Request, Response, NextFunction } from "express";
import { restorationPlanService } from "../services/RestorationPlanService";
import { createRestorationPlanDto } from "../constructors/RestorationPlanDtoFactory";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import type { ActorPayload } from "../types/RestorationPlanPayload";
import type { ReturnForCorrectionPayload } from "../types/PlanCorrectionItemPayload";
import type { ResubmitPlanPayload } from "../types/PlanRevisionPayload";

const actorOf = (req: Request): ActorPayload => (req as unknown as { user: ActorPayload }).user ?? { id: 1, role: "admin" };

const wrap = (handler: (req: Request, res: Response) => unknown) => (req: Request, res: Response, next: NextFunction) => {
  try {
    handler(req, res);
  } catch (err) {
    next(err);
  }
};

const invalid = (res: Response) => res.status(400).json({ code: ERROR_CODES.VALIDATION_FAILED, message: ERROR_MESSAGES.VALIDATION_FAILED });

export const restorationPlanController = {
  list: wrap((_req, res) => res.json(restorationPlanService.list())),

  detail: wrap((req, res) => res.json(restorationPlanService.detail(Number(req.params.id)))),

  create: wrap((req, res) => {
    const body = req.body ?? {};
    if (!body.plan_title || !body.method || !body.risk_assessment) return invalid(res);
    const dto = createRestorationPlanDto({ ...body, owner_id: body.owner_id ?? actorOf(req).id });
    return res.status(201).json(restorationPlanService.create(dto as never, actorOf(req)));
  }),

  update: wrap((req, res) => res.json(restorationPlanService.update(Number(req.params.id), req.body ?? {}, actorOf(req)))),

  returnForCorrection: wrap((req, res) => {
    const body = (req.body ?? {}) as ReturnForCorrectionPayload;
    if (!Array.isArray(body.items)) return invalid(res);
    return res.json(restorationPlanService.returnForCorrection(Number(req.params.id), body.items, actorOf(req)));
  }),

  resolveCorrectionItem: wrap((req, res) =>
    res.json(restorationPlanService.resolveCorrectionItem(Number(req.params.id), Number(req.params.itemId), String(req.body?.resolution_note ?? ""), actorOf(req)))
  ),

  resubmit: wrap((req, res) => res.json(restorationPlanService.resubmit(Number(req.params.id), (req.body ?? {}) as ResubmitPlanPayload, actorOf(req)))),

  approve: wrap((req, res) => res.json(restorationPlanService.approve(Number(req.params.id), actorOf(req))))
};
