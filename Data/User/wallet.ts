import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Gift,
  type LucideIcon,
} from "lucide-react";

/* ================= TYPES ================= */

export type WalletSummaryCard = {
  title: string;
  value: string;
  helperText: string;
  icon: LucideIcon;
};

export type WalletTransactionStatus = "Completed" | "Pending" | "Failed";
export type WalletTransactionDirection = "in" | "out";

export type WalletTransaction = {
  id: string;
  description: string;
  type: string;
  amount: number;
  date: string;
  dateOrder: number;

  status: WalletTransactionStatus;
  direction: WalletTransactionDirection;

  // 🔥 extra for modal
  balanceAfter?: number;
  method?: string;
  note?: string;
};

/* ================= SUMMARY ================= */

export const walletSummaryCards: WalletSummaryCard[] = [
  {
    title: "Wallet Balance",
    value: "245.50 SAR",
    helperText: "Available for future print orders",
    icon: Wallet,
  },
  {
    title: "Funds Added",
    value: "420.00 SAR",
    helperText: "Total top-ups made this month",
    icon: ArrowDownLeft,
  },
  {
    title: "Spent",
    value: "128.75 SAR",
    helperText: "Used for completed print jobs",
    icon: ArrowUpRight,
  },
  {
    title: "Redeemed",
    value: "80.00 SAR",
    helperText: "Added through gift and redeem codes",
    icon: Gift,
  },
];

/* ================= TRANSACTIONS ================= */

export const walletTransactions: WalletTransaction[] = [
  {
    id: "WLT-1001",
    description: "Wallet top-up via card",
    type: "Top Up",
    amount: 100,
    date: "24 Mar 2026",
    dateOrder: 20260324,
    status: "Completed",
    direction: "in",
    balanceAfter: 245.5,
    method: "Credit Card",
  },
  {
    id: "WLT-1002",
    description: "Print order payment",
    type: "Payment",
    amount: 18.5,
    date: "23 Mar 2026",
    dateOrder: 20260323,
    status: "Completed",
    direction: "out",
    balanceAfter: 227,
    method: "Auto Deduction",
  },
  {
    id: "WLT-1003",
    description: "Redeem code applied",
    type: "Redeem",
    amount: 50,
    date: "22 Mar 2026",
    dateOrder: 20260322,
    status: "Completed",
    direction: "in",
    balanceAfter: 208.5,
    method: "Voucher",
  },
  {
    id: "WLT-1004",
    description: "Wallet top-up via Apple Pay",
    type: "Top Up",
    amount: 75,
    date: "20 Mar 2026",
    dateOrder: 20260320,
    status: "Pending",
    direction: "in",
    balanceAfter: 158.5,
    method: "Apple Pay",
  },
  {
    id: "WLT-1005",
    description: "Poster print payment",
    type: "Payment",
    amount: 32.25,
    date: "18 Mar 2026",
    dateOrder: 20260318,
    status: "Completed",
    direction: "out",
    balanceAfter: 83.5,
    method: "Auto Deduction",
  },
  {
    id: "WLT-1006",
    description: "Top-up attempt",
    type: "Top Up",
    amount: 60,
    date: "16 Mar 2026",
    dateOrder: 20260316,
    status: "Failed",
    direction: "in",
    balanceAfter: 83.5,
    method: "Credit Card",
    note: "Payment failed due to insufficient funds",
  },
];
