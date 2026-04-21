const express = require("express");
const { requireAuth } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const {
  getAdminUsers,
  getAdminPrinters,
  getAdminQueues,
} = require("../controllers/admin.controller");

const router = express.Router();

router.use(requireAuth);
router.use(requireRole("Admin", "SubAdmin"));

router.get("/users", getAdminUsers);
router.get("/printers", getAdminPrinters);
router.get("/queues", getAdminQueues);

module.exports = router;
