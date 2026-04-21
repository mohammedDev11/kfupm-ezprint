const mongoose = require("mongoose");

const printJobSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    printerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Printer",
      default: null,
      index: true,
    },
    queueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Queue",
      default: null,
      index: true,
    },
    jobId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    documentName: {
      type: String,
      required: true,
      trim: true,
    },
    pages: {
      type: Number,
      required: true,
      min: 1,
    },
    cost: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Pending Release", "Printed", "Refunded", "Failed", "Cancelled"],
      default: "Pending Release",
      index: true,
    },
    attributes: {
      type: [String],
      default: [],
    },
    options: {
      type: [String],
      default: [],
    },
    clientSource: {
      type: String,
      default: "Web Upload",
      trim: true,
    },
    fileType: {
      type: String,
      default: "pdf",
      trim: true,
    },
    printMode: {
      type: String,
      default: "Simplex",
      trim: true,
    },
    readinessPercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    printedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PrintJob", printJobSchema);
