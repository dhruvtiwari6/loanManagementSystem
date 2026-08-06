// server/routes/uploadRoutes.js
const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const { parseReport } = require("../utils/parser");
const Report = require("../src/models/Report");

// Preview-only upload: parses XML and returns a summary
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ ok: false, error: 'No file uploaded. Use form-data key "file".' });
    }

    const xml = req.file.buffer.toString("utf-8");
    const parsed = parseReport(xml);

    return res.json({
      ok: true,
      topLevelRoot: parsed.rootKey,
      sample: {
        name: parsed.basic.name,
        phone: parsed.basic.phone,
        pan: parsed.basic.pan,
        bureauScore: parsed.basic.bureauScore,
        totals: parsed.summary,
      },
      counts: { accounts: parsed.accounts.length, enquiries: parsed.enquiries.length },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// Upload + save: parses XML and persists to MongoDB
router.post("/upload/save", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ ok: false, error: 'No file uploaded. Use form-data key "file".' });
    }

    const xml = req.file.buffer.toString("utf-8");
    const parsed = parseReport(xml);

    const doc = {
      rootKey: parsed.rootKey,
      file: {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      },
      basic: {
        name: parsed.basic.name || null,
        phone: parsed.basic.phone != null ? String(parsed.basic.phone) : null,
        pan: parsed.basic.pan || null,
        bureauScore: parsed.basic.bureauScore ?? null,
      },
      summary: {
        totalAccounts: parsed.summary.totalAccounts ?? null,
        activeAccounts: parsed.summary.activeAccounts ?? null,
        closedAccounts: parsed.summary.closedAccounts ?? null,
        securedAmount: parsed.summary.securedAmount ?? null,
        unsecuredAmount: parsed.summary.unsecuredAmount ?? null,
        enquiriesLast7Days: parsed.summary.enquiriesLast7Days ?? null,
      },
      accounts: parsed.accounts,
      enquiries: parsed.enquiries,
    };

    const saved = await Report.create(doc);

    return res.json({
      ok: true,
      reportId: String(saved._id),
      sample: {
        name: doc.basic.name,
        phone: doc.basic.phone,
        pan: doc.basic.pan,
        bureauScore: doc.basic.bureauScore,
        totals: doc.summary,
      },
      counts: { accounts: doc.accounts.length, enquiries: doc.enquiries.length },
      createdAt: saved.createdAt,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
