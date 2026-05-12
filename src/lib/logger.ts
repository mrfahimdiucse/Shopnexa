import { prisma } from "./prisma.js";

export async function logActivity(userId: string | null, action: string, details?: string) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        details: details || null
      }
    });
  } catch (error) {
    console.error("Activity logging failed:", error);
  }
}
