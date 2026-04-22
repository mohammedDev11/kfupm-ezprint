const express = require("express");
const { requireAuth } = require("../../middleware/auth.middleware");
const {
  getRecentJobs,
  getPendingReleaseJobs,
  createPrintJob,
  releaseJob,
  releaseSelectedJobs,
  releaseAllEligibleJobs,
  cancelPendingJob,
} = require("./jobs.controller");

const router = express.Router();

router.use(requireAuth);

router.post("/", createPrintJob);
router.get("/recent", getRecentJobs);
router.get("/pending-release", getPendingReleaseJobs);
router.post("/release-selected", releaseSelectedJobs);
router.post("/release-all", releaseAllEligibleJobs);
router.post("/:jobId/release", releaseJob);
router.delete("/:jobId", cancelPendingJob);

module.exports = router;
