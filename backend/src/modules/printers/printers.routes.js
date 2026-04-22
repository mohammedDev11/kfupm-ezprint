const express = require("express");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");
const { getAdminPrinters } = require("./printers.controller");

const router = express.Router();

router.use(requireAuth);
router.use(requireRole("Admin", "SubAdmin"));

router.get("/", getAdminPrinters);

module.exports = router;
