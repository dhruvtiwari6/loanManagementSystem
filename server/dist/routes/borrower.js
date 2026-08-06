"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const borrower_1 = require("../controllers/borrower");
const auth_1 = require("../middlewares/auth");
const role_1 = require("../middlewares/role");
const upload_1 = require("../middlewares/upload");
const router = (0, express_1.Router)();
// Apply auth and role middleware specifically for Borrower role (Admin can bypass)
const borrowerGuard = [auth_1.authMiddleware, (0, role_1.roleMiddleware)(["Borrower"])];
router.post("/eligibility", borrowerGuard, borrower_1.checkEligibility);
router.post("/upload-slip", borrowerGuard, upload_1.upload.single("file"), borrower_1.uploadSalarySlip);
router.post("/apply", borrowerGuard, borrower_1.applyLoan);
router.get("/loan-status", borrowerGuard, borrower_1.getLoanStatus);
exports.default = router;
