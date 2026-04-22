const express = require("express");
const { requireAuth } = require("../../middleware/auth.middleware");
const {
  getProfile,
  getQuotaOverview,
  getQuotaTransactions,
  getDashboard,
} = require("./users.controller");

const router = express.Router();

router.use(requireAuth);

router.get("/profile", getProfile);
router.get("/quota/overview", getQuotaOverview);
router.get("/quota/transactions", getQuotaTransactions);
router.get("/dashboard", getDashboard);

module.exports = router;
