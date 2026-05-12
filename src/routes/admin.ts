import express from "express";
import { prisma } from "../lib/prisma.js";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";
import { logActivity } from "../lib/logger.js";

const router = express.Router();

// Get all users
router.get("/users", authenticateToken, authorizeRole("ADMIN"), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        walletBalance: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

// Update user status (Suspend/Activate)
router.patch("/users/:id/status", authenticateToken, authorizeRole("ADMIN"), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // ACTIVE or SUSPENDED

    const user = await prisma.user.update({
      where: { id },
      data: { status }
    });

    await logActivity((req as any).user.id, `ADMIN_ACTION`, `Updated status of user ${user.email} to ${status}`);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error updating user status" });
  }
});

// Delete venture (Admin only)
router.delete("/ventures/:id", authenticateToken, authorizeRole("ADMIN"), async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await prisma.investmentPlan.delete({
      where: { id }
    });

    await logActivity((req as any).user.id, `ADMIN_ACTION`, `Deleted venture: ${plan.title}`);
    res.json({ message: "Venture deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting venture" });
  }
});

// Get activity logs
router.get("/logs", authenticateToken, authorizeRole("ADMIN"), async (req, res) => {
  try {
    const logs = await prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching logs" });
  }
});

export default router;
