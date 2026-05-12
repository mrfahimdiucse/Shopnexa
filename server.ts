import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

// Routes - প্রোডাকশনে অনেক সময় .js এক্সটেনশন ঝামেলা করে, তাই শুধু ফাইল পাথ দেওয়া ভালো
import authRoutes from "./src/routes/auth";
import investmentRoutes from "./src/routes/investment";
import transactionRoutes from "./src/routes/transaction";
import adminRoutes from "./src/routes/admin";
import contactRoutes from "./src/routes/contact";
import { seedDemoData } from "./src/lib/seed";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  console.log("🚀 Initializing Shopnexa System...");
  
  const app = express();

  // ১. পোর্ট ডিক্লেয়ারেশন (একবারই থাকবে)
  const PORT = process.env.PORT || 10000;

  app.use(cors({
    origin: true,
    credentials: true
  }));
  app.use(express.json());
  app.use(cookieParser());

  // ২. API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/investments", investmentRoutes);
  app.use("/api/transactions", transactionRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/contact", contactRoutes);

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Shopnexa API is running" });
  });

  // ৩. Frontend Handling (Vite vs Production)
  if (process.env.NODE_ENV !== "production") {
    console.log("🛠️ Running in Development mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("🌐 Running in Production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // ৪. Server Listener (0.0.0.0 এ লিসেন করা Render এর জন্য জরুরি)
  app.listen(Number(PORT), "0.0.0.0", async () => {
    console.log(`🚀 Shopnexa server running on port ${PORT}`);
    
    // ৫. DB Sync & Seeding
    try {
      console.log("🌱 Syncing database...");
      await seedDemoData();
      console.log("✅ Database synchronized and seeded.");
    } catch (err) {
      console.error("❌ Seeding failed:", err);
      // Seeding ফেইল করলেও যেন সার্ভার চালু থাকে
    }
  });
}

// ৬. এরর হ্যান্ডেলিং (সার্ভার ক্র্যাশ রোধে)
startServer().catch((err) => {
  console.error("❌ Failed to start server:", err);
});