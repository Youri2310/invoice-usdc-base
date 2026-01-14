// src/app/page.tsx
"use client";
import { useEffect, useState } from "react";
import { InvoiceCard } from "@/components/InvoiceCard";
import type { Invoice } from "@/lib/invoices";
import { usdcExplorerUrl } from "@/lib/usdc";
import { ConnectWallet } from "@/components/ConnectWallet";

export default function HomePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/invoices")
      .then((res) => res.json())
      .then((data) => {
        setInvoices(data.invoices);
      })
      .catch((err) => {
        console.error("Error fetching invoices:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <main className="max-w-3xl mx-auto p-6">
      <header className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">
            Invoices (USDC on Base Sepolia)
          </h1>
          <ConnectWallet />
        </div>
        <p className="text-gray-600 mt-1">
          N3: Server-side verification with blockchain parsing
        </p>

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
      </header>

      {loading ? (
        <div className="text-center text-gray-500">Loading invoices...</div>
      ) : (
        <div className="flex flex-col gap-3">
          {invoices.map((inv) => (
            <InvoiceCard key={inv.id} invoice={inv} />
          ))}
        </div>
      )}
    </main>
  );
}
