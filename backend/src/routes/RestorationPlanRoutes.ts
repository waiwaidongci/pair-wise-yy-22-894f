import { Router } from "express";
import { restorationPlanController } from "../controllers/RestorationPlanController";
import { rbacMiddleware } from "../middlewares/rbacMiddleware";

const router = Router();

router.get("/", restorationPlanController.list);
router.post("/", rbacMiddleware(["RESTORER", "ARCHIVIST"]), restorationPlanController.create);
router.get("/:id", restorationPlanController.detail);
router.patch("/:id", rbacMiddleware(["RESTORER"]), restorationPlanController.update);
router.post("/:id/return", rbacMiddleware(["EXPERT"]), restorationPlanController.return);
router.post("/:id/resubmit", rbacMiddleware(["RESTORER"]), restorationPlanController.resubmit);
router.post("/:id/approve", rbacMiddleware(["EXPERT"]), restorationPlanController.approve);

export default router;
