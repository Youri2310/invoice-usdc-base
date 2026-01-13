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
    <div className="space-y-3">
      <button
        onClick={state === "error" ? resetPayment : handlePay}
        disabled={isDisabled}
        className={`rounded-lg px-4 py-2 font-medium transition-colors ${
          state === "confirmed"
            ? "bg-green-500 text-white"
            : state === "error"
            ? "bg-red-500 text-white hover:bg-red-600"
            : "bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        }`}
      >
        {getButtonText()}
      </button>

      {showConnectMessage && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm font-medium text-yellow-800">
            ⚠️ Please connect your wallet first
          </p>
        </div>
      )}

      {state === "signing" && (
        <p className="text-sm text-gray-600">
          📝 Please sign the transaction in your wallet...
        </p>
      )}

      {state === "pending" && txHash && (
        <div className="text-sm">
          <p className="text-gray-600 mb-1">⏳ Transaction pending...</p>
          <a
            href={txUrl(txHash)}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline underline-offset-4"
          >
            View on BaseScan ↗
          </a>
        </div>
      )}

      {state === "confirmed" && txHash && (
        <div className="text-sm">
          <p className="text-green-600 font-medium mb-1">✓ Payment confirmed!</p>
          <p className="text-gray-600">Redirecting to receipt...</p>
        </div>
      )}

      {state === "error" && error && (
        <div className="text-sm">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="font-medium text-red-800 mb-2">❌ Payment Failed</p>
            <p className="text-red-700 mb-3">
              {getCleanErrorMessage(error.message)}
            </p>
            
            <div className="space-y-2">
              <button
                onClick={() => setShowErrorDetails(!showErrorDetails)}
                className="text-red-600 hover:text-red-800 text-xs font-medium underline underline-offset-2"
              >
                {showErrorDetails ? "Hide details" : "Show details"}
              </button>
              
              {showErrorDetails && (
                <div className="p-2 bg-red-100 rounded text-xs text-red-900 font-mono break-all max-h-40 overflow-y-auto">
                  {error.message}
                </div>
              )}
              
              {txHash && (
                <a
                  href={txUrl(txHash)}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-red-600 hover:text-red-800 underline underline-offset-2 text-xs font-medium"
                >
                  View transaction on BaseScan ↗
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
