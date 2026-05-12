import { prisma } from "./prisma.js";
import bcrypt from "bcryptjs";

export async function seedDemoData() {
  console.log("🌱 Seeding platform data...");

  // Ensure Admin exists
  const adminEmail = "shopnexa@gmail.com";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin1234", 10);
    await prisma.user.create({
      data: {
        name: "Shopnexa Administrator",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
      },
    });
    console.log("👤 Admin user created");
  }

  const planCount = await prisma.investmentPlan.count();
  if (planCount > 0) return;

  // Create a system vendor if none exists
  let vendor = await prisma.user.findFirst({ where: { role: "VENDOR" } });
  if (!vendor) {
    const hashedPassword = await bcrypt.hash("vendor123", 10);
    vendor = await prisma.user.create({
      data: {
        name: "EcoHarvest Ventures",
        email: "vendor@demo.com",
        password: hashedPassword,
        role: "VENDOR",
      },
    });
  }

  await prisma.investmentPlan.createMany({
    data: [
      {
        title: "Dairy Farm Venture",
        minAmount: 10000,
        profitPercentage: 15,
        duration: 180,
        vendorId: vendor.id,
      },
      {
        title: "Tech Startup Fund",
        minAmount: 50000,
        profitPercentage: 25,
        duration: 365,
        vendorId: vendor.id,
      },
      {
        title: "Agro-processing Unit",
        minAmount: 25000,
        profitPercentage: 18,
        duration: 270,
        vendorId: vendor.id,
      },
    ],
  });

  console.log("✅ Seeding complete.");
}
