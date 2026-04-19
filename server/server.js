require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const memesRouter = require("./routes/memes");
const uploadRouter = require("./routes/upload");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/memes", memesRouter);
app.use("/api/upload", uploadRouter);

app.get("/", (req, res) => res.json({ status: "ok", message: "catchup API is running" }));
app.get("/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/catchup")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
  });