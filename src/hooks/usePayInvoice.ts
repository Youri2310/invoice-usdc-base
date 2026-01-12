"use client";
import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { getUsdcAddress, erc20Abi } from "@/lib/usdc";
import type { Invoice } from "@/lib/invoices";

export type PaymentState = "idle" | "signing" | "pending" | "confirmed" | "error";

export function usePayInvoice() {
  const { address, isConnected, chain } = useAccount();
  const { writeContract, data: hash, error: writeError, reset } = useWriteContract();
  const { isLoading: isPending, isSuccess } = useWaitForTransactionReceipt({ 
    hash 
  });

  const [state, setState] = useState<PaymentState>("idle");

  // Mettre à jour l'état en fonction de la transaction
  useEffect(() => {
    if (isPending && state !== "pending") {
      setState("pending");
    }
    if (isSuccess && state !== "confirmed") {
      setState("confirmed");
    }
  }, [isPending, isSuccess, state]);

  const payInvoice = async (invoice: Invoice) => {
    if (!isConnected || !address) {
      throw new Error("Wallet not connected");
    }

    if (chain?.id !== 84532) {
      throw new Error("Please switch to Base Sepolia");
    }

    try {
      setState("signing");

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
    error: writeError,
    resetPayment,
  };
}
