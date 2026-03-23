import { Router, type IRouter } from "express";
import healthRouter from "./health";
import interestsRouter from "./interests";

const router: IRouter = Router();

router.use(healthRouter);
router.use(interestsRouter);

export default router;
