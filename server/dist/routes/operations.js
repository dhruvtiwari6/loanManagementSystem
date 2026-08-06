"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const operations_1 = require("../controllers/operations");
const auth_1 = require("../middlewares/auth");
const role_1 = require("../middlewares/role");
const router = (0, express_1.Router)();
// All operations routes require authentication
router.use(auth_1.authMiddleware);
// Sales executive & Admin routes
router.get("/leads", (0, role_1.roleMiddleware)(["Sales"]), operations_1.getLeads);
// Sanction executive & Admin routes
router.get("/sanctions", (0, role_1.roleMiddleware)(["Sanction"]), operations_1.getSanctions);
router.post("/sanctions/:id", (0, role_1.roleMiddleware)(["Sanction"]), operations_1.processSanction);
// Disbursement executive & Admin routes
router.get("/disbursements", (0, role_1.roleMiddleware)(["Disbursement"]), operations_1.getDisbursements);
router.post("/disbursements/:id", (0, role_1.roleMiddleware)(["Disbursement"]), operations_1.processDisbursement);
// Collection executive & Admin routes
router.get("/collections", (0, role_1.roleMiddleware)(["Collection"]), operations_1.getCollections);
router.post("/collections/:id/payment", (0, role_1.roleMiddleware)(["Collection"]), operations_1.recordPayment);
// Admin overview dashboard route
router.get("/overview", (0, role_1.roleMiddleware)(["Admin"]), operations_1.getAdminOverview);
exports.default = router;
