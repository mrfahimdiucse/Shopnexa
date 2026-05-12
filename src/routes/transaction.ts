import express from "express";
import { prisma } from "../lib/prisma.js";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";
import { logActivity } from "../lib/logger.js";

const router = express.Router();

// Deposit money (Manual bKash/Nagad)
router.post("/deposit", authenticateToken, async (req: any, res) => {
  try {
    const { amount, method, trxID } = req.body;
    
    // Validate amount is a valid number without using Math functions that round
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: req.user.id,
        amount: amount.toString(), // Send as string to Prisma for Decimal precision
        type: "DEPOSIT",
        method,
        trxID,
        status: "PENDING",
      },
    });

    await logActivity(req.user.id, "DEPOSIT_REQUEST", `User requested deposit of ৳${amount}`);

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Error processing deposit" });
  }
});

// Admin Route: Approve a pending transaction (Deposit or Withdraw)
router.post("/approve/:id", authenticateToken, authorizeRole("ADMIN"), async (req: any, res) => {
  try {
    const { id } = req.params;

    const transaction = await prisma.transaction.findUnique({ where: { id } });

    if (!transaction || transaction.status !== "PENDING") {
      return res.status(400).json({ message: "Invalid transaction for approval" });
    }

    let userUpdate;
    if (transaction.type === "DEPOSIT") {
      userUpdate = { walletBalance: { increment: transaction.amount.toString() } };
    } else if (transaction.type === "WITHDRAW") {
      // Balance is already decremented on withdrawal request to lock it
      // So we just mark the transaction as SUCCESS
      userUpdate = {}; 
    }

    const [updatedTx] = await prisma.$transaction([
      prisma.transaction.update({
        where: { id },
        data: { status: "SUCCESS" },
      }),
      ...(userUpdate && transaction.type === "DEPOSIT" ? [
        prisma.user.update({
          where: { id: transaction.userId },
          data: userUpdate,
        })
      ] : []),
    ]);

    await logActivity((req as any).user.id, "TRANSACTION_APPROVED", `Approved ${transaction.type} for user ID ${transaction.userId}`);

    res.json(updatedTx);
  } catch (error) {
    res.status(500).json({ message: "Error approving transaction" });
  }
});

// Admin Route: Reject a pending transaction (Deposit or Withdraw)
router.post("/reject/:id", authenticateToken, authorizeRole("ADMIN"), async (req: any, res) => {
  try {
    const { id } = req.params;

    const transaction = await prisma.transaction.findUnique({ where: { id } });

    if (!transaction || transaction.status !== "PENDING") {
      return res.status(400).json({ message: "Invalid transaction for rejection" });
    }

    const operations: any[] = [
      prisma.transaction.update({
        where: { id },
        data: { status: "REJECTED" },
      })
    ];

    // If rejecting a withdrawal, refund the locked balance
    if (transaction.type === "WITHDRAW") {
      operations.push(
        prisma.user.update({
          where: { id: transaction.userId },
          data: { walletBalance: { increment: transaction.amount.toString() } },
        })
      );
    }

    const [updatedTx] = await prisma.$transaction(operations);
    await logActivity((req as any).user.id, "TRANSACTION_REJECTED", `Rejected ${transaction.type} for user ID ${transaction.userId}`);
    res.json(updatedTx);
  } catch (error) {
    res.status(500).json({ message: "Error rejecting transaction" });
  }
});

// Admin Route: Get all pending transactions
router.get("/pending", authenticateToken, authorizeRole("ADMIN"), async (req: any, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { status: "PENDING" },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pending transactions" });
  }
});

// Admin Route: Get system-wide stats for charts
router.get("/stats", authenticateToken, authorizeRole("ADMIN"), async (req: any, res) => {
  try {
    const [totalInvested, totalROI] = await Promise.all([
      prisma.investment.aggregate({
        _sum: { amount: true }
      }),
      prisma.transaction.aggregate({
        where: { type: "SYSTEM_CREDIT", status: "SUCCESS" },
        _sum: { amount: true }
      })
    ]);

    // Group by plan for more detailed chart if needed
    const plansStats = await prisma.investmentPlan.findMany({
      include: {
        _count: {
          select: { investments: true }
        },
        investments: {
          select: { amount: true }
        }
      }
    });

    const formattedPlansStats = plansStats.map(p => ({
      title: p.title,
      totalCapital: p.investments.reduce((sum, inv) => sum + Number(inv.amount), 0),
      backers: p._count.investments
    }));

    res.json({
      totalCapital: Number(totalInvested._sum.amount || 0),
      totalROI: Number(totalROI._sum.amount || 0),
      plans: formattedPlansStats
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching system stats" });
  }
});

// Invest in a plan
router.post("/invest", authenticateToken, async (req: any, res) => {
  try {
    const { planId, amount } = req.body;
    const userId = req.user.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const plan = await prisma.investmentPlan.findUnique({ where: { id: planId } });

    if (!user || !plan) return res.status(404).json({ message: "Not found" });
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const amountNum = Number(amount);
    if (Number(user.walletBalance) < amountNum) return res.status(400).json({ message: "Insufficient balance" });
    if (amountNum < Number(plan.minAmount)) return res.status(400).json({ message: "Minimum amount not met" });

    // Transactional investment
    const [investment] = await prisma.$transaction([
      prisma.investment.create({
        data: {
          userId,
          planId,
          amount: amount.toString(),
          endDate: new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000),
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { walletBalance: { decrement: amount.toString() } },
      }),
      prisma.transaction.create({
        data: {
          userId,
          amount: amount.toString(),
          type: "INVEST",
          method: "WALLET",
          trxID: `INV-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`,
          status: "SUCCESS",
        },
      }),
    ]);

    await logActivity(userId, "INVESTMENT_CREATED", `Invested ৳${amount} in ${plan.title}`);

    res.json(investment);
  } catch (error) {
    res.status(500).json({ message: "Error processing investment" });
  }
});

// Request Withdrawal
router.post("/withdraw", authenticateToken, async (req: any, res) => {
  try {
    const { amount, method, address } = req.body;
    const userId = req.user.id;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (Number(user.walletBalance) < Number(amount)) {
      return res.status(400).json({ message: "Insufficient balance for withdrawal" });
    }

    const [transaction] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          userId,
          amount: amount.toString(),
          type: "WITHDRAW",
          method: `${method} (${address})`, // Combine method and address/phone
          trxID: `WD-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`,
          status: "PENDING",
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { walletBalance: { decrement: amount.toString() } },
      }),
    ]);

    await logActivity(userId, "WITHDRAWAL_REQUEST", `User requested withdrawal of ৳${amount}`);

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Error processing withdrawal request" });
  }
});

// Get user history
router.get("/history", authenticateToken, async (req: any, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    const investments = await prisma.investment.findMany({
      where: { userId: req.user.id },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ transactions, investments });
  } catch (error) {
    res.status(500).json({ message: "Error fetching history" });
  }
});

export default router;
