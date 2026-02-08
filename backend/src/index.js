import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { connectDB } from "./db.js";
import { seedOwner } from "./seedOwner.js";
import { seedSampleUsers } from "./seedSampleUsers.js";
import authRoutes from "./routes/auth.js";
import batchRoutes from "./routes/batches.js";
import actorRoutes from "./routes/actors.js";
import verifyRoutes from "./routes/verify.js";
import cropRoutes from "./routes/crops.js";
import supplyChainRoutes from "./routes/supplyChain.js";
import paymentRoutes from "./routes/payments.js";
import userRoutes from "./routes/users.js";
import adminRoutes from "./routes/admin.js";
import sampleBatchesRoutes from "./routes/sampleBatches.js";
import { errorHandler } from "./middleware/error.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(morgan("combined"));
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "1mb" }));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: "Too many requests" },
});
app.use("/api", limiter);

app.use("/api/auth", authRoutes);
app.use("/api/batches", batchRoutes);
app.use("/api/actors", actorRoutes);
app.use("/api/verify", verifyRoutes);
app.use("/api/crops", cropRoutes);
app.use("/api/supply-chain", supplyChainRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/sample-batches", sampleBatchesRoutes);

app.get("/health", (_, res) => res.json({ ok: true }));

app.use(errorHandler);

connectDB()
  .then(() => seedOwner())
  .then(() => seedSampleUsers())
  .then(() => {
    app.listen(PORT, () => {
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      console.log(`\n  Backend API:  http://localhost:${PORT}`);
      console.log(`  Frontend app: ${frontendUrl}\n  Open in browser: ${frontendUrl}\n`);
    });
  })
  .catch((err) => {
    console.error("Startup error:", err);
    process.exit(1);
  });
