// src/components/InvoiceCard.tsx
"use client";
import Link from "next/link";
import type { Invoice } from "@/lib/invoices";
import { formatUsdc } from "@/lib/usdc";
import { useInvoicePayment } from "@/hooks/useInvoicePayment";

function badgeClass(status: Invoice["status"] | "PAID" | "ERROR") {
  switch (status) {
    case "PAID":
      return "bg-green-100 text-green-800";
    case "ERROR":
      return "bg-red-100 text-red-800";
    case "DUE":
      return "bg-yellow-100 text-yellow-800";
    case "INVALID":
      return "bg-red-100 text-red-800";
    case "PENDING_VERIFY":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function InvoiceCard({ invoice }: { invoice: Invoice }) {
  const { isPaid, hasError } = useInvoicePayment(invoice.id);
  
  const displayStatus = isPaid 
    ? "PAID" 
    : hasError 
    ? "ERROR" 
    : invoice.status;

  return (
    <div className="rounded-xl border p-4 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <div className="font-semibold">{invoice.reference}</div>
          <span
            className={`text-xs px-2 py-1 rounded-full ${badgeClass(
              displayStatus
            )}`}
          >
            {displayStatus}
          </span>
        </div>

        <div className="text-sm text-gray-600 mt-1">
          {invoice.vendorName} • Due {invoice.dueDate}
        </div>

        <div className="text-sm mt-2 text-gray-800 line-clamp-2">
          {invoice.description}
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0">
        <div className="font-semibold tabular-nums">
          {formatUsdc(invoice.amountUsdc)} {invoice.currency}
        </div>
        <div className="text-xs text-gray-500 tabular-nums">
          (display: ${invoice.amountUsd})
        </div>

        <Link
          href={`/invoice/${invoice.id}`}
          className="text-sm underline underline-offset-4 mt-1"
        >
          View
        </Link>
      </div>
    </div>
  );
}
