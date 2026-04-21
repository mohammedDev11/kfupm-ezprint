const mongoose = require("mongoose");

const queueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    type: {
      type: String,
      default: "Secure Release Queue",
    },
    status: {
      type: String,
      default: "Active",
      index: true,
    },
    assignedPrinters: {
      type: [String],
      default: [],
    },
    defaultPrinter: {
      type: String,
      default: "",
    },
    allowedRoles: {
      type: [String],
      default: ["User", "SubAdmin", "Admin"],
    },
    allowedGroups: {
      type: [String],
      default: [],
    },
    allowedDepartments: {
      type: [String],
      default: [],
    },
    restrictedUsers: {
      type: [String],
      default: [],
    },
    pendingJobs: {
      type: Number,
      default: 0,
      min: 0,
    },
    retentionHours: {
      type: Number,
      default: 24,
      min: 1,
    },
    secureRelease: {
      type: Boolean,
      default: true,
    },
    manualReleaseRequired: {
      type: Boolean,
      default: true,
    },
    allowReleaseAllJobs: {
      type: Boolean,
      default: true,
    },
    requirePrinterAuthentication: {
      type: Boolean,
      default: true,
    },
    autoDeleteExpiredJobs: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Queue", queueSchema);
