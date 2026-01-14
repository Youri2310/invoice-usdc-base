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
    <div className="group relative bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="relative flex items-start justify-between gap-6">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="font-bold text-lg text-gray-900">{invoice.reference}</h3>
            <span
              className={`text-xs px-3 py-1 rounded-full font-semibold ${badgeClass(
                displayStatus
              )}`}
            >
              {displayStatus}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="font-medium">{invoice.vendorName}</span>
            <span className="text-gray-400">•</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Due {invoice.dueDate}</span>
          </div>

          <p className="text-sm text-gray-700 line-clamp-2">
            {invoice.description}
          </p>
        </div>

        <div className="flex flex-col items-end gap-3 shrink-0">
          <div>
            <div className="text-2xl font-bold text-gray-900 tabular-nums">
              {formatUsdc(invoice.amountUsdc)}
            </div>
            <div className="text-xs text-gray-500 text-right">
              {invoice.currency} (≈ ${invoice.amountUsd})
            </div>
          </div>

          <Link
            href={`/invoice/${invoice.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
          >
            View Details
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
