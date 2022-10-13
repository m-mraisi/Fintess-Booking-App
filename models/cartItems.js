const mongoose = require("mongoose");

const classesSchema = new mongoose.Schema({
  class_id: Number,
  email: String,
  className: String,
  classDuration: Number,
  classInstructor: String,
});

module.exports = mongoose.model("cart_items", classesSchema);
