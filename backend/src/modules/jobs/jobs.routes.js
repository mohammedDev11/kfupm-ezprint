const express = require("express");
const { requireAuth } = require("../../middleware/auth.middleware");
const {
  getRecentJobs,
  getPendingReleaseJobs,
} = require("./jobs.controller");

const router = express.Router();

router.use(requireAuth);

router.get("/recent", getRecentJobs);
router.get("/pending-release", getPendingReleaseJobs);

module.exports = router;
