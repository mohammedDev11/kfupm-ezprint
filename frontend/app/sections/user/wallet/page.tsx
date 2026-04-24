import React from "react";
import PageIntro from "@/components/shared/page/Text/PageIntro";
import WalletOverview from "./components/WalletOverview";

const page = () => {
  return (
    <div className="space-y-6">
      <PageIntro
        title="Wallet"
        description="Review your balance, quota activity, and recent wallet transactions."
      />
      <WalletOverview />
    </div>
  );
};

export default page;
