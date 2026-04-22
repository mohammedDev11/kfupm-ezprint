const mongoose = require("mongoose");
const User = require("../../models/User");
const PrintJob = require("../../models/PrintJob");
const Queue = require("../../models/Queue");
const Printer = require("../../models/Printer");
const Group = require("../../models/Group");
const { createHttpError } = require("../../utils/http");
const {
  formatDateTimeLabel,
  getMinutesAgo,
  toAgoLabel,
} = require("../../utils/formatters");
const { applyQuotaChange, refundJobQuotaIfNeeded } = require("../quota/quota.service");
const { createNotification } = require("../notifications/notifications.service");
const { recordAuditLog } = require("../logs/logs.service");

const getPrinterName = (job) =>
  job.printer?.printerId?.name || job.printer?.printerName || "Unassigned";

const getSubmittedAt = (job) => job.status?.submittedAt || job.createdAt;

const getPrintedAt = (job) => job.status?.printedAt || getSubmittedAt(job);

const getReadinessPercent = (job) => job.status?.readinessPercent || 0;

const roundAmount = (value) => Number(Number(value || 0).toFixed(2));

const toIdString = (value) => value?.toString?.() || "";

const isPrintingRestricted = (user) =>
  user.printing?.enabled === false || user.printing?.restricted === true;

const isPendingReleaseStatus = (job) =>
  ["Pending Release", "Held"].includes(job.status?.current || "");

const buildActorPayload = (actor = {}) => ({
  userId: actor.userId,
  username: actor.username,
  role: actor.role,
  ipAddress: actor.ipAddress,
  userAgent: actor.userAgent,
});

const buildDocumentAttributes = (job) => {
  if (job.printSettings?.attributes?.length) {
    return job.printSettings.attributes;
  }

  return [job.document?.fileType?.toUpperCase(), getPrintModeLabel(job)].filter(Boolean);
};

const getRequiredUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw createHttpError(404, "User not found.");
  }

  return user;
};

const getRequiredQueue = async (queueId) => {
  const queue = await Queue.findById(queueId).populate("printers.default printers.assigned");

  if (!queue) {
    throw createHttpError(404, "Queue not found.");
  }

  return queue;
};

const getRequiredJob = async (jobId) => {
  const query = mongoose.isValidObjectId(jobId)
    ? { $or: [{ _id: jobId }, { jobId }] }
    : { jobId };
  const job = await PrintJob.findOne(query).populate("printer.printerId");

  if (!job) {
    throw createHttpError(404, "Print job not found.");
  }

  return job;
};

const getSelectedPrinterForQueue = async (queue, printerId) => {
  if (printerId) {
    const printer = await Printer.findById(printerId);

    if (!printer) {
      throw createHttpError(404, "Printer not found.");
    }

    return printer;
  }

  if (queue.printers?.default?._id) {
    return queue.printers.default;
  }

  if (queue.printers?.assigned?.[0]?._id) {
    return queue.printers.assigned[0];
  }

  return null;
};

const ensureQueueAccessForUser = (user, queue) => {
  if (queue.status?.current !== "Active" || queue.isActive === false) {
    throw createHttpError(409, "This queue is not active.");
  }

  if (isPrintingRestricted(user)) {
    throw createHttpError(403, "Printing is restricted for this user.");
  }

  if (
    queue.access?.allowedRoles?.length &&
    !queue.access.allowedRoles.includes(user.role || "User")
  ) {
    throw createHttpError(403, "This user cannot submit jobs to the selected queue.");
  }

  if (
    queue.access?.allowedDepartments?.length &&
    user.department &&
    !queue.access.allowedDepartments.includes(user.department)
  ) {
    throw createHttpError(403, "This queue is not available for the user's department.");
  }

  if (
    queue.access?.allowedGroups?.length &&
    (!user.groupId ||
      !queue.access.allowedGroups.some((groupId) => toIdString(groupId) === toIdString(user.groupId)))
  ) {
    throw createHttpError(403, "This queue is restricted to other groups.");
  }

  if (
    queue.access?.restrictedUsers?.some(
      (restrictedUserId) => toIdString(restrictedUserId) === toIdString(user._id),
    )
  ) {
    throw createHttpError(403, "This user is restricted from the selected queue.");
  }
};

