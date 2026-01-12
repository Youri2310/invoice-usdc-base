"use client";
import { usePayInvoice } from "@/hooks/usePayInvoice";
import type { Invoice } from "@/lib/invoices";
import { txUrl } from "@/lib/chain";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type Props = {
  invoice: Invoice;
};

export function PaymentButton({ invoice }: Props) {
  const { payInvoice, state, txHash, error, resetPayment } = usePayInvoice();
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
        <div className="text-sm text-red-600">
          <p className="font-medium">❌ Error occurred</p>
          <p className="mt-1">{error.message}</p>
        </div>
      )}
    </div>
  );
}
