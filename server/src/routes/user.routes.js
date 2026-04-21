const express = require("express");
const { requireAuth } = require("../middlewares/auth.middleware");
const {
  getProfile,
  getQuotaOverview,
  getQuotaTransactions,
  getRecentJobs,
  getPendingReleaseJobs,
  getDashboard,
} = require("../controllers/user.controller");

const router = express.Router();

router.use(requireAuth);

router.get("/profile", getProfile);
router.get("/quota/overview", getQuotaOverview);
router.get("/quota/transactions", getQuotaTransactions);
router.get("/jobs/recent", getRecentJobs);
router.get("/jobs/pending-release", getPendingReleaseJobs);
router.get("/dashboard", getDashboard);

module.exports = router;
