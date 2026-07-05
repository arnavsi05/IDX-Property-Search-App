require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./db/pool");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.status(200).json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    console.error("Database health check failed:", error.message);

    res.status(500).json({
      status: "error",
      database: "disconnected",
      message: "Unable to connect to the database",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});