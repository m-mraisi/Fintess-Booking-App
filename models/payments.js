const mongoose = require("mongoose");

const paymentsSchema = new mongoose.Schema({
  id: String,
  email: String,
  total: Number,
  items: [{ itemName: String, unitPrice: Number }],
});

module.exports = mongoose.model("payments", paymentsSchema);
