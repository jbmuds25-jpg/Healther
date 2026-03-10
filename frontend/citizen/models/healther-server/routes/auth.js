const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
const fs = require("fs");
const path = require("path");
const Citizen = require("../Citizen");

// Simple JSON-file storage for auth data
const DATA_FILE = path.join(__dirname, "..", "healther.json");

function readUsers() {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    if (!raw.trim()) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("Could not read healther.json, starting with empty users:", err);
    return [];
  }
}

function writeUsers(users) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), "utf8");
  } catch (err) {
    console.error("Could not write healther.json:", err);
  }
}

function generateHealtherId() {
  return "H-" + Math.random().toString(36).slice(2, 10).toUpperCase();
}

function toPublicUser(user) {
  const { password, otp, ...rest } = user;
  // Ensure a consistent fullName field for the frontend
  if (!rest.fullName) {
    rest.fullName = user.fullName || user.name || user.username || "";
  }
  return rest;
}

// EMAIL transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


// ================= SIGNUP =================
router.post("/signup", async (req, res) => {
  const { name, email, password, role, username } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required" });
  }

  const users = readUsers();
  const existing = users.find(u => u.email === email);
  if (existing) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hash = await bcrypt.hash(password, 10);
  const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });

  const user = {
    id: Date.now().toString(),
    healtherId: generateHealtherId(),
    name,
    username: username || email.split("@")[0],
    email,
    password: hash,
    role: role || "patient",
    otp,
    verified: true
  };

  users.push(user);
  writeUsers(users);

  // Also persist to MongoDB citizen collection
  try {
    await Citizen.create({
      healtherId: user.healtherId,
      fullName: name,
      username: user.username,
      email,
      passwordHash: hash,
      role: role || "citizen",
      badges: ["Welcome Badge"]
    });
  } catch (err) {
    console.warn("Could not save citizen to MongoDB on signup:", err.message);
  }

  try {
    await transporter.sendMail({
      to: email,
      subject: "HEALTHER Welcome",
      text: `Welcome to HEALTHER. Your Healther ID is ${user.healtherId}.`
    });
  } catch (err) {
    console.warn("Could not send welcome email, but user stored in healther.json:", err);
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, healtherId: user.healtherId },
    process.env.JWT_SECRET || "healther_secret_key"
  );

  res.json({
    message: "Signup successful.",
    token,
    user: toPublicUser(user)
  });
});


// ================= VERIFY OTP =================
router.post("/verify", async (req,res)=>{
  const { email, otp } = req.body;

  const users = readUsers();
  const idx = users.findIndex(u => u.email === email);

  if (idx === -1) {
    return res.status(400).json({ message: "User not found" });
  }

  const user = users[idx];

  if (user.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  users[idx] = { ...user, verified: true, otp: null };
  writeUsers(users);

  res.json({ message: "Account verified" });
});


// ================= LOGIN =================
router.post("/login", async (req,res)=>{
  const { email, password, username } = req.body;

  if (!password || (!email && !username)) {
    return res.status(400).json({ message: "Email / Healther ID (or username) and password are required" });
  }

  const identifier = (email || username || "").trim();

  const users = readUsers();
  // Allow login by email, username, or Healther ID
  const user = users.find(u =>
    u.email === identifier ||
    u.username === identifier ||
    u.healtherId === identifier
  );

  if (!user) {
    return res.status(400).json({ message: "Account not found" });
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return res.status(400).json({ message: "Wrong password" });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, healtherId: user.healtherId },
    process.env.JWT_SECRET || "healther_secret_key"
  );

  res.json({
    token,
    user: toPublicUser(user)
  });
});

// ================= CITIZEN SIGNUP (multi-step flow) =================
router.post("/citizen-signup", async (req, res) => {
  const {
    fullName,
    email,
    password,
    dateOfBirth,
    nationality,
    countryCode,
    mobileNumber,
    idNumber,
    birthCertificateNumber
  } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "Full name, email and password are required" });
  }

  const users = readUsers();
  const existingIndex = users.findIndex(u => u.email === email);

  const hash = await bcrypt.hash(password, 10);

  let user;
  if (existingIndex !== -1) {
    // Update existing account with citizen details
    const existing = users[existingIndex];
    user = {
      ...existing,
      name: fullName,
      email,
      password: hash,
      dateOfBirth,
      nationality,
      countryCode,
      mobileNumber,
      idNumber,
      birthCertificateNumber,
      verified: true
    };
    users[existingIndex] = user;
  } else {
    // Create new account
    user = {
      id: Date.now().toString(),
      healtherId: generateHealtherId(),
      name: fullName,
      username: email.split("@")[0],
      email,
      password: hash,
      role: "patient",
      dateOfBirth,
      nationality,
      countryCode,
      mobileNumber,
      idNumber,
      birthCertificateNumber,
      otp: null,
      verified: true
    };
    users.push(user);
  }

  writeUsers(users);

  // Upsert full citizen profile to MongoDB as the authoritative Healther database
  try {
    await Citizen.findOneAndUpdate(
      { email },
      {
        healtherId: user.healtherId,
        fullName: fullName,
        username: user.username || (email ? email.split("@")[0] : ""),
        email,
        passwordHash: hash,
        role: user.role || "citizen",
        dateOfBirth,
        nationality,
        countryCode,
        mobileNumber,
        idNumber,
        birthCertificateNumber,
        $addToSet: { badges: "Welcome Badge" }
      },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.warn("Could not upsert citizen profile in MongoDB:", err.message);
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, healtherId: user.healtherId },
    process.env.JWT_SECRET || "healther_secret_key"
  );

  res.json({
    message: "Citizen account created.",
    token,
    user: toPublicUser(user)
  });
});

module.exports = router;
