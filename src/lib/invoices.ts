// src/lib/invoices.ts
import { parseUsdc } from "@/lib/usdc";

export type InvoiceStatus = "DUE" | "PAID" | "INVALID" | "PENDING_VERIFY";

export type Invoice = {
  id: string;
  reference: string;
  vendorName: string;
  vendorAddress: `0x${string}`;
  amountUsd: string; // affichage humain
  amountUsdc: bigint; // base units (6 decimals)
  currency: "USDC";
  dueDate: string; // ISO date
  description: string;
  status: InvoiceStatus;
};

export const seededInvoices: Invoice[] = [
  {
    id: "inv_001",
    reference: "INV-2026-001",
    vendorName: "Acme Logistics",
    vendorAddress: "0x1111111111111111111111111111111111111111",
    amountUsd: "0.10",
    amountUsdc: parseUsdc("0.10"),
    currency: "USDC",
    dueDate: "2026-01-20",
    description: "Transport & livraison - Janvier (TEST)",
    status: "DUE",
  },
  {
    id: "inv_002",
    reference: "INV-2026-002",
    vendorName: "Cloud Services Ltd",
    vendorAddress: "0x2222222222222222222222222222222222222222",
    amountUsd: "0.25",
    amountUsdc: parseUsdc("0.25"),
    currency: "USDC",
    dueDate: "2026-01-18",
    description: "Hébergement & stockage (TEST)",
    status: "DUE",
  },
  {
    id: "inv_003",
    reference: "INV-2026-003",
    vendorName: "Design Studio",
    vendorAddress: "0x3333333333333333333333333333333333333333",
    amountUsd: "0.50",
    amountUsdc: parseUsdc("0.50"),
    currency: "USDC",
    dueDate: "2026-01-25",
    description: "Maquettes landing page (TEST)",
    status: "DUE",
  },
];

export function listInvoices(): Invoice[] {
  return seededInvoices;
}

export function getInvoiceById(id: string): Invoice | undefined {
  return seededInvoices.find((inv) => inv.id === id);
}
