import { Router } from "express";
import { restorationPlanController } from "../controllers/RestorationPlanController";
import { rbacMiddleware } from "../middlewares/rbacMiddleware";

const router = Router();
router.get("/", restorationPlanController.list);
router.post("/", restorationPlanController.create);
router.get("/:id", restorationPlanController.detail);
router.patch("/:id", restorationPlanController.update);
router.post("/:id/return", rbacMiddleware(["expert", "admin"]), restorationPlanController.returnForCorrection);
router.post("/:id/corrections/:itemId/resolve", rbacMiddleware(["restorer", "admin"]), restorationPlanController.resolveCorrectionItem);
router.post("/:id/resubmit", rbacMiddleware(["restorer", "admin"]), restorationPlanController.resubmit);
router.post("/:id/approve", rbacMiddleware(["expert", "admin"]), restorationPlanController.approve);
export default router;
