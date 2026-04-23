"use client";

import GeneralLineChart from "@/components/shared/charts/GeneralLineChart";
import Button from "@/components/ui/button/Button";
import Card from "@/components/ui/card/Card";
import { apiGet } from "@/services/api";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Gift,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import WalletTransactionsTable from "./WalletTransactionsTable";

type SummaryCardItem = {
  title: string;
  value: string;
  helperText: string;
  iconKey: "wallet" | "arrow-down-left" | "arrow-up-right" | "gift";
};

type WalletOverviewResponse = {
  quota: number;
  balance: number;
  walletSummaryCards: SummaryCardItem[];
};

type WalletTransaction = {
  id: string;
  description: string;
  type: string;
  amount: number;
  date: string;
  dateOrder: number;
  status: string;
  direction: "in" | "out";
  balanceAfter: number;
  method: string;
  note: string;
};

const iconMap = {
  wallet: Wallet,
  "arrow-down-left": ArrowDownLeft,
  "arrow-up-right": ArrowUpRight,
  gift: Gift,
};

const walletMetricsConfig = {
  spent: {
    label: "Spent",
    color: "var(--color-warning-500)",
  },
  redeemed: {
    label: "Credits",
    color: "var(--color-brand-500)",
  },
};

const WalletOverview = () => {
  const [summaryCards, setSummaryCards] = useState<SummaryCardItem[]>([]);
  const [quotaBalance, setQuotaBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      apiGet<WalletOverviewResponse>("/user/quota/overview", "user"),
      apiGet<{ transactions: WalletTransaction[] }>(
        "/user/quota/transactions",
        "user",
      ),
    ])
      .then(([overview, transactionData]) => {
        if (!mounted) {
          return;
        }

        setQuotaBalance(
          typeof overview?.quota === "number"
            ? overview.quota
            : overview?.balance || 0,
        );
        setSummaryCards(overview?.walletSummaryCards || []);
        setTransactions(transactionData?.transactions || []);
      })
      .catch(() => {
        if (!mounted) {
          return;
        }

        setSummaryCards([]);
        setTransactions([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const totals = useMemo(() => {
    const incoming = transactions
      .filter((item) => item.direction === "in")
      .reduce((sum, item) => sum + item.amount, 0);
    const outgoing = transactions
      .filter((item) => item.direction === "out")
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      incoming,
      outgoing,
      count: transactions.length,
    };
  }, [transactions]);

  const walletActivityData = useMemo(() => {
    const lastSevenDays = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const key = date.toISOString().slice(0, 10);

      return {
        key,
        label: date.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 1),
        spent: 0,
        redeemed: 0,
      };
    });

    const lookup = new Map(lastSevenDays.map((item) => [item.key, item]));

    transactions.forEach((transaction) => {
      const item = lookup.get(
        `${String(transaction.dateOrder).slice(0, 4)}-${String(transaction.dateOrder).slice(4, 6)}-${String(transaction.dateOrder).slice(6, 8)}`,
      );

      if (!item) {
        return;
      }

      if (transaction.direction === "out") {
        item.spent += transaction.amount;
      } else {
        item.redeemed += transaction.amount;
      }
    });

    return lastSevenDays.map((item) => ({
      day: item.label,
      spent: Number(item.spent.toFixed(2)),
      redeemed: Number(item.redeemed.toFixed(2)),
    }));
  }, [transactions]);

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = iconMap[card.iconKey] || Wallet;

          return (
            <Card key={card.title} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <p
                    style={{ color: "var(--muted)" }}
                    className="text-sm font-medium"
                  >
                    {card.title}
                  </p>
                  <h3
                    style={{ color: "var(--title)" }}
                    className="text-2xl font-semibold"
                  >
                    {card.value}
                  </h3>
                  <p style={{ color: "var(--muted)" }} className="text-sm">
                    {card.helperText}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-50 text-brand-600">
                  <Icon className="h-5 w-5" strokeWidth={2.2} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <Card className="p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Wallet className="h-7 w-7" strokeWidth={2.2} />
              </div>

              <div className="space-y-2">
                <p
                  style={{ color: "var(--muted)" }}
                  className="text-sm font-medium"
                >
                  Available Balance
                </p>
                <h2
                  style={{ color: "var(--title)" }}
                  className="text-4xl font-bold tracking-tight"
                >
                  {quotaBalance.toFixed(2)} SAR
                </h2>
                <p
                  style={{ color: "var(--paragraph)" }}
                  className="max-w-xl text-sm leading-7"
                >
                  Wallet balances and transaction history now come from the real
                  quota endpoints in the backend.
                </p>
              </div>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto lg:shrink-0">
              <Button className="w-full lg:min-w-[160px]">
                <ArrowDownLeft className="h-4 w-4" />
                Add Funds
              </Button>
              <Button className="w-full lg:min-w-[160px]">
                <Gift className="h-4 w-4" />
                Redeem Code
              </Button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <div
                style={{ color: "var(--muted)" }}
                className="mb-2 flex items-center gap-2 text-sm font-medium"
              >
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                Total Added
              </div>
              <p
                style={{ color: "var(--title)" }}
                className="text-xl font-semibold"
              >
                {totals.incoming.toFixed(2)} SAR
              </p>
            </div>

            <div className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <div
                style={{ color: "var(--muted)" }}
                className="mb-2 flex items-center gap-2 text-sm font-medium"
              >
                <CreditCard className="h-4 w-4 text-amber-600" />
                Total Spent
              </div>
              <p
                style={{ color: "var(--title)" }}
                className="text-xl font-semibold"
              >
                {totals.outgoing.toFixed(2)} SAR
              </p>
            </div>

            <div className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <div
                style={{ color: "var(--muted)" }}
                className="mb-2 flex items-center gap-2 text-sm font-medium"
              >
                <TrendingUp className="h-4 w-4 text-brand-600" />
                Transactions
              </div>
              <p
                style={{ color: "var(--title)" }}
                className="text-xl font-semibold"
              >
                {totals.count}
              </p>
            </div>
          </div>
        </Card>

        <GeneralLineChart
          title="Recent Wallet Activity"
          data={walletActivityData}
          metricsConfig={walletMetricsConfig}
          xDataKey="day"
          height={320}
          showFilter={false}
          showLegend={true}
          showMoreButton={false}
        />
      </div>

      <WalletTransactionsTable />
    </section>
  );
};

export default WalletOverview;
