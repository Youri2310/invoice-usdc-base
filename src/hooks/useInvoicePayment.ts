"use client";
import { useState, useEffect } from "react";
import { getPaymentByInvoiceId, hasPaymentError, type PaymentRecord } from "@/lib/storage";

export function useInvoicePayment(invoiceId: string) {
  const [payment, setPayment] = useState<PaymentRecord | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Charger le paiement depuis localStorage
    const paymentRecord = getPaymentByInvoiceId(invoiceId);
    setPayment(paymentRecord);
    setIsPaid(paymentRecord !== null && paymentRecord.status === "success");
    setHasError(hasPaymentError(invoiceId));
  }, [invoiceId]);

  return {
    payment,
    isPaid,
    hasError,
    txHash: payment?.txHash,
    errorMessage: payment?.errorMessage,
  };
}
