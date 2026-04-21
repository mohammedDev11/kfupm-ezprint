"use client";

import SegmentToggle from "@/app/components/shared/actions/SegmentToggle";
import PageIntro from "@/app/components/shared/page/Text/PageIntro";
import { ArrowLeftRight, Wallet } from "lucide-react";
import { useState } from "react";
import SharedAccountsTable from "./tables/SharedAccountsTable";
import TransactionsTable from "./tables/TransactionsTable";
// import SharedAccountsTable from "./tables/SharedAccountsTable";
// import TransactionsTable from "./tables/TransactionsTable";

const page = () => {
  const [activeTab, setActiveTab] = useState("shared-accounts");

  return (
    <div className="space-y-6">
      <PageIntro
        title="Accounts"
        description="Manage shared cost centers and user transaction history."
      />

      <SegmentToggle
        value={activeTab}
        onChange={setActiveTab}
        options={[
          {
            value: "shared-accounts",
            label: "Shared Accounts",
            icon: <Wallet className="h-4 w-4" />,
          },
          {
            value: "transactions",
            label: "Transactions",
            icon: <ArrowLeftRight className="h-4 w-4" />,
          },
        ]}
      />

      {activeTab === "shared-accounts" && <SharedAccountsTable />}
      {activeTab === "transactions" && <TransactionsTable />}
    </div>
  );
};

export default page;
