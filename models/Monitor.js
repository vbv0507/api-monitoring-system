const mongoose = require("mongoose");
const monitorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      required: true,
      enum: ["GET", "POST", "PUT", "DELETE"],
      default: "GET",
    },
    status: {
      type: String,
      enum: ["UP", "DOWN"],
      default: "UP",
    },
    statusCode: {
      type: Number,
      default: 0,
    },
    responseTime: {
      type: Number,
      default: 0,
    },
    interval: {
      type: Number,
      default: 60000, // 1 minute
    },
    failureCount: {
      type: Number,
      default: 0,
    },

    lastChecked: {
      type: Date,
    },
  },
  { timestamps: true },
);
module.exports = mongoose.model("monitor", monitorSchema);
