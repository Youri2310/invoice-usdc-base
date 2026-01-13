"use client";
import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { getUsdcAddress, erc20Abi, formatUsdc } from "@/lib/usdc";
import { savePayment } from "@/lib/storage";
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
      
      // Sauvegarder le paiement dans localStorage
      if (hash && currentInvoice) {
        savePayment({
          invoiceId: currentInvoice.id,
          txHash: hash,
          timestamp: Date.now(),
          amount: formatUsdc(currentInvoice.amountUsdc),
          vendor: currentInvoice.vendorAddress,
          status: "success",
        });
      }
    }
    // Gérer l'erreur de receipt (transaction échouée on-chain)
    if (isReceiptError && state !== "error") {
      setState("error");
      
      // Sauvegarder l'erreur dans localStorage
      if (hash && currentInvoice && receiptError) {
        savePayment({
          invoiceId: currentInvoice.id,
          txHash: hash,
          timestamp: Date.now(),
          amount: formatUsdc(currentInvoice.amountUsdc),
          vendor: currentInvoice.vendorAddress,
          status: "failed",
          errorMessage: receiptError.message || "Transaction failed",
        });
      }
    }
  }, [isPending, isSuccess, isReceiptError, state, hash, currentInvoice]);

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
