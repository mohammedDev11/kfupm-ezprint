const mongoose = require("mongoose");

const printerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    model: {
      type: String,
      default: "",
      trim: true,
    },
    location: {
      type: String,
      default: "",
      trim: true,
    },
    building: {
      type: String,
      default: "",
      trim: true,
    },
    room: {
      type: String,
      default: "",
      trim: true,
    },
    department: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      default: "Online",
      index: true,
    },
    capabilities: {
      type: [String],
      default: [],
    },
    costPerPage: {
      type: Number,
      default: 0.1,
      min: 0,
    },
    ipAddress: {
      type: String,
      default: "",
      trim: true,
    },
    queueName: {
      type: String,
      default: "",
      trim: true,
    },
    serialNumber: {
      type: String,
      default: "",
      trim: true,
    },
    deviceType: {
      type: String,
      default: "Physical",
    },
    tonerLevel: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    paperLevel: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    totalPagesPrinted: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalJobsSubmitted: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastUsed: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Printer", printerSchema);
