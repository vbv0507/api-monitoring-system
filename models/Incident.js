const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema(
  {
    monitor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "monitor",
      required: true,
    },
    status: {
      type: String,
      enum: ["OPEN", "RESOLVED"],
      default: "OPEN",
    },
    startedAt: {
      type: Date,
      required: true,
    },
    resolvedAt: {
      type: Date,
    },
    // Duration is saved in milliseconds.
    duration: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("incident", incidentSchema);
