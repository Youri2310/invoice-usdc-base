// src/app/api/verify-payment/route.ts
import { NextResponse } from "next/server";
import { createPublicClient, http, parseAbiItem, decodeEventLog } from "viem";
import { baseSepolia } from "viem/chains";
import { prisma } from "@/lib/prisma";
import { getUsdcAddress } from "@/lib/usdc";

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

export async function POST(request: Request) {
  try {
    const { txHash, invoiceId } = await request.json();

    if (!txHash || !invoiceId) {
      return NextResponse.json(
        { error: "Missing txHash or invoiceId" },
        { status: 400 }
      );
    }

    // 1. Récupérer la facture depuis la DB
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    // 2. Vérifier si le paiement existe déjà
    const existingPayment = await prisma.payment.findUnique({
      where: { txHash },
    });

    if (existingPayment) {
      return NextResponse.json({
        success: existingPayment.status === "VERIFIED",
        payment: existingPayment,
        message: "Payment already processed",
      });
    }

    // 3. Récupérer la transaction on-chain
    const transaction = await publicClient.getTransaction({
      hash: txHash as `0x${string}`,
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found on-chain" },
        { status: 404 }
      );
    }

    // 4. Récupérer le receipt
    const receipt = await publicClient.getTransactionReceipt({
      hash: txHash as `0x${string}`,
    });

    if (!receipt) {
      return NextResponse.json(
        { error: "Transaction receipt not found" },
        { status: 404 }
      );
    }

    // 5. Vérifier que la transaction a réussi
    if (receipt.status !== "success") {
      const payment = await prisma.payment.create({
        data: {
          invoiceId,
          txHash,
          fromAddress: transaction.from,
          toAddress: transaction.to || "",
          amount: invoice.amountUsdc,
          status: "FAILED",
          errorMessage: "Transaction failed on-chain",
        },
      });

      return NextResponse.json({
        success: false,
        payment,
        error: "Transaction failed on-chain",
      });
    }

    // 6. Parser les logs pour trouver l'event Transfer
    const usdcAddress = getUsdcAddress();
    const transferEvent = parseAbiItem(
      "event Transfer(address indexed from, address indexed to, uint256 value)"
    );

    const transferLogs = receipt.logs.filter(
      (log) =>
        log.address.toLowerCase() === usdcAddress.toLowerCase()
    );

    if (transferLogs.length === 0) {
      return NextResponse.json(
        { error: "No USDC Transfer event found in transaction" },
        { status: 400 }
      );
    }

    // 7. Décoder le log Transfer
    const log = transferLogs[0];
    const decodedLog = decodeEventLog({
      abi: [transferEvent],
      data: log.data,
      topics: log.topics,
    });

    const { to, value } = decodedLog.args as { from: string; to: string; value: bigint };

    // 8. Vérifier le destinataire et le montant
    const expectedAmount = BigInt(invoice.amountUsdc);
    const expectedRecipient = invoice.vendorAddress.toLowerCase();
    const actualRecipient = to.toLowerCase();

    if (actualRecipient !== expectedRecipient) {
      const payment = await prisma.payment.create({
        data: {
          invoiceId,
          txHash,
          fromAddress: transaction.from,
          toAddress: actualRecipient,
          amount: value.toString(),
          status: "FAILED",
          errorMessage: `Wrong recipient: expected ${expectedRecipient}, got ${actualRecipient}`,
        },
      });

      return NextResponse.json({
        success: false,
        payment,
        error: "Payment sent to wrong address",
      });
    }

    if (value < expectedAmount) {
      const payment = await prisma.payment.create({
        data: {
          invoiceId,
          txHash,
          fromAddress: transaction.from,
          toAddress: actualRecipient,
          amount: value.toString(),
          status: "FAILED",
          errorMessage: `Insufficient amount: expected ${expectedAmount}, got ${value}`,
        },
      });

      return NextResponse.json({
        success: false,
        payment,
        error: "Insufficient payment amount",
      });
    }

    // 9. Tout est OK ! Créer le paiement VERIFIED
    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        txHash,
        fromAddress: transaction.from,
        toAddress: actualRecipient,
        amount: value.toString(),
        status: "VERIFIED",
        verifiedAt: new Date(),
      },
    });

    // 10. Mettre à jour le statut de la facture
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: "PAID" },
    });

    return NextResponse.json({
      success: true,
      payment,
      message: "Payment verified successfully",
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: (error as Error).message },
      { status: 500 }
    );
  }
}
