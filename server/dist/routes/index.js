"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const borrower_1 = __importDefault(require("./borrower"));
const operations_1 = __importDefault(require("./operations"));
const router = (0, express_1.Router)();
router.use("/auth", auth_1.default);
router.use("/borrower", borrower_1.default);
router.use("/operations", operations_1.default);
exports.default = router;
