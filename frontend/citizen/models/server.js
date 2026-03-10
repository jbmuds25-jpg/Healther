const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "healther-server", ".env") });

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// Allow calls from your frontend (including file:// during development)
app.use(cors());
app.use(express.json());

// Connect to MongoDB for persistent Healther database
const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/healther";
mongoose
  .connect(mongoUri)
  .then(() => console.log("MongoDB connected for Healther database"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Health check
app.get("/api/healthz", (req, res) => {
  res.json({ ok: true });
});

// Auth routes (these now write to both healther.json and MongoDB)
app.use("/api/auth", require("./healther-server/routes/auth"));

const port = Number(process.env.PORT) || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log("Server running on port " + port);
});