const generateJobId = () => {
  return `job-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
};

const refreshQueuePendingCount = async (queueId) => {
  if (!queueId) {
    return;
  }

  const pendingJobs = await PrintJob.countDocuments({
    "printer.queueId": queueId,
    "status.current": "Pending Release",
  });

  await Queue.findByIdAndUpdate(queueId, {
    $set: {
      "statistics.pendingJobs": pendingJobs,
    },
  });
};

const mapCreatedJob = (job) => {
  return {
    id: job._id.toString(),
    jobId: job.jobId,
    documentName: job.documentName,
    queueId: toIdString(job.printer?.queueId),
    queueName: job.printer?.queueName || "",
    printerId: toIdString(job.printer?.printerId),
    printerName: getPrinterName(job),
    pages: job.document?.pages || 0,
    cost: job.cost?.totalCost || 0,
    status: job.status?.current,
    submittedAt: job.status?.submittedAt || job.createdAt,
    releaseMethod: job.release?.method || "PIN",
    // TODO: Replace metadata-first jobs with persisted upload/file storage integration.
    fileStorage: "metadata-only",
  };
};

const mapReleaseAdminJob = (job, user) => {
  return {
    id: job._id.toString(),
    jobId: job.jobId,
    userName: user?.fullName || job.user?.username || "Unknown user",
    userEmail: user?.email || "",
    documentName: job.documentName,
    printerName: getPrinterName(job),
    pages: job.document?.pages || 0,
    options: [
      job.printSettings?.colorMode || "B&W",
      job.printSettings?.mode || "Simplex",
      job.printSettings?.copies > 1 ? `x${job.printSettings.copies}` : "",
    ].filter(Boolean),
    status: "Queued",
    submittedAt: formatDateTimeLabel(getSubmittedAt(job)),
    queueName: job.printer?.queueName || "",
    cost: job.cost?.totalCost || 0,
  };
};

const assertJobOwnership = (job, actor, scope) => {
  if (scope === "admin") {
    return;
  }

  if (toIdString(job.user?.userId) !== toIdString(actor.userId)) {
    throw createHttpError(403, "You can only manage your own jobs.");
  }
};

const markInsufficientBalanceNotification = async (user, job) => {
  return createNotification({
    title: "Insufficient balance for print release",
    message: `You do not have enough balance to release "${job.documentName}".`,
    type: "system_warning",
    source: "System",
    severity: "warning",
    targetAudience: {
      specificUsers: [user._id],
    },
    relatedTo: {
      userId: user._id,
      jobId: job._id,
      queueId: job.printer?.queueId || null,
    },
  });
};

const markJobReleasedNotification = async (user, job) => {
  return createNotification({
    title: "Print job released successfully",
    message: `Your document "${job.documentName}" has been released successfully.`,
    type: "job_printed",
    source: "Queue",
    severity: "info",
    targetAudience: {
      specificUsers: [user._id],
    },
    relatedTo: {
      userId: user._id,
      jobId: job._id,
      printerId: job.printer?.printerId || null,
      printerName: job.printer?.printerName || "",
      queueId: job.printer?.queueId || null,
    },
  });
};

const markJobCancelledNotification = async (user, job, refunded) => {
  return createNotification({
    title: refunded ? "Pending job cancelled and refunded" : "Pending job cancelled",
    message: refunded
      ? `Your pending job "${job.documentName}" was cancelled and refunded.`
      : `Your pending job "${job.documentName}" was cancelled.`,
    type: refunded ? "job_refunded" : "system_warning",
    source: "System",
    severity: "info",
    targetAudience: {
      specificUsers: [user._id],
    },
    relatedTo: {
      userId: user._id,
      jobId: job._id,
      queueId: job.printer?.queueId || null,
    },
  });
};

const getPrintModeLabel = (job) => {
  const colorMode = job.printSettings?.colorMode === "Color" ? "Color" : "Black & White";
  const mode = job.printSettings?.mode === "Duplex" ? "Duplex" : "Single-sided";
  return `${colorMode} · ${mode}`;
};

const getRecentJobsData = async (userId) => {
  const jobs = await PrintJob.find({
    "user.userId": userId,
    "status.current": { $in: ["Printed", "Failed", "Refunded"] },
  })
    .populate("printer.printerId")
    .sort({ "status.submittedAt": -1 });

  return {
    jobs: jobs.map((job) => {
      const submittedAt = getSubmittedAt(job);
      const date = new Date(submittedAt);

      return {
        id: job.jobId || job._id.toString(),
        date: date.toISOString().slice(0, 10),
        dateOrder: Number(date.toISOString().slice(0, 10).replaceAll("-", "")),
        printerName: getPrinterName(job),
        documentName: job.documentName,
        pages: job.document?.pages || 0,
        cost: job.cost?.totalCost || 0,
        status: job.status?.current,
        attributes: job.printSettings?.attributes?.length
          ? job.printSettings.attributes
          : [job.document?.fileType?.toUpperCase(), getPrintModeLabel(job)].filter(Boolean),
        submittedFrom: job.source?.clientType || "Web Print",
        printedAt: formatDateTimeLabel(getPrintedAt(job)),
        note: job.notes || "",
      };
    }),
  };
};

const getPendingReleaseJobsData = async (userId) => {
  const user = await User.findById(userId);
  const jobs = await PrintJob.find({
    "user.userId": userId,
    "status.current": "Pending Release",
  })
    .populate("printer.printerId")
    .sort({ "status.submittedAt": -1 });

  const quota = user?.printing?.quota?.remaining ?? 0;

  return {
    pendingReleaseQuota: quota,
    balance: quota,
    jobs: jobs.map((job) => {
      const submittedAt = getSubmittedAt(job);
      const readinessPercent = getReadinessPercent(job);
      const minutesAgo = getMinutesAgo(submittedAt);

      return {
        id: job.jobId || job._id.toString(),
        documentName: job.documentName,
        printerName: getPrinterName(job),
        pages: job.document?.pages || 0,
        cost: job.cost?.totalCost || 0,
        submittedAt: toAgoLabel(minutesAgo),
        submittedMinutesAgo: minutesAgo,
        clientSource: job.source?.clientType || "Web Print",
        fileType: (job.document?.fileType || "pdf").toUpperCase(),
        printMode: getPrintModeLabel(job),
        estimatedReady:
          readinessPercent >= 100 ? "Ready now" : "Syncing to printer",
        readinessPercent,
      };
    }),
  };
};

const createPrintJobData = async (userId, payload, actor) => {
  const user = await getRequiredUser(userId);
  const queue = await getRequiredQueue(payload.queueId);
  ensureQueueAccessForUser(user, queue);

  const printer = await getSelectedPrinterForQueue(queue, payload.printerId);
  const costPerPage = roundAmount(printer?.costPerPage || 0.05);
  const totalPages = payload.pages * payload.copies;
  const totalCost = roundAmount(totalPages * costPerPage);
  const now = new Date();

  const job = await PrintJob.create({
    jobId: generateJobId(),
    documentName: payload.documentName,
    user: {
      userId: user._id,
      username: user.username,
      department: user.department || "",
    },
    printer: {
      printerId: printer?._id || null,
      printerName: printer?.name || queue.name,
      queueId: queue._id,
      queueName: queue.name,
    },
    document: {
      fileName: payload.fileName || payload.documentName,
      fileType: payload.fileType || "pdf",
      fileSize: payload.fileSize || 0,
      pages: totalPages,
      originalFileName: payload.originalFileName || payload.documentName,
    },
    printSettings: {
      colorMode: /color/i.test(payload.colorMode) ? "Color" : "B&W",
      mode: payload.mode,
      paperSize: payload.paperSize,
      quality: payload.quality,
      copies: payload.copies,
      attributes:
        payload.attributes.length > 0
          ? payload.attributes
          : [payload.fileType.toUpperCase(), /color/i.test(payload.colorMode) ? "Color" : "Black & White", payload.mode].filter(Boolean),
      options:
        payload.options.length > 0
          ? payload.options
          : [payload.copies > 1 ? `x${payload.copies}` : "", payload.paperSize].filter(Boolean),
    },
    source: {
      clientType: payload.clientType || "Web Upload",
      sourceIp: actor.ipAddress || "",
      userAgent: actor.userAgent || "",
    },
    status: {
      current: "Pending Release",
      submittedAt: now,
      readinessPercent: printer ? 100 : 0,
    },
    cost: {
      costPerPage,
      totalCost,
      quotaDeducted: false,
    },
    release: {
      method: queue.security?.releaseMethod || "PIN",
      releaseCode:
        queue.security?.secureRelease !== false
          ? String(Math.floor(100000 + Math.random() * 900000))
          : "",
      releaseCodeExpiry:
        queue.security?.secureRelease !== false
          ? new Date(now.getTime() + 1000 * 60 * 60 * 24)
          : null,
      maxReleaseAttempts: 3,
      failedReleaseAttempts: 0,
    },
    notes: payload.notes,
  });

  await Promise.all([
    User.findByIdAndUpdate(user._id, {
      $inc: {
        "statistics.totalJobsSubmitted": 1,
      },
      $set: {
        "statistics.lastActivityAt": now,
      },
    }),
    Queue.findByIdAndUpdate(queue._id, {
      $inc: {
        "statistics.totalJobs": 1,
      },
    }),
    user.groupId
      ? Group.findByIdAndUpdate(user.groupId, {
          $inc: {
            "statistics.totalJobsSubmitted": 1,
          },
        })
      : Promise.resolve(),
  ]);

  await refreshQueuePendingCount(queue._id);

  await recordAuditLog({
    actor: buildActorPayload(actor),
    action: {
      name: "Job Submitted",
      category: "Job",
      details: `Submitted job "${job.jobId}" to queue "${queue.name}".`,
    },
    resource: {
      type: "PrintJob",
      id: job._id,
      name: job.jobId,
      changes: {
        documentName: job.documentName,
        pages: totalPages,
        queueName: queue.name,
        printerName: printer?.name || "",
      },
    },
  });

  return {
    job: mapCreatedJob(job),
  };
};

const releaseJobData = async (jobId, actor, { scope }) => {
  const job = await getRequiredJob(jobId);
  assertJobOwnership(job, actor, scope);

  if (!isPendingReleaseStatus(job)) {
    throw createHttpError(409, "Only pending release jobs can be released.");
  }

  const user = await getRequiredUser(job.user.userId);

  if (isPrintingRestricted(user)) {
    throw createHttpError(403, "Printing is restricted for this user.");
  }

  const queue = job.printer?.queueId ? await Queue.findById(job.printer.queueId) : null;
  const printer =
    job.printer?.printerId || (queue ? await getSelectedPrinterForQueue(queue, "") : null);
  const totalCost = roundAmount(job.cost?.totalCost || 0);

  if (!job.cost?.quotaDeducted && (user.printing?.quota?.remaining || 0) < totalCost) {
    await markInsufficientBalanceNotification(user, job);
    throw createHttpError(409, "Insufficient balance to release this job.");
  }

  if (!job.cost?.quotaDeducted && totalCost > 0) {
    await applyQuotaChange({
      user,
      amount: roundAmount(-totalCost),
      transactionType: "Print Deduction",
      reason: "Print release deduction",
      comment: `Quota deducted for ${job.documentName}`,
      method: "Job Release",
      reference: {
        jobId: job._id,
        jobIdString: job.jobId,
      },
      actor,
    });
  }

  const now = new Date();

  job.status.current = "Printed";
  job.status.printedAt = now;
  job.status.releasedAt = now;
  job.status.readinessPercent = 100;
  job.cost.quotaDeducted = totalCost > 0;

  if (printer) {
    job.printer.printerId = printer._id || printer;
    job.printer.printerName = printer.name || job.printer.printerName;
  }

  await job.save();

  await Promise.all([
    User.findByIdAndUpdate(user._id, {
      $inc: {
        "statistics.totalPagesPrinted": job.document?.pages || 0,
      },
      $set: {
        "statistics.lastActivityAt": now,
      },
    }),
    job.printer?.queueId
      ? Queue.findByIdAndUpdate(job.printer.queueId, {
          $inc: {
            "statistics.totalPagesPrinted": job.document?.pages || 0,
            "statistics.printedToday": 1,
            "statistics.printedThisMonth": 1,
          },
        })
      : Promise.resolve(),
    job.printer?.printerId
      ? Printer.findByIdAndUpdate(job.printer.printerId, {
          $inc: {
            "statistics.totalPagesPrinted": job.document?.pages || 0,
            "statistics.totalJobsSubmitted": 1,
            "statistics.totalCost": totalCost,
          },
          $set: {
            "statistics.lastUsedAt": now,
          },
        })
      : Promise.resolve(),
    user.groupId
      ? Group.findByIdAndUpdate(user.groupId, {
          $inc: {
            "statistics.totalPagesPrinted": job.document?.pages || 0,
            "statistics.totalCost": totalCost,
          },
        })
      : Promise.resolve(),
  ]);

  await refreshQueuePendingCount(job.printer?.queueId);
  await markJobReleasedNotification(user, job);

  await recordAuditLog({
    actor: buildActorPayload(actor),
    action: {
      name: "Job Released",
      category: "Job",
      details: `Released job "${job.jobId}".`,
    },
    resource: {
      type: "PrintJob",
      id: job._id,
      name: job.jobId,
      changes: {
        documentName: job.documentName,
        pages: job.document?.pages || 0,
        printerName: job.printer?.printerName || "",
        queueName: job.printer?.queueName || "",
        cost: totalCost,
      },
    },
  });

  return {
    job: {
      id: job._id.toString(),
      jobId: job.jobId,
      documentName: job.documentName,
      status: job.status?.current,
      printerName: job.printer?.printerName || "",
      releasedAt: job.status?.releasedAt,
      quotaDeducted: totalCost,
    },
  };
};

const releaseJobsByIdsData = async (jobIds, actor, { scope }) => {
  const released = [];
  const skipped = [];

  for (const jobId of jobIds) {
    try {
      const result = await releaseJobData(jobId, actor, { scope });
      released.push(result.job);
    } catch (error) {
      skipped.push({
        id: jobId,
        message: error.message,
      });
    }
  }

  return {
    releasedCount: released.length,
    skippedCount: skipped.length,
    jobs: released,
    skipped,
  };
};

const releaseAllEligibleJobsData = async (actor, { scope }) => {
  const match = {
    "status.current": "Pending Release",
  };

  if (scope !== "admin") {
    match["user.userId"] = actor.userId;
  }

  const jobs = await PrintJob.find(match).sort({ "status.submittedAt": 1 });
  const eligibleJobIds = [];
  const skipped = [];

  for (const job of jobs) {
    if (scope !== "admin") {
      const queue = job.printer?.queueId ? await Queue.findById(job.printer.queueId) : null;

      if (queue && queue.security?.allowReleaseAllJobs !== true) {
        skipped.push({
          id: job.jobId,
          message: "Queue policy does not allow release-all for this job.",
        });
        continue;
      }
    }

    eligibleJobIds.push(job.jobId);
  }

  const data = await releaseJobsByIdsData(eligibleJobIds, actor, { scope });

  return {
    ...data,
    skipped: [...skipped, ...data.skipped],
    skippedCount: skipped.length + data.skippedCount,
  };
};

const cancelPendingJobData = async (jobId, actor, { scope }) => {
  const job = await getRequiredJob(jobId);
  assertJobOwnership(job, actor, scope);

  if (!isPendingReleaseStatus(job)) {
    throw createHttpError(409, "Only pending release jobs can be cancelled.");
  }

  const user = await getRequiredUser(job.user.userId);
  const refundResult = await refundJobQuotaIfNeeded(job, actor, {
    reason: "Pending job cancelled",
    comment: `Cancelled ${job.documentName}`,
    method: "Job Cancellation Refund",
    preserveStatus: true,
  });

  job.status.current = "Cancelled";
  job.status.cancelledAt = new Date();
  job.status.readinessPercent = 0;
  await job.save();

  await refreshQueuePendingCount(job.printer?.queueId);
  await markJobCancelledNotification(user, job, Boolean(refundResult));

  await recordAuditLog({
    actor: buildActorPayload(actor),
    action: {
      name: "Job Cancelled",
      category: "Job",
      details: `Cancelled pending job "${job.jobId}".`,
    },
    resource: {
      type: "PrintJob",
      id: job._id,
      name: job.jobId,
      changes: {
        documentName: job.documentName,
        refunded: Boolean(refundResult),
        queueName: job.printer?.queueName || "",
      },
    },
  });

  return {
    job: {
      id: job._id.toString(),
      jobId: job.jobId,
      documentName: job.documentName,
      status: job.status?.current,
      refundedAmount: refundResult?.job?.cost?.refundedAmount || 0,
    },
    refundTransaction: refundResult
      ? {
          id: refundResult.transaction._id.toString(),
          amount: refundResult.transaction.transaction.amount,
        }
      : null,
  };
};

const getAdminPendingReleaseJobsData = async () => {
  const jobs = await PrintJob.find({
    "status.current": "Pending Release",
  })
    .populate("printer.printerId")
    .sort({ "status.submittedAt": -1 });

  const userIds = Array.from(new Set(jobs.map((job) => toIdString(job.user?.userId)).filter(Boolean)));
  const users = await User.find({ _id: { $in: userIds } }).select("fullName email");
  const usersMap = new Map(users.map((user) => [user._id.toString(), user]));

  const mappedJobs = jobs.map((job) => mapReleaseAdminJob(job, usersMap.get(toIdString(job.user?.userId))));

  return {
    summary: {
      total: mappedJobs.length,
      totalPages: mappedJobs.reduce((sum, job) => sum + (job.pages || 0), 0),
      totalCost: roundAmount(mappedJobs.reduce((sum, job) => sum + (job.cost || 0), 0)),
    },
    jobs: mappedJobs,
  };
};

module.exports = {
  getRecentJobsData,
  getPendingReleaseJobsData,
  createPrintJobData,
  releaseJobData,
  releaseJobsByIdsData,
  releaseAllEligibleJobsData,
  cancelPendingJobData,
  getAdminPendingReleaseJobsData,
};
