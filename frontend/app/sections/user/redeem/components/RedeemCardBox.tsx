"use client";

import React, { useState } from "react";
import { CreditCard } from "lucide-react";
import Card from "@/components/ui/card/Card";
import Button from "@/components/ui/button/Button";
import Input from "@/components/ui/input/Input";

type RedeemCardBoxProps = {
  currentBalance?: number;
  onRedeem?: (code: string) => void;
};

const RedeemCardBox = ({
  currentBalance = 24.5,
  onRedeem,
}: RedeemCardBoxProps) => {
  const [code, setCode] = useState("");

  const isDisabled = code.trim().length === 0;

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
              disabled={isDisabled}
              onClick={() => onRedeem?.(code.trim())}
            >
              Redeem
            </Button>
          </div>

          <p
            className="mt-8 text-lg sm:text-xl"
            style={{ color: "var(--muted)" }}
          >
            Current Quota:{" "}
            <span className="font-semibold" style={{ color: "var(--title)" }}>
              {currentBalance.toFixed(2)}
            </span>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default RedeemCardBox;
