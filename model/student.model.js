const mongoose = require('mongoose');
const studentSchema = new mongoose.Schema({
  "Student ID": String,
  "First Name": String,
  "Father Name": String,
  "Sex": String,
  "mid exam": Number,
  "quiz": Number,
  "lab": Number,
  "poject": Number,
  "final exam": Number,
  "total": Number
}, { collection: 'students' });

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
