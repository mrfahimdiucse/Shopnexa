import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import authRoutes from "./src/routes/auth.js";
import investmentRoutes from "./src/routes/investment.js";
import transactionRoutes from "./src/routes/transaction.js";
import adminRoutes from "./src/routes/admin.js";
import contactRoutes from "./src/routes/contact.js";
import { seedDemoData } from "./src/lib/seed.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  console.log("🚀 Initializing Shopnexa System...");
  
  const app = express();
  const PORT = 3000;

  app.use(cors({
    origin: true,
    credentials: true
  }));
  app.use(express.json());
  app.use(cookieParser());

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/investments", investmentRoutes);
  app.use("/api/transactions", transactionRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/contact", contactRoutes);

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Shopnexa API is running" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", async () => {
    console.log(`🚀 Shopnexa server running on http://localhost:${PORT}`);
    
    // Sync DB and seed demo data AFTER listening
    try {
      console.log("🌱 Syncing database...");
      await seedDemoData();
      console.log("✅ Database synchronized and seeded.");
    } catch (err) {
      console.error("❌ Seeding failed:", err);
    }
  });
}

startServer();
