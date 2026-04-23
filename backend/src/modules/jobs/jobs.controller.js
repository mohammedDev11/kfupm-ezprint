const {
  getRecentJobsData,
  getPendingReleaseJobsData,
  createPrintJobData,
  getPrintJobOptionsData,
  uploadAndPrintJobData,
  releaseJobData,
  releaseJobsByIdsData,
  releaseAllEligibleJobsData,
  cancelPendingJobData,
  getAdminPendingReleaseJobsData,
} = require("./jobs.service");
const {
  normalizeCreateJobPayload,
  normalizeJobIdsPayload,
  normalizeUploadPrintHeaders,
} = require("./jobs.validation");

const getActor = (req) => ({
  userId: req.userId,
  role: req.userRole,
  username: req.userEmail || req.userId,
  ipAddress: req.ip,
  userAgent: req.get("user-agent") || "",
});

const getRecentJobs = async (req, res, next) => {
  try {
    const data = await getRecentJobsData(req.userId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const getPendingReleaseJobs = async (req, res, next) => {
  try {
    const data = await getPendingReleaseJobsData(req.userId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const createPrintJob = async (req, res, next) => {
  try {
    const payload = normalizeCreateJobPayload(req.body);
    const data = await createPrintJobData(req.userId, payload, getActor(req));

    return res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const getPrintJobOptions = async (req, res, next) => {
  try {
    const data = await getPrintJobOptionsData(req.userId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const uploadAndPrintJob = async (req, res, next) => {
  try {
    const payload = normalizeUploadPrintHeaders(req.headers);
    const buffer = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || "");
    const data = await uploadAndPrintJobData(
      req.userId,
      {
        ...payload,
        buffer,
      },
      getActor(req),
    );

    return res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const releaseJob = async (req, res, next) => {
  try {
    const data = await releaseJobData(req.params.jobId, getActor(req), {
      scope: "user",
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const releaseSelectedJobs = async (req, res, next) => {
  try {
    const { jobIds } = normalizeJobIdsPayload(req.body);
    const data = await releaseJobsByIdsData(jobIds, getActor(req), {
      scope: "user",
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const releaseAllEligibleJobs = async (req, res, next) => {
  try {
    const data = await releaseAllEligibleJobsData(getActor(req), {
      scope: "user",
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const cancelPendingJob = async (req, res, next) => {
  try {
    const data = await cancelPendingJobData(req.params.jobId, getActor(req), {
      scope: "user",
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const getAdminPendingReleaseJobs = async (req, res, next) => {
  try {
    const data = await getAdminPendingReleaseJobsData();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const adminReleaseJob = async (req, res, next) => {
  try {
    const data = await releaseJobData(req.params.jobId, getActor(req), {
      scope: "admin",
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const adminReleaseSelectedJobs = async (req, res, next) => {
  try {
    const { jobIds } = normalizeJobIdsPayload(req.body);
    const data = await releaseJobsByIdsData(jobIds, getActor(req), {
      scope: "admin",
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const adminReleaseAllEligibleJobs = async (req, res, next) => {
  try {
    const data = await releaseAllEligibleJobsData(getActor(req), {
      scope: "admin",
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const adminCancelJob = async (req, res, next) => {
  try {
    const data = await cancelPendingJobData(req.params.jobId, getActor(req), {
      scope: "admin",
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getRecentJobs,
  getPendingReleaseJobs,
  createPrintJob,
  getPrintJobOptions,
  uploadAndPrintJob,
  releaseJob,
  releaseSelectedJobs,
  releaseAllEligibleJobs,
  cancelPendingJob,
  getAdminPendingReleaseJobs,
  adminReleaseJob,
  adminReleaseSelectedJobs,
  adminReleaseAllEligibleJobs,
  adminCancelJob,
};
