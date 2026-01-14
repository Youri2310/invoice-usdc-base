"use client";
import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { getUsdcAddress, erc20Abi } from "@/lib/usdc";
import type { Invoice } from "@/lib/invoices";

export type PaymentState = "idle" | "signing" | "pending" | "confirmed" | "error";

export function usePayInvoice() {
  const { address, isConnected, chain } = useAccount();
  const { writeContract, data: hash, error: writeError, reset } = useWriteContract();
  const { 
    isLoading: isPending, 
    isSuccess, 
    isError: isReceiptError,
    error: receiptError 
  } = useWaitForTransactionReceipt({ 
    hash 
  });

  const [state, setState] = useState<PaymentState>("idle");
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);

  // Mettre à jour l'état en fonction de la transaction
  useEffect(() => {
    if (isPending && state !== "pending") {
      setState("pending");
      
      // Timeout de sécurité : si après 60s toujours pending, passer en erreur
      const timeout = setTimeout(() => {
        if (state === "pending") {
          setState("error");
        }
      }, 60000);
      
      return () => clearTimeout(timeout);
    }
    if (isSuccess && state !== "confirmed") {
      setState("confirmed");
      
      // Appeler l'API de vérification serveur
      if (hash && currentInvoice) {
        fetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            txHash: hash,
            invoiceId: currentInvoice.id,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (!data.success) {
              console.error("Payment verification failed:", data.error);
            }
          })
          .catch((err) => {
            console.error("Error verifying payment:", err);
          });
      }
    }
    // Gérer l'erreur de receipt (transaction échouée on-chain)
    if (isReceiptError && state !== "error") {
      setState("error");
      
      // Enregistrer l'erreur côté serveur
      if (hash && currentInvoice && receiptError) {
        fetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            txHash: hash,
            invoiceId: currentInvoice.id,
          }),
        }).catch((err) => {
          console.error("Error recording failed payment:", err);
        });
      }
    }
  }, [isPending, isSuccess, isReceiptError, state, hash, currentInvoice, receiptError]);

  const payInvoice = async (invoice: Invoice) => {
    if (!isConnected || !address) {
      throw new Error("Wallet not connected");
    }

    if (chain?.id !== 84532) {
      throw new Error("Please switch to Base Sepolia");
    }

    try {
      setState("signing");
      setCurrentInvoice(invoice); // Stocker la facture pour la sauvegarde

      writeContract({
        address: getUsdcAddress(),
        abi: erc20Abi,
        functionName: "transfer",
        args: [invoice.vendorAddress, invoice.amountUsdc],
      });
    } catch (err) {
      setState("error");
      throw err;
    }
  };

  const resetPayment = () => {
    reset();
    setState("idle");
  };

  return {
    payInvoice,
    state,
    txHash: hash,
    error: writeError || receiptError,
    resetPayment,
  };
}
