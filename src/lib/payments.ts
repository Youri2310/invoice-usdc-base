// src/lib/payments.ts
// Step 4+: send tx + wait receipt + (client) parse logs (informational only)
// Server verification lives in /app/api/verify (Step 6).

import { getUsdcAddress, erc20Abi } from "@/lib/usdc";
import type { Invoice } from "@/lib/invoices";

export type PaymentResult = {
  txHash: `0x${string}`;
  success: boolean;
};

// Helper pour construire les paramètres de transaction
export function buildPaymentParams(invoice: Invoice) {
  return {
    address: getUsdcAddress(),
    abi: erc20Abi,
    functionName: "transfer" as const,
    args: [invoice.vendorAddress, invoice.amountUsdc] as const,
  };
}
