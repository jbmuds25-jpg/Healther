const mongoose = require("mongoose");

// Persistent Healther citizen profile schema
const citizenSchema = new mongoose.Schema(
  {
    healtherId: { type: String, index: true },
    fullName: String,
    username: String,
    email: { type: String, unique: true, required: true },
    passwordHash: String,
    role: { type: String, default: "citizen" },

    // Extended profile from registration flow
    dateOfBirth: String,
    nationality: String,
    countryCode: String,
    mobileNumber: String,
    idNumber: String,
    birthCertificateNumber: String,

    // Misc
    badges: { type: [String], default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Citizen", citizenSchema);

