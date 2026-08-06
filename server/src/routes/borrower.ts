import { Router } from "express";
import { checkEligibility, uploadSalarySlip, applyLoan, getLoanStatus } from "../controllers/borrower";
import { authMiddleware } from "../middlewares/auth";
import { roleMiddleware } from "../middlewares/role";
import { upload } from "../middlewares/upload";

const router = Router();

// Apply auth and role middleware specifically for Borrower role (Admin can bypass)
const borrowerGuard = [authMiddleware as any, roleMiddleware(["Borrower"]) as any];

router.post("/eligibility", borrowerGuard, checkEligibility as any);
router.post("/upload-slip", borrowerGuard, upload.single("file"), uploadSalarySlip as any);
router.post("/apply", borrowerGuard, applyLoan as any);
router.get("/loan-status", borrowerGuard, getLoanStatus as any);

export default router;
