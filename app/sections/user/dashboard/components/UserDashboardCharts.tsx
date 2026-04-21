"use client";

import React, { useState } from "react";
import {
  userPrintActivityData,
  userPrintActivityMetricsConfig,
  userPrintUsageData,
  userPrintUsageFilters,
} from "@/Data/User/dashboard";
import GeneralLineChart from "@/app/components/shared/charts/GeneralLineChart";
import GeneralDonutChart from "@/app/components/shared/charts/GeneralDonutChart";

const UserDashboardCharts = () => {
  const [selectedDonutFilter, setSelectedDonutFilter] = useState("This Week");

  return (
    <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      <GeneralLineChart
        title="Weekly Printed Activity"
        data={userPrintActivityData["This Week"]} // fixed (no dropdown needed)
        metricsConfig={userPrintActivityMetricsConfig}
        xDataKey="day"
        showFilter // 👈 use built-in metric filter instead
        showLegend
        showMoreButton={false}
        className="h-full"
      />

      <GeneralDonutChart
        title="Print Usage Breakdown"
        data={userPrintUsageData[selectedDonutFilter]}
        filters={userPrintUsageFilters} // 👈 this one keeps dropdown (correct)
        defaultFilter="This Week"
        totalLabel="pages"
        onFilterChange={setSelectedDonutFilter}
        className="h-full"
      />
    </section>
  );
};

export default UserDashboardCharts;
