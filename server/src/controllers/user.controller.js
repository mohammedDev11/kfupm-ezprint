const { User } = require("../models/User");
const QuotaTransaction = require("../models/QuotaTransaction");
const PrintJob = require("../models/PrintJob");
const { formatDate, formatDateTimeLabel, getMinutesAgo, toAgoLabel } = require("../utils/formatters");

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const quota = user.printing?.quota?.remaining ?? 0;
    const sections = [
      {
        id: "personal-information",
        title: "Personal Information",
        description: "Your main account and identity details.",
        fields: [
          { id: "full-name", label: "Full Name", value: user.fullName || "-" },
          { id: "username", label: "Username", value: user.username || "-" },
          { id: "email", label: "Email Address", value: user.email || "-" },
          { id: "phone", label: "Phone Number", value: user.phone || "-" },
        ],
      },
      {
        id: "university-information",
        title: "University Information",
        description: "Academic and institutional details linked to your account.",
        fields: [
          { id: "user-id", label: "University ID", value: user.username || "-" },
          { id: "role", label: "Role", value: user.role || "User" },
          { id: "department", label: "Department", value: user.department || "-" },
          { id: "college", label: "College", value: "College of Computing and Mathematics" },
        ],
      },
      {
        id: "printing-identity",
        title: "Printing Identity",
        description: "Information used for printing and secure release.",
        fields: [
          { id: "primary-card-id", label: "Primary Card ID", value: "Not configured", sensitive: true },
          { id: "account-quota", label: "Account Quota", value: quota.toFixed(2) },
          { id: "printing-status", label: "Printing Status", value: user.restricted ? "Restricted" : "Enabled" },
          { id: "default-queue", label: "Default Queue", value: "Secure Release Queue" },
        ],
      },
    ];

    return res.status(200).json({
      success: true,
      data: {
        user: user.toSafeObject(),
        informationSections: sections,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getQuotaOverview = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const transactions = await QuotaTransaction.find({ userId: user._id });
    const quota = user.printing?.quota?.remaining ?? 0;
    const added = transactions
      .filter((item) => ["Credit addition", "Refund", "Adjustment"].includes(item.type) && item.amount > 0)
      .reduce((sum, item) => sum + item.amount, 0);
    const spent = transactions
      .filter((item) => item.type === "Print deduction")
      .reduce((sum, item) => sum + Math.abs(item.amount), 0);

    return res.status(200).json({
      success: true,
      data: {
        quota,
        balance: quota,
        walletSummaryCards: [
          {
            title: "Wallet Balance",
            value: `${quota.toFixed(2)} SAR`,
            helperText: "Available for future print orders",
            iconKey: "wallet",
          },
          {
            title: "Funds Added",
            value: `${added.toFixed(2)} SAR`,
            helperText: "Total credits added",
            iconKey: "arrow-down-left",
          },
          {
            title: "Spent",
            value: `${spent.toFixed(2)} SAR`,
            helperText: "Used for completed print jobs",
            iconKey: "arrow-up-right",
          },
          {
            title: "Redeemed",
            value: `${added.toFixed(2)} SAR`,
            helperText: "Added through top-up or redeem flow",
            iconKey: "gift",
          },
        ],
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getQuotaTransactions = async (req, res, next) => {
  try {
    const transactions = await QuotaTransaction.find({ userId: req.userId }).sort({ createdAt: -1 });

    const mapped = transactions.map((item) => {
      const direction = item.amount >= 0 ? "in" : "out";
      const status = "Completed";
      return {
        id: item._id.toString(),
        description: item.comment || item.type,
        type: item.type,
        amount: Math.abs(item.amount),
        date: formatDate(item.createdAt),
        dateOrder: Number(new Date(item.createdAt).toISOString().slice(0, 10).replaceAll("-", "")),
        status,
        direction,
        balanceAfter: item.quotaAfter,
        method: item.method || "System",
        note: item.reference || "",
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        transactions: mapped,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getRecentJobs = async (req, res, next) => {
  try {
    const jobs = await PrintJob.find({
      userId: req.userId,
      status: { $in: ["Printed", "Failed", "Refunded"] },
    })
      .populate("printerId")
      .sort({ submittedAt: -1 });

    const mapped = jobs.map((job) => {
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
        attributes: job.attributes?.length ? job.attributes : [job.fileType, job.printMode],
        submittedFrom: job.clientSource || "Web Print",
        printedAt: formatDateTimeLabel(job.printedAt || job.submittedAt),
        note: "",
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        jobs: mapped,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getPendingReleaseJobs = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    const jobs = await PrintJob.find({
      userId: req.userId,
      status: "Pending Release",
    })
      .populate("printerId")
      .sort({ submittedAt: -1 });

    const mapped = jobs.map((job) => {
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
        estimatedReady: (job.readinessPercent || 0) >= 100 ? "Ready now" : "Syncing to printer",
        readinessPercent: job.readinessPercent || 0,
      };
    });

    const quota = user?.printing?.quota?.remaining ?? 0;

    return res.status(200).json({
      success: true,
      data: {
        pendingReleaseQuota: quota,
        balance: quota,
        jobs: mapped,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getDashboard = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const allJobs = await PrintJob.find({ userId: req.userId });
    const pendingJobs = allJobs.filter((job) => job.status === "Pending Release");
    const printedJobs = allJobs.filter((job) => job.status === "Printed");
    const totalPages = printedJobs.reduce((sum, job) => sum + (job.pages || 0), 0);
    const quota = user.printing?.quota?.remaining ?? 0;

    return res.status(200).json({
      success: true,
      data: {
        period: req.query.period || "Today",
        cards: [
          { id: 1, title: "Current Quota", value: quota.toFixed(2), change: "Live", iconKey: "dollar-sign" },
          { id: 2, title: "Total Print Jobs", value: String(allJobs.length), change: "All time", iconKey: "file-text" },
          { id: 3, title: "Total Pages Printed", value: String(totalPages), change: "All time", iconKey: "layers-3" },
          { id: 4, title: "Active Pending Jobs", value: String(pendingJobs.length), change: "Ready to release", iconKey: "clock-3" },
        ],
        printActivity: [],
        printUsage: [],
        userInformation: [
          { id: 1, label: "Name", value: user.fullName, iconKey: "user-2" },
          { id: 2, label: "User ID", value: user.username, iconKey: "id-card" },
        ],
        quickActions: [
          { id: 1, label: "Upload Document", href: "/sections/user/print", iconKey: "upload", variant: "primary" },
          { id: 2, label: "Redeem Card", href: "/sections/user/redeem", iconKey: "credit-card", variant: "secondary" },
          { id: 3, label: "View Pending Jobs", href: "/sections/user/pending-jobs", iconKey: "clock-3", variant: "secondary" },
        ],
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getProfile,
  getQuotaOverview,
  getQuotaTransactions,
  getRecentJobs,
  getPendingReleaseJobs,
  getDashboard,
};
