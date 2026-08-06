import { Router } from "express";
import authRoutes from "./auth";
import borrowerRoutes from "./borrower";
import operationsRoutes from "./operations";

const router = Router();

router.use("/auth", authRoutes);
router.use("/borrower", borrowerRoutes);
router.use("/operations", operationsRoutes);

export default router;
