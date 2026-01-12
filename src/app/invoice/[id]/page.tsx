// src/app/invoice/[id]/page.tsx
"use client";
import Link from "next/link";
import { use } from "react";
import { getInvoiceById } from "@/lib/invoices";
import { formatUsdc, usdcExplorerUrl } from "@/lib/usdc";
import { PaymentButton } from "@/components/PaymentButton";
import { ConnectWallet } from "@/components/ConnectWallet";

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const invoice = getInvoiceById(id);

  if (!invoice) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-xl font-semibold">Invoice not found</h1>
        <Link className="underline underline-offset-4" href="/">
          Back
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <header className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <Link className="underline underline-offset-4" href="/">
            ← Back
          </Link>
          <ConnectWallet />
        </div>
        <h1 className="text-2xl font-bold mt-3">{invoice.reference}</h1>
        <p className="text-gray-600 mt-1">{invoice.vendorName}</p>
      </header>

      <section className="rounded-xl border p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-gray-500">Status</div>
            <div className="font-medium">{invoice.status}</div>
          </div>

          <div>
            <div className="text-gray-500">Due date</div>
            <div className="font-medium">{invoice.dueDate}</div>
          </div>

          <div>
            <div className="text-gray-500">Amount</div>
            <div className="font-medium">
              {formatUsdc(invoice.amountUsdc)} {invoice.currency}
            </div>
            <div className="text-xs text-gray-500">
              (display: ${invoice.amountUsd})
            </div>
          </div>

          <div>
            <div className="text-gray-500">Vendor address</div>
            <div className="font-mono text-xs break-all">
              {invoice.vendorAddress}
            </div>

            <div className="mt-3 text-sm">
              <a
                className="underline underline-offset-4"
                href={usdcExplorerUrl()}
                target="_blank"
                rel="noreferrer"
              >
                View USDC token on BaseScan
              </a>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="text-gray-500 text-sm">Description</div>
          <div className="mt-1">{invoice.description}</div>
        </div>

        <div className="mt-6 flex gap-3 items-start">
          <PaymentButton invoice={invoice} />

          <Link
            href={`/invoice/${invoice.id}/status`}
            className="rounded-lg px-4 py-2 border hover:bg-gray-50"
          >
            View status
          </Link>
        </div>
      </section>
    </main>
  );
}
