import { Router } from "express";
import { restorationPlanCorrectionController } from "../controllers/RestorationPlanCorrectionController";
import { rbacMiddleware } from "../middlewares/rbacMiddleware";

const router = Router({ mergeParams: true });

router.post("/:itemId/resolve", rbacMiddleware(["RESTORER"]), restorationPlanCorrectionController.resolve);

export default router;
