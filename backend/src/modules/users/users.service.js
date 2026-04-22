const { User } = require("../../models/User");
const QuotaTransaction = require("../../models/QuotaTransaction");
const PrintJob = require("../../models/PrintJob");
const {
  formatDate,
  formatDateTimeLabel,
} = require("../../utils/formatters");

const getRequiredUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("User not found.");
    error.status = 404;
    throw error;
  }

  return user;
};

const getProfileData = async (userId) => {
  const user = await getRequiredUser(userId);
  const quota = user.printing?.quota?.remaining ?? 0;

  return {
    user: user.toSafeObject(),
    informationSections: [
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
          {
            id: "college",
            label: "College",
            value: "College of Computing and Mathematics",
          },
        ],
      },
      {
        id: "printing-identity",
        title: "Printing Identity",
        description: "Information used for printing and secure release.",
        fields: [
          {
            id: "primary-card-id",
            label: "Primary Card ID",
            value: "Not configured",
            sensitive: true,
          },
          { id: "account-quota", label: "Account Quota", value: quota.toFixed(2) },
          {
            id: "printing-status",
            label: "Printing Status",
            value: user.restricted ? "Restricted" : "Enabled",
          },
          {
            id: "default-queue",
            label: "Default Queue",
            value: "Secure Release Queue",
          },
        ],
      },
    ],
  };
};

const getQuotaOverviewData = async (userId) => {
  const user = await getRequiredUser(userId);
  const transactions = await QuotaTransaction.find({ userId: user._id });
  const quota = user.printing?.quota?.remaining ?? 0;
  const added = transactions
    .filter(
      (item) =>
        ["Credit addition", "Refund", "Adjustment"].includes(item.type) &&
        item.amount > 0,
    )
    .reduce((sum, item) => sum + item.amount, 0);
  const spent = transactions
    .filter((item) => item.type === "Print deduction")
    .reduce((sum, item) => sum + Math.abs(item.amount), 0);

  return {
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
  };
};

const getQuotaTransactionsData = async (userId) => {
  const transactions = await QuotaTransaction.find({ userId }).sort({
    createdAt: -1,
  });

  return {
    transactions: transactions.map((item) => {
      const direction = item.amount >= 0 ? "in" : "out";

      return {
        id: item._id.toString(),
        description: item.comment || item.type,
        type: item.type,
        amount: Math.abs(item.amount),
        date: formatDate(item.createdAt),
        dateOrder: Number(
          new Date(item.createdAt).toISOString().slice(0, 10).replaceAll("-", ""),
        ),
        status: "Completed",
        direction,
        balanceAfter: item.quotaAfter,
        method: item.method || "System",
        note: item.reference || "",
      };
    }),
  };
};

const getDashboardData = async (userId, period) => {
  const user = await getRequiredUser(userId);
  const allJobs = await PrintJob.find({ userId });
  const pendingJobs = allJobs.filter((job) => job.status === "Pending Release");
  const printedJobs = allJobs.filter((job) => job.status === "Printed");
  const totalPages = printedJobs.reduce((sum, job) => sum + (job.pages || 0), 0);
  const quota = user.printing?.quota?.remaining ?? 0;

  return {
    period: period || "Today",
    cards: [
      {
        id: 1,
        title: "Current Quota",
        value: quota.toFixed(2),
        change: "Live",
        iconKey: "dollar-sign",
      },
      {
        id: 2,
        title: "Total Print Jobs",
        value: String(allJobs.length),
        change: "All time",
        iconKey: "file-text",
      },
      {
        id: 3,
        title: "Total Pages Printed",
        value: String(totalPages),
        change: "All time",
        iconKey: "layers-3",
      },
      {
        id: 4,
        title: "Active Pending Jobs",
        value: String(pendingJobs.length),
        change: "Ready to release",
        iconKey: "clock-3",
      },
    ],
    printActivity: [],
    printUsage: [],
    userInformation: [
      { id: 1, label: "Name", value: user.fullName, iconKey: "user-2" },
      { id: 2, label: "User ID", value: user.username, iconKey: "id-card" },
    ],
    quickActions: [
      {
        id: 1,
        label: "Upload Document",
        href: "/sections/user/print",
        iconKey: "upload",
        variant: "primary",
      },
      {
        id: 2,
        label: "Redeem Card",
        href: "/sections/user/redeem",
        iconKey: "credit-card",
        variant: "secondary",
      },
      {
        id: 3,
        label: "View Pending Jobs",
        href: "/sections/user/pending-jobs",
        iconKey: "clock-3",
        variant: "secondary",
      },
    ],
  };
};

const getAdminUsersData = async () => {
  const users = await User.find().sort({ createdAt: -1 });

  return Promise.all(
    users.map(async (user) => {
      const stats = await PrintJob.aggregate([
        { $match: { userId: user._id } },
        {
          $group: {
            _id: "$userId",
            jobs: { $sum: 1 },
            pages: { $sum: "$pages" },
          },
        },
      ]);

      return {
        id: user._id.toString(),
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        department: user.department || "Software Engineering",
        standing: user.standing || "Student",
        phone: user.phone || "-",
        quota: user.printing?.quota?.remaining ?? 0,
        restricted: user.restricted ? "Restricted" : "Unrestricted",
        pages: stats[0]?.pages || 0,
        jobs: stats[0]?.jobs || 0,
        lastActivity: user.lastActivity
          ? formatDateTimeLabel(user.lastActivity)
          : "No activity",
        notes: "",
      };
    }),
  );
};

module.exports = {
  getProfileData,
  getQuotaOverviewData,
  getQuotaTransactionsData,
  getDashboardData,
  getAdminUsersData,
};
