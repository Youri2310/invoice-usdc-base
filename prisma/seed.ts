// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const invoices = [
    {
      id: "inv_001",
      reference: "INV-2025-001",
      vendorName: "Acme Corp",
      vendorAddress: "0x1234567890123456789012345678901234567890",
      amountUsdc: "100000", // 0.10 USDC (6 decimals)
      amountUsd: "0.10",
      currency: "USDC",
      dueDate: "2025-01-31",
      description: "Consulting services - January 2025",
      status: "DUE",
    },
    {
      id: "inv_002",
      reference: "INV-2025-002",
      vendorName: "Beta LLC",
      vendorAddress: "0x2345678901234567890123456789012345678901",
      amountUsdc: "250000", // 0.25 USDC
      amountUsd: "0.25",
      currency: "USDC",
      dueDate: "2025-02-15",
      description: "Software license - Q1 2025",
      status: "DUE",
    },
    {
      id: "inv_003",
      reference: "INV-2025-003",
      vendorName: "Gamma Inc",
      vendorAddress: "0x3456789012345678901234567890123456789012",
      amountUsdc: "400000000", // 400 USDC (pour tester erreurs)
      amountUsd: "400.00",
      currency: "USDC",
      dueDate: "2025-02-28",
      description: "Development services - February 2025",
      status: "DUE",
    },
  ];

  for (const invoice of invoices) {
    await prisma.invoice.upsert({
      where: { id: invoice.id },
      update: invoice,
      create: invoice,
    });
    console.log(`✅ Created invoice: ${invoice.reference}`);
  }

  console.log("✨ Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
