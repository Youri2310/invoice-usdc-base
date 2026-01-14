// src/app/invoice/[id]/page.tsx
"use client";
import Link from "next/link";
import { use, useState, useEffect } from "react";
import type { Invoice } from "@/lib/invoices";
import { formatUsdc, usdcExplorerUrl } from "@/lib/usdc";
import { PaymentButton } from "@/components/PaymentButton";
import { ConnectWallet } from "@/components/ConnectWallet";
import { useInvoicePayment } from "@/hooks/useInvoicePayment";
import { txUrl } from "@/lib/chain";

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const { isPaid, hasError, txHash, errorMessage } = useInvoicePayment(id);
  const [showErrorDetails, setShowErrorDetails] = useState(false);

  useEffect(() => {
    fetch(`/api/invoice/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setInvoice(data.invoice);
      })
      .catch((err) => {
        console.error("Error fetching invoice:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  // Extraire un message d'erreur propre et lisible
  const getCleanErrorMessage = (errorMessage: string): string => {
    if (errorMessage.includes("exceeds balance")) {
      return "Insufficient USDC balance";
    }
    if (errorMessage.includes("rejected") || errorMessage.includes("denied")) {
      return "Transaction was rejected";
    }
    if (errorMessage.includes("Execution reverted")) {
      const match = errorMessage.match(/Execution reverted.*?:\s*([^.]+)\./);
      if (match) return match[1];
    }
    if (errorMessage.includes("execution reverted:")) {
      const match = errorMessage.match(/execution reverted:\s*([^.]+)/);
      if (match) return match[1];
    }
    return "Transaction failed on-chain";
  };

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <div className="text-center text-gray-500">Loading invoice...</div>
      </main>
    );
  }

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
            <div className={`font-medium ${isPaid ? "text-green-600" : hasError ? "text-red-600" : ""}`}>
              {isPaid ? "PAID" : hasError ? "ERROR" : invoice.status}
            </div>
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

        {isPaid && txHash && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-sm font-medium text-green-800 mb-1">
              ✓ Invoice already paid
            </div>
            <div className="text-xs text-green-700">
              Transaction:{" "}
              <a
                href={txUrl(txHash)}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2"
              >
                {txHash.slice(0, 10)}...{txHash.slice(-8)}
              </a>
            </div>
          </div>
        )}

        {hasError && txHash && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-sm font-medium text-red-800 mb-2">
              ❌ Previous payment failed
            </div>
            <div className="text-sm text-red-700 mb-3">
              {errorMessage ? getCleanErrorMessage(errorMessage) : "Transaction failed on-chain"}
            </div>
            
            <div className="space-y-2">
              <button
                onClick={() => setShowErrorDetails(!showErrorDetails)}
                className="text-red-600 hover:text-red-800 text-xs font-medium underline underline-offset-2"
              >
                {showErrorDetails ? "Hide details" : "Show details"}
              </button>
              
              {showErrorDetails && errorMessage && (
                <div className="p-2 bg-red-100 rounded text-xs text-red-900 font-mono break-all max-h-40 overflow-y-auto">
                  {errorMessage}
                </div>
              )}
              
              <a
                href={txUrl(txHash)}
                target="_blank"
                rel="noreferrer"
                className="block text-red-600 hover:text-red-800 underline underline-offset-2 text-xs font-medium"
              >
                View transaction on BaseScan ↗
              </a>
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-3 items-start">
          {!isPaid ? (
            <PaymentButton invoice={invoice} />
          ) : (
            <Link
              href={`/invoice/${invoice.id}/status`}
              className="rounded-lg px-4 py-2 bg-green-500 text-white hover:bg-green-600"
            >
              View Receipt
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
