"use client";

import { walletSummaryCards } from "@/lib/mock-data/User/wallet";
import GeneralLineChart from "@/components/shared/charts/GeneralLineChart";
import Button from "@/components/ui/button/Button";
import Card from "@/components/ui/card/Card";
import { apiGet } from "@/services/api";
import {
  ArrowDownLeft,
  CreditCard,
  Gift,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import WalletTransactionsTable from "./WalletTransactionsTable";
// import GeneralLineChart from "@/components/ui/card/GeneralLineChart";

const WalletOverview = () => {
  const [summaryCards, setSummaryCards] = useState(walletSummaryCards);
  const [quotaBalance, setQuotaBalance] = useState(245.5);

  const balance = quotaBalance;
  const totalSpent = 128.75;
  const totalRedeemed = 80;
  const pendingAmount = 36.75;

  useEffect(() => {
    let mounted = true;

    apiGet<{
      quota: number;
      walletSummaryCards: Array<{
        title: string;
        value: string;
        helperText: string;
      }>;
    }>("/user/quota/overview", "user")
      .then((data) => {
        if (!mounted) return;
        if (typeof data?.quota === "number") {
          setQuotaBalance(data.quota);
        }
        if (data?.walletSummaryCards?.length) {
          setSummaryCards((prev) =>
            prev.map((card, index) => ({
              ...card,
              value: data.walletSummaryCards[index]?.value ?? card.value,
              helperText:
                data.walletSummaryCards[index]?.helperText ?? card.helperText,
            })),
          );
        }
      })
      .catch(() => {
        // Keep local fallback if API is unavailable.
      });

    return () => {
      mounted = false;
    };
  }, []);

  const walletActivityData = [
    { day: "M", spent: 18, redeemed: 8 },
    { day: "T", spent: 26, redeemed: 12 },
    { day: "W", spent: 22, redeemed: 10 },
    { day: "T", spent: 35, redeemed: 16 },
    { day: "F", spent: 28, redeemed: 14 },
    { day: "S", spent: 42, redeemed: 9 },
    { day: "S", spent: 31, redeemed: 11 },
  ];

  const walletMetricsConfig = {
    spent: {
      label: "Spent",
      color: "var(--color-warning-500)",
    },
    redeemed: {
      label: "Redeemed",
      color: "var(--color-brand-500)",
    },
  };

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

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
                  {balance.toFixed(2)} SAR
                </h2>
                <p
                  style={{ color: "var(--paragraph)" }}
                  className="max-w-xl text-sm leading-7"
                >
                  Manage your wallet balance, redeem codes, review top-ups, and
                  keep track of all payment-related activity in one place.
                </p>
              </div>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto lg:shrink-0">
              {" "}
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
                420.00 SAR
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
                {totalSpent.toFixed(2)} SAR
              </p>
            </div>

            <div className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <div
                style={{ color: "var(--muted)" }}
                className="mb-2 flex items-center gap-2 text-sm font-medium"
              >
                <TrendingUp className="h-4 w-4 text-brand-600" />
                Pending
              </div>
              <p
                style={{ color: "var(--title)" }}
                className="text-xl font-semibold"
              >
                {pendingAmount.toFixed(2)} SAR
              </p>
            </div>
          </div>
        </Card>

        <GeneralLineChart
          title="Monthly Activity"
          data={walletActivityData}
          metricsConfig={walletMetricsConfig}
          xDataKey="day"
          height={320}
          showFilter={true}
          showLegend={true}
          showMoreButton={false}
          yDomain={[0, 50]}
        />
      </div>

      <WalletTransactionsTable />
    </section>
  );
};

export default WalletOverview;
