const mongoose = require("mongoose");

const quotaTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["Print deduction", "Refund", "Credit addition", "Adjustment"],
    },
    amount: {
      type: Number,
      required: true,
    },
    quotaAfter: {
      type: Number,
      required: true,
      min: 0,
    },
    comment: {
      type: String,
      default: "",
      trim: true,
    },
    reference: {
      type: String,
      default: "",
      trim: true,
    },
    method: {
      type: String,
      default: "System",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("QuotaTransaction", quotaTransactionSchema);
