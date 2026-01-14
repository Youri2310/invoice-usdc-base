"use client";
import { useState, useEffect } from "react";

type PaymentData = {
  id: string;
  invoiceId: string;
  txHash: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
  status: string;
  errorMessage: string | null;
  verifiedAt: string | null;
  createdAt: string;
};

export function useInvoicePayment(invoiceId: string) {
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Charger le paiement depuis l'API serveur
    setLoading(true);
    fetch(`/api/payment/${invoiceId}`)
      .then((res) => res.json())
      .then((data) => {
        setPayment(data.payment);
        setIsPaid(data.payment !== null && data.payment.status === "VERIFIED");
        setHasError(data.payment !== null && data.payment.status === "FAILED");
      })
      .catch((err) => {
        console.error("Error fetching payment:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [invoiceId]);

  return {
    payment,
    isPaid,
    hasError,
    loading,
    txHash: payment?.txHash as `0x${string}` | undefined,
    errorMessage: payment?.errorMessage,
  };
}
