import express from "express";
import { prisma } from "../lib/prisma.js";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";
import { logActivity } from "../lib/logger.js";

const router = express.Router();

// Get all investment plans
router.get("/", async (req, res) => {
  try {
    const plans = await prisma.investmentPlan.findMany({
      include: { 
        vendor: { select: { name: true } },
        investments: { select: { userId: true } }
      },
      orderBy: { createdAt: "desc" },
    });
    
    // Calculate unique backers per plan
    const plansWithBackers = plans.map(plan => {
      const uniqueBackers = new Set(plan.investments.map((i: any) => i.userId)).size;
      return {
        ...plan,
        backers: uniqueBackers,
        investments: undefined // Remove detailed investments from payload for brevity
      };
    });

    res.json(plansWithBackers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching plans" });
  }
});

// Create an investment plan (Vendor only)
router.post("/", authenticateToken, authorizeRole("VENDOR"), async (req: any, res) => {
  try {
    const { title, minAmount, profitPercentage, duration, imageUrl } = req.body;
    const plan = await prisma.investmentPlan.create({
      data: {
        title,
        minAmount: minAmount.toString(),
        profitPercentage: profitPercentage.toString(),
        duration: parseInt(duration),
        vendorId: req.user.id,
        imageUrl,
      },
    });
    await logActivity(req.user.id, "VENTURE_CREATED", `Vendor created a new venture: ${title}`);
    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ message: "Error creating plan" });
  }
});

// Delete an investment plan (Vendor only)
router.delete("/:id", authenticateToken, authorizeRole("VENDOR"), async (req: any, res) => {
  try {
    const { id } = req.params;
    await prisma.investmentPlan.delete({
      where: { id, vendorId: req.user.id },
    });
    res.json({ message: "Plan deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting plan" });
  }
});

// Get vendor specific stats and investments
router.get("/vendor-stats", authenticateToken, authorizeRole("VENDOR"), async (req: any, res) => {
  try {
    const userId = req.user.id;
    const [plans, investments] = await Promise.all([
      prisma.investmentPlan.findMany({
        where: { vendorId: userId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.investment.findMany({
        where: { plan: { vendorId: userId } },
        include: { user: { select: { name: true, email: true } }, plan: true },
        orderBy: { createdAt: "desc" },
      })
    ]);

    const activeAssets = investments
      .filter((inv) => inv.status === "ACTIVE")
      .reduce((total, inv) => total + Number(inv.amount), 0);

    const maturedAssets = investments
      .filter((inv) => inv.status === "MATURED")
      .reduce((total, inv) => total + Number(inv.amount), 0);

    const totalPlanCapital = plans.reduce((total, plan) => total + Number(plan.minAmount), 0);

    res.json({ plans, investments, activeAssets, maturedAssets, totalPlanCapital });
  } catch (error) {
    res.status(500).json({ message: "Error fetching vendor stats" });
  }
});

export default router;
