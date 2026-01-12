// app/invoice/[id]/status/page.tsx
"use client";
import Link from "next/link";
import { use } from "react";
import { useSearchParams } from "next/navigation";
import { getInvoiceById } from "@/lib/invoices";
import { formatUsdc } from "@/lib/usdc";
import { txUrl } from "@/lib/chain";

export default function InvoiceStatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const txHash = searchParams.get("txHash");
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
        <Link
          className="underline underline-offset-4"
          href={`/invoice/${invoice.id}`}
        >
          ← Back to invoice
        </Link>
        <h1 className="text-2xl font-bold mt-3">Payment Receipt</h1>
        <p className="text-gray-600 mt-1">{invoice.reference}</p>
      </header>

      <section className="rounded-xl border p-6 bg-white">
        {txHash ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600 mb-4">
              <span className="text-2xl">✓</span>
              <span className="font-semibold text-lg">Payment Confirmed</span>
            </div>

            <div className="grid gap-4 text-sm">
              <div>
                <div className="text-gray-500">Invoice</div>
                <div className="font-medium">{invoice.reference}</div>
              </div>

              <div>
                <div className="text-gray-500">Vendor</div>
                <div className="font-medium">{invoice.vendorName}</div>
              </div>

              <div>
                <div className="text-gray-500">Amount Paid</div>
                <div className="font-medium text-lg">
                  {formatUsdc(invoice.amountUsdc)} USDC
                </div>
              </div>

              <div>
                <div className="text-gray-500">Recipient Address</div>
                <div className="font-mono text-xs break-all">
                  {invoice.vendorAddress}
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="text-gray-500 mb-2">Transaction Hash</div>
                <div className="font-mono text-xs break-all mb-3 bg-gray-50 p-3 rounded">
                  {txHash}
                </div>
                <a
                  href={txUrl(txHash)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 underline underline-offset-4"
                >
                  View on BaseScan ↗
                </a>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm">
              <p className="text-gray-700">
                <strong>Note:</strong> This transaction has been confirmed
                on-chain. The payment is final and cannot be reversed.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-4">
              <div className="text-4xl mb-2">📄</div>
              <p>No transaction found</p>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Complete the payment to see the receipt here.
            </p>
            <Link
              href={`/invoice/${invoice.id}`}
              className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Go to invoice
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
