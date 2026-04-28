"use client";

import React, { useMemo, useState } from "react";
import {
  userPrintActivityData,
  userPrintActivityMetricsConfig,
  userPrintUsageData,
  userPrintUsageFilters,
} from "@/lib/mock-data/User/dashboard";
import GeneralLineChart from "@/components/shared/charts/GeneralLineChart";
import GeneralDonutChart from "@/components/shared/charts/GeneralDonutChart";

const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

const formatCompactDate = (date: Date) =>
  date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

const getCurrentWeekDateRange = () => {
  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const mondayOffset = (startOfToday.getDay() + 6) % 7;
  const weekStart = addDays(startOfToday, -mondayOffset);
  const weekEnd = addDays(weekStart, 6);

  return `${formatCompactDate(weekStart)} - ${formatCompactDate(weekEnd)}`;
};

const UserDashboardCharts = () => {
  const [selectedDonutFilter, setSelectedDonutFilter] = useState("This Week");
  const weeklyActivityData = useMemo(() => {
    const dateRange = getCurrentWeekDateRange();

    return userPrintActivityData["This Week"].map((item) => ({
      ...item,
      dateRange,
    }));
  }, []);

  return (
    <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      <GeneralLineChart
        title="Weekly Printed Activity"
        data={weeklyActivityData} // fixed (no dropdown needed)
        metricsConfig={userPrintActivityMetricsConfig}
        xDataKey="day"
        showFilter // 👈 use built-in metric filter instead
        showLegend
        showTooltipDateRange
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
