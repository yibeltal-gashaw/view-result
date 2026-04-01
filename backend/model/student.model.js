const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    firstName: {
      type: String,
      default: "",
      trim: true,
    },
    fatherName: {
      type: String,
      default: "",
      trim: true,
    },
    sex: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },
  },
  {
    collection: "students",
    timestamps: true,
  },
);

studentSchema.index({ studentId: 1 }, { unique: true });

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
