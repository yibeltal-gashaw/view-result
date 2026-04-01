const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    year: {
      type: Number,
      required: true,
    },
    course: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    assessments: {
      type: Map,
      of: Number,
      default: {},
    },
    total: {
      type: Number,
      required: true,
    },
    grade: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    collection: "results",
    timestamps: true,
  },
);

resultSchema.index({ studentId: 1, year: 1, course: 1 }, { unique: true });

const Result = mongoose.model("Result", resultSchema);

module.exports = Result;
