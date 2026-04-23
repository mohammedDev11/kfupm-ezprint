const express = require("express");
const env = require("../../config/env");
const { requireAuth } = require("../../middleware/auth.middleware");
const {
  getRecentJobs,
  getPendingReleaseJobs,
  createPrintJob,
  getPrintJobOptions,
  uploadAndPrintJob,
  releaseJob,
  releaseSelectedJobs,
  releaseAllEligibleJobs,
  cancelPendingJob,
} = require("./jobs.controller");

const router = express.Router();

router.use(requireAuth);

router.get("/options", getPrintJobOptions);
router.post("/", createPrintJob);
router.post(
  "/upload-print",
  express.raw({
    type: () => true,
    limit: env.printUploadLimit,
  }),
  uploadAndPrintJob,
);
router.get("/recent", getRecentJobs);
router.get("/pending-release", getPendingReleaseJobs);
router.post("/release-selected", releaseSelectedJobs);
router.post("/release-all", releaseAllEligibleJobs);
router.post("/:jobId/release", releaseJob);
router.delete("/:jobId", cancelPendingJob);

module.exports = router;
