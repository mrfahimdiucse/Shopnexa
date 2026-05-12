import { prisma } from "./prisma.js";

export async function processMaturedInvestments(userId: string) {
  const now = new Date();
  
  // Find active investments that have passed their end date
  const maturedInvestments = await prisma.investment.findMany({
    where: {
      userId,
      status: "ACTIVE",
      endDate: {
        lte: now,
      },
    },
    include: {
      plan: true,
    },
  });

  if (maturedInvestments.length === 0) return [];

  const processed = [];

  for (const inv of maturedInvestments) {
    const principal = Number(inv.amount);
    const profitPercent = Number(inv.plan.profitPercentage);
    const totalProfit = (principal * profitPercent) / 100;
    const totalReturn = principal + totalProfit;

    // Use a transaction to ensure atomicity
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          walletBalance: {
            increment: totalReturn.toString(),
          },
        },
      }),
      prisma.investment.update({
        where: { id: inv.id },
        data: {
          status: "MATURED",
        },
      }),
      prisma.transaction.create({
        data: {
          userId,
          amount: totalReturn.toString(),
          type: "SYSTEM_CREDIT",
          method: "Investment ROI Maturity",
          trxID: `ROI-${inv.id}-${Date.now()}`,
          status: "SUCCESS",
        },
      }),
    ]);

    processed.push({
      planTitle: inv.plan.title,
      totalReturn,
    });
  }

  return processed;
}
