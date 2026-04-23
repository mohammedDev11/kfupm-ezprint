"use client";

import React, { useEffect, useState } from "react";
import { CreditCard } from "lucide-react";
import Card from "@/components/ui/card/Card";
import Button from "@/components/ui/button/Button";
import Input from "@/components/ui/input/Input";
import { apiGet, apiPost } from "@/services/api";

type RedeemCardBoxProps = {
  currentBalance?: number;
  onRedeem?: (code: string) => void;
};

const RedeemCardBox = ({
  currentBalance = 24.5,
  onRedeem,
}: RedeemCardBoxProps) => {
  const [code, setCode] = useState("");
  const [balance, setBalance] = useState(currentBalance);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"success" | "error">("success");

  const isDisabled = code.trim().length === 0;

  useEffect(() => {
    let mounted = true;

    apiGet<{ quota: number }>("/user/quota/overview", "user")
      .then((data) => {
        if (!mounted || typeof data?.quota !== "number") {
          return;
        }

        setBalance(data.quota);
      })
      .catch(() => {
        // Keep the current balance fallback if the request fails.
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleRedeem = async () => {
    const normalizedCode = code.trim().toUpperCase();

    if (!normalizedCode) {
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const response = await apiPost<{
        quota?: number;
        balance?: number;
        message?: string;
      }>("/user/quota/redeem", { code: normalizedCode }, "user");

      if (typeof response?.quota === "number") {
        setBalance(response.quota);
      } else if (typeof response?.balance === "number") {
        setBalance(response.balance);
      }

      setMessage(response?.message || "Redeem request completed.");
      setMessageTone("success");
      setCode("");
      onRedeem?.(normalizedCode);
    } catch (requestError) {
      setMessage(
        requestError instanceof Error
          ? requestError.message
          : "Unable to redeem the code.",
      );
      setMessageTone("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Card className="overflow-hidden px-5 py-8 sm:px-8 sm:py-10">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <div
            className="mb-8 flex h-28 w-28 items-center justify-center rounded-[28px]"
            style={{
              background: "rgba(55, 125, 255, 0.10)",
              color: "var(--color-brand-500)",
            }}
          >
            <CreditCard size={42} />
          </div>

          <h2 className="title-lg">Redeem Card</h2>

          <p className="paragraph mt-3 max-w-xl text-base sm:text-lg">
            Enter your voucher code to add Quota
          </p>

          <div className="mt-10 w-full">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ENTER VOUCHER CODE"
              maxLength={24}
            />
          </div>

          <div className="mt-7 w-full">
            <Button
              variant="primary"
              size="lg"
              className="h-20 w-full text-2xl font-semibold"
              disabled={isDisabled || submitting}
              onClick={handleRedeem}
            >
              {submitting ? "Redeeming..." : "Redeem"}
            </Button>
          </div>

          {message ? (
            <div
              className={`mt-6 w-full rounded-xl px-4 py-3 text-sm ${
                messageTone === "success"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {message}
            </div>
          ) : null}

          <p
            className="mt-8 text-lg sm:text-xl"
            style={{ color: "var(--muted)" }}
          >
            Current Quota:{" "}
            <span className="font-semibold" style={{ color: "var(--title)" }}>
              {balance.toFixed(2)}
            </span>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default RedeemCardBox;
