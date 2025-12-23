import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import tasksRoute from "../routes/task.route";

// The worker file will execute when imported, creating the worker instance
// Worker initialization errors are handled within the worker file itself
console.log("Loading BullMQ worker...");
import "../workers/scrape.worker";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use("/api", tasksRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS enabled for: ${process.env.FRONTEND_URL || "http://localhost:3000"}`);
});
