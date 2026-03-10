const mongoose = require("mongoose");

module.exports = mongoose.model("Record", new mongoose.Schema({
  patient: String,
  doctor: String,
  diagnosis: String,
  treatment: String,
  date: { type: Date, default: Date.now }
}));
