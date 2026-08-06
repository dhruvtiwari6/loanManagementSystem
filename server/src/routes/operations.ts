import { Router } from "express";
import { 
  getLeads, 
  getSanctions, 
  processSanction, 
  getDisbursements, 
  processDisbursement, 
  getCollections, 
  recordPayment,
  getAdminOverview
} from "../controllers/operations";
import { authMiddleware } from "../middlewares/auth";
import { roleMiddleware } from "../middlewares/role";

const router = Router();

// All operations routes require authentication
router.use(authMiddleware as any);

// Sales executive & Admin routes
router.get("/leads", roleMiddleware(["Sales"]) as any, getLeads as any);

// Sanction executive & Admin routes
router.get("/sanctions", roleMiddleware(["Sanction"]) as any, getSanctions as any);
router.post("/sanctions/:id", roleMiddleware(["Sanction"]) as any, processSanction as any);

// Disbursement executive & Admin routes
router.get("/disbursements", roleMiddleware(["Disbursement"]) as any, getDisbursements as any);
router.post("/disbursements/:id", roleMiddleware(["Disbursement"]) as any, processDisbursement as any);

// Collection executive & Admin routes
router.get("/collections", roleMiddleware(["Collection"]) as any, getCollections as any);
router.post("/collections/:id/payment", roleMiddleware(["Collection"]) as any, recordPayment as any);

// Admin overview dashboard route
router.get("/overview", roleMiddleware(["Admin"]) as any, getAdminOverview as any);

export default router;
