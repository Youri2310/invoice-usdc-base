"use client";
import { usePayInvoice } from "@/hooks/usePayInvoice";
import type { Invoice } from "@/lib/invoices";
import { txUrl } from "@/lib/chain";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

type Props = {
  invoice: Invoice;
};

export function PaymentButton({ invoice }: Props) {
  const { payInvoice, state, txHash, error, resetPayment } = usePayInvoice();
  const { address, isConnected } = useAccount();
  const [showConnectMessage, setShowConnectMessage] = useState(false);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const router = useRouter();

  // Rediriger vers la page de statut après confirmation
  useEffect(() => {
    if (state === "confirmed" && txHash) {
      setTimeout(() => {
        router.push(`/invoice/${invoice.id}/status?txHash=${txHash}`);
      }, 1500);
    }
  }, [state, txHash, invoice.id, router]);

  const handlePay = async () => {
    // Vérifier si le wallet est connecté
    if (!isConnected) {
      setShowConnectMessage(true);
      setTimeout(() => setShowConnectMessage(false), 3000);
      return;
    }

    try {
      await payInvoice(invoice);
    } catch (err) {
      console.error("Payment failed:", err);
    }
  };

  const getButtonText = () => {
    switch (state) {
      case "idle":
        return "Pay in USDC";
      case "signing":
        return "Signing...";
      case "pending":
        return "Pending...";
      case "confirmed":
        return "✓ Confirmed";
      case "error":
        return "Error - Retry";
    }
  };

  const isDisabled = state === "signing" || state === "pending" || state === "confirmed";

  // Extraire un message d'erreur propre et lisible
  const getCleanErrorMessage = (errorMessage: string): string => {
    // Chercher "execution reverted" ou "reverted with reason"
    if (errorMessage.includes("exceeds balance")) {
      return "Insufficient USDC balance. Please add funds to your wallet.";
    }
    if (errorMessage.includes("rejected") || errorMessage.includes("denied")) {
      return "Transaction was rejected in your wallet.";
    }
    if (errorMessage.includes("Execution reverted")) {
      // Extraire uniquement la partie "ERC20: ..." avant "Raw Call"
      const match = errorMessage.match(/Execution reverted.*?:\s*([^.]+)\./);
      if (match) return match[1];
    }
    if (errorMessage.includes("execution reverted:")) {
      // Extraire le message après "execution reverted:"
      const match = errorMessage.match(/execution reverted:\s*([^.]+)/);
      if (match) return match[1];
    }
    // Message générique si rien ne correspond
    return "Transaction failed. Please try again.";
  };

  return (
    <div className="space-y-4">
      <button
        onClick={state === "error" ? resetPayment : handlePay}
        disabled={isDisabled}
        className={`w-full rounded-xl px-6 py-4 font-semibold text-lg transition-all shadow-lg ${
          state === "confirmed"
            ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
            : state === "error"
            ? "bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600"
            : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed hover:shadow-xl"
        }`}
      >
        {getButtonText()}
      </button>

      {showConnectMessage && (
        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-xl">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-medium text-yellow-800">
              Please connect your wallet first
            </p>
          </div>
        </div>
      )}

      {state === "signing" && (
        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-blue-800 font-medium">
            Please sign the transaction in your wallet...
          </p>
        </div>
      )}

      {state === "pending" && txHash && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-blue-800 font-medium">Transaction pending...</p>
          </div>
          <a
            href={txUrl(txHash)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View on BaseScan
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}

      {state === "confirmed" && txHash && (
        <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-xl">
          <p className="text-sm font-semibold text-green-800 mb-2">✓ Payment confirmed!</p>
          <p className="text-sm text-green-700">Redirecting to receipt...</p>
        </div>
      )}

      {state === "error" && error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl">
          <p className="font-semibold text-red-800 mb-2">❌ Payment Failed</p>
          <p className="text-sm text-red-700 mb-3">
            {getCleanErrorMessage(error.message)}
          </p>
          
          <button
            onClick={() => setShowErrorDetails(!showErrorDetails)}
            className="text-red-600 hover:text-red-800 text-xs font-medium underline underline-offset-2"
          >
            {showErrorDetails ? "Hide technical details" : "Show technical details"}
          </button>
          
          {showErrorDetails && (
            <div className="mt-3 p-3 bg-red-100 rounded-lg text-xs text-red-900 font-mono break-all max-h-40 overflow-y-auto">
              {error.message}
            </div>
          )}
          
          {txHash && (
            <a
              href={txUrl(txHash)}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-800 font-medium"
            >
              View on BaseScan
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      )}
    </div>
  );
}
