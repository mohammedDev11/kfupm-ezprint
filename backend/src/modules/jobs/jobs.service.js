const { User } = require("../../models/User");
const PrintJob = require("../../models/PrintJob");
const {
  formatDateTimeLabel,
  getMinutesAgo,
  toAgoLabel,
} = require("../../utils/formatters");

const getRecentJobsData = async (userId) => {
  const jobs = await PrintJob.find({
    userId,
    status: { $in: ["Printed", "Failed", "Refunded"] },
  })
    .populate("printerId")
    .sort({ submittedAt: -1 });

  return {
    jobs: jobs.map((job) => {
      const date = new Date(job.submittedAt);

      return {
        id: job.jobId || job._id.toString(),
        date: date.toISOString().slice(0, 10),
        dateOrder: Number(date.toISOString().slice(0, 10).replaceAll("-", "")),
        printerName: job.printerId?.name || "Unassigned",
        documentName: job.documentName,
        pages: job.pages,
        cost: job.cost,
        status: job.status,
        attributes: job.attributes?.length
          ? job.attributes
          : [job.fileType, job.printMode],
        submittedFrom: job.clientSource || "Web Print",
        printedAt: formatDateTimeLabel(job.printedAt || job.submittedAt),
        note: "",
      };
    }),
  };
};

const getPendingReleaseJobsData = async (userId) => {
  const user = await User.findById(userId);
  const jobs = await PrintJob.find({
    userId,
    status: "Pending Release",
  })
    .populate("printerId")
    .sort({ submittedAt: -1 });

  const quota = user?.printing?.quota?.remaining ?? 0;

  return {
    pendingReleaseQuota: quota,
    balance: quota,
    jobs: jobs.map((job) => {
      const minutesAgo = getMinutesAgo(job.submittedAt);

      return {
        id: job.jobId || job._id.toString(),
        documentName: job.documentName,
        printerName: job.printerId?.name || "Unassigned",
        pages: job.pages,
        cost: job.cost,
        submittedAt: toAgoLabel(minutesAgo),
        submittedMinutesAgo: minutesAgo,
        clientSource: job.clientSource || "Web Print",
        fileType: (job.fileType || "pdf").toUpperCase(),
        printMode: job.printMode || "Black & White · Duplex",
        estimatedReady:
          (job.readinessPercent || 0) >= 100 ? "Ready now" : "Syncing to printer",
        readinessPercent: job.readinessPercent || 0,
      };
    }),
  };
};

module.exports = {
  getRecentJobsData,
  getPendingReleaseJobsData,
};
