// server/middlewares/upload.js
const multer = require("multer");

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const ok =
    file.mimetype === "application/xml" ||
    file.mimetype === "text/xml" ||
    file.originalname.toLowerCase().endsWith(".xml");
  if (!ok) return cb(new Error("Only .xml files are allowed"), false);
  cb(null, true);
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});
