const mongoose = require("mongoose");

const classesSchema = new mongoose.Schema({
  id: Number,
  className: String,
  classInstructor: String,
  classDuration: Number,
  img: String,
});

module.exports = mongoose.model("classes", classesSchema);
