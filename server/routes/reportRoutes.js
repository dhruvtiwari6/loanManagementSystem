// server/routes/reportRoutes.js
const express = require("express");
const mongoose = require("mongoose");
const Report = require("../src/models/Report");

const router = express.Router();

/**
 * GET /api/reports/:id
 * Fetch a single report by Mongo _id
 */
router.get("/reports/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ ok: false, error: "Invalid report id" });
    }

    const doc = await Report.findById(id).lean();
    if (!doc) return res.status(404).json({ ok: false, error: "Not found" });

    return res.json({ ok: true, report: doc });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * GET /api/reports
 * - If ?pan=XXXX → return latest report for that PAN
 * - Else → return the most recent N reports (default 10)
 */
router.get("/reports", async (req, res) => {
  try {
    const { pan, limit = 10 } = req.query;

    if (pan) {
      const latest = await Report.findOne({ "basic.pan": pan })
        .sort({ createdAt: -1 })
        .lean();
      if (!latest) return res.json({ ok: true, report: null });
      return res.json({ ok: true, report: latest });
    }

    const lim = Math.max(1, Math.min(Number(limit) || 10, 50));
    const items = await Report.find({})
      .sort({ createdAt: -1 })
      .limit(lim)
      .lean();

    return res.json({ ok: true, reports: items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
