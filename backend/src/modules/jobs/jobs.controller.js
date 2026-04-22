const {
  getRecentJobsData,
  getPendingReleaseJobsData,
} = require("./jobs.service");

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

module.exports = {
  getRecentJobs,
  getPendingReleaseJobs,
};
