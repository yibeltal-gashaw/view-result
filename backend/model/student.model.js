const mongoose = require('mongoose');
const studentSchema = new mongoose.Schema({
  "Student ID": String,
  "First Name": String,
  "Father Name": String,
  "Sex": String,
  "year": Number,
  "course": String,
  "mid exam": Number,
  "quiz": Number,
  "lab": Number,
  "project": Number,
  "final exam": Number,
  assessments: {
    type: Map,
    of: Number,
  },
  "total": Number,
  "grade": String
}, { collection: 'students' });

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
