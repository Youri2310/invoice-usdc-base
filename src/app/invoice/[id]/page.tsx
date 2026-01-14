// src/app/invoice/[id]/page.tsx
"use client";
import Link from "next/link";
import { use, useState } from "react";
import { getInvoiceById } from "@/lib/invoices";
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
  const invoice = getInvoiceById(id);
  const { isPaid, hasError, txHash, errorMessage } = useInvoicePayment(id);
  const [showErrorDetails, setShowErrorDetails] = useState(false);

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

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invoice not found</h1>
          <p className="text-gray-600 mb-6">The invoice you're looking for doesn't exist.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Invoices
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <main className="max-w-4xl mx-auto px-6 py-8">
        <header className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </Link>
            <ConnectWallet />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{invoice.reference}</h1>
            <p className="text-lg text-gray-600">{invoice.vendorName}</p>
          </div>
        </header>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Status Banner */}
          {isPaid && (
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 text-white">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-semibold">Invoice Paid</p>
                  <p className="text-sm text-green-100">This invoice has been successfully paid</p>
                </div>
              </div>
            </div>
          )}
          
          {hasError && (
            <div className="bg-gradient-to-r from-red-500 to-rose-500 p-4 text-white">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-semibold">Payment Failed</p>
                  <p className="text-sm text-red-100">Previous payment attempt was unsuccessful</p>
                </div>
              </div>
            </div>
          )}

          <div className="p-8">
            {/* Invoice Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 font-medium">Status</div>
                    <div className={`text-lg font-bold ${isPaid ? "text-green-600" : hasError ? "text-red-600" : "text-yellow-600"}`}>
                      {isPaid ? "PAID" : hasError ? "ERROR" : invoice.status}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 font-medium">Due date</div>
                    <div className="text-lg font-bold text-gray-900">{invoice.dueDate}</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-600 font-medium mb-1">Amount</div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-3xl font-bold text-gray-900">{formatUsdc(invoice.amountUsdc)}</div>
                      <div className="text-lg font-semibold text-gray-600">{invoice.currency}</div>
                      <div className="text-sm text-gray-500">(≈ ${invoice.amountUsd})</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">Description</h3>
              <p className="text-gray-800 leading-relaxed">{invoice.description}</p>
            </div>

            {/* Vendor Info */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-8">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">Vendor Information</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-600">Wallet Address:</span>
                  <p className="font-mono text-sm text-gray-900 break-all mt-1">{invoice.vendorAddress}</p>
                </div>
                <a
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium mt-3"
                  href={usdcExplorerUrl()}
                  target="_blank"
                  rel="noreferrer"
                >
                  View USDC Contract on BaseScan
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Payment Action or Success */}
            {isPaid ? (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-green-900 mb-2">Payment Successful!</h3>
                    <p className="text-green-700 mb-4">This invoice has been paid and verified on the blockchain.</p>
                    {txHash && (
                      <div className="mb-4 p-3 bg-white rounded-xl border border-green-200">
                        <div className="text-xs text-gray-600 mb-1">Transaction Hash</div>
                        <a
                          href={txUrl(txHash)}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-sm text-blue-600 hover:text-blue-700 break-all"
                        >
                          {txHash}
                        </a>
                      </div>
                    )}
                    <Link
                      href={`/invoice/${invoice.id}/status`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
                    >
                      View Payment Receipt
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <PaymentButton invoice={invoice} />
            )}

            {/* Error Details */}
            {hasError && errorMessage && (
              <div className="mt-6 bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl p-6 border-2 border-red-200">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-bold text-red-900 mb-2">Last payment attempt failed</div>
                    <div className="text-red-700 mb-4">{getCleanErrorMessage(errorMessage)}</div>
                    
                    {txHash && (
                      <div className="mb-4 p-3 bg-white rounded-xl border border-red-200">
                        <a
                          href={txUrl(txHash)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          View transaction on BaseScan
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    )}

                    <button
                      className="inline-flex items-center gap-2 text-sm font-medium text-red-700 hover:text-red-900 transition-colors"
                      onClick={() => setShowErrorDetails(!showErrorDetails)}
                    >
                      {showErrorDetails ? (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                          Hide technical details
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                          Show technical details
                        </>
                      )}
                    </button>
                    
                    {showErrorDetails && (
                      <pre className="bg-white border border-red-200 rounded-xl p-4 mt-4 text-xs text-red-800 overflow-auto shadow-inner max-h-48 whitespace-pre-wrap break-all">
                        {errorMessage}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
