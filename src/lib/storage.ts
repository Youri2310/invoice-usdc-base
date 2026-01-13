// src/lib/storage.ts
// Gestion de la persistance des paiements dans localStorage

export type PaymentRecord = {
  invoiceId: string;
  txHash: `0x${string}`;
  timestamp: number;
  amount: string;
  vendor: string;
  status: "success" | "failed";
  errorMessage?: string;
};

const STORAGE_KEY = "invoice-payments";

// Récupérer tous les paiements
export function getPayments(): PaymentRecord[] {
  if (typeof window === "undefined") return [];
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading payments from localStorage:", error);
    return [];
  }
}

// Récupérer le paiement d'une facture spécifique
export function getPaymentByInvoiceId(invoiceId: string): PaymentRecord | null {
  const payments = getPayments();
  return payments.find((p) => p.invoiceId === invoiceId) || null;
}

// Sauvegarder un nouveau paiement
export function savePayment(payment: PaymentRecord): void {
  if (typeof window === "undefined") return;
  
  try {
    const payments = getPayments();
    
    // Vérifier si le paiement existe déjà
    const existingIndex = payments.findIndex((p) => p.invoiceId === payment.invoiceId);
    
    if (existingIndex >= 0) {
      // Mettre à jour le paiement existant
      payments[existingIndex] = payment;
    } else {
      // Ajouter un nouveau paiement
      payments.push(payment);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payments));
  } catch (error) {
    console.error("Error saving payment to localStorage:", error);
  }
}

// Vérifier si une facture a été payée avec succès
export function isInvoicePaid(invoiceId: string): boolean {
  const payment = getPaymentByInvoiceId(invoiceId);
  return payment !== null && payment.status === "success";
}

// Vérifier si une facture a une erreur de paiement
export function hasPaymentError(invoiceId: string): boolean {
  const payment = getPaymentByInvoiceId(invoiceId);
  return payment !== null && payment.status === "failed";
}

// Supprimer un paiement (utile pour les tests)
export function deletePayment(invoiceId: string): void {
  if (typeof window === "undefined") return;
  
  try {
    const payments = getPayments();
    const filtered = payments.filter((p) => p.invoiceId !== invoiceId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error deleting payment from localStorage:", error);
  }
}

// Effacer tous les paiements (utile pour les tests)
export function clearAllPayments(): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing payments from localStorage:", error);
  }
}
