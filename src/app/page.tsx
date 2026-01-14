// src/app/page.tsx
import { InvoiceCard } from "@/components/InvoiceCard";
import { listInvoices } from "@/lib/invoices";
import { usdcExplorerUrl } from "@/lib/usdc";
import { ConnectWallet } from "@/components/ConnectWallet";

export default function HomePage() {
  const invoices = listInvoices();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <main className="max-w-4xl mx-auto px-6 py-8">
        <header className="mb-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Invoice Payment Portal
              </h1>
              <p className="text-gray-600 text-lg">
                Pay with USDC on Base Sepolia
              </p>
            </div>
            <ConnectWallet />
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-sm text-gray-700">
                Secure payments powered by blockchain verification
              </p>
              <a
                className="ml-auto text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                href={usdcExplorerUrl()}
                target="_blank"
                rel="noreferrer"
              >
                View USDC Contract ↗
              </a>
            </div>
          </div>
        </header>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Your Invoices ({invoices.length})
          </h2>
          {invoices.map((inv) => (
            <InvoiceCard key={inv.id} invoice={inv} />
          ))}
        </div>
      </main>
    </div>
  );
}
