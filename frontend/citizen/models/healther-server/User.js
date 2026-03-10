const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, default: "patient" }, // patient | doctor | admin
    otp: String,
    verified: { type: Boolean, default: false }
});

module.exports = mongoose.model("User", userSchema);
