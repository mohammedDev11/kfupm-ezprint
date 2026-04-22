"use client";
import {
  printingActivityDataByFilter,
  printingActivityFilters,
  summaryChartData,
  summaryMetricsConfig,
} from "@/lib/mock-data/Admin/dashboard/dashboard";
import GeneralDonutChart from "@/components/shared/charts/GeneralDonutChart";
import GeneralLineChart from "@/components/shared/charts/GeneralLineChart";
import PageIntro from "@/components/shared/page/Text/PageIntro";
import { useState } from "react";
import PrinterStatusTable from "./PrinterStatusTable";
import TopCards from "./TopCards";

const Page = () => {
  const [filter, setFilter] =
    useState<keyof typeof printingActivityDataByFilter>("Today");

  return (
    <div className="flex flex-col gap-10">
      <PageIntro
        title="Dashboard"
        description="Monitor printers, users, jobs, and system activity from one place."
      />
      <TopCards />
      <PrinterStatusTable />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <GeneralLineChart
          title="Summary Chart"
          data={summaryChartData}
          metricsConfig={summaryMetricsConfig}
          xDataKey="label"
          height={320}
          yDomain={[0, 220]}
          className="min-w-0"
        />

        <GeneralDonutChart
          title="Printing Activity"
          data={printingActivityDataByFilter[filter]}
          filters={printingActivityFilters}
          defaultFilter={filter}
          onFilterChange={(value) =>
            setFilter(value as keyof typeof printingActivityDataByFilter)
          }
          totalLabel="pages"
          valueSuffix="pages"
          chartSize={210}
          innerRadius={58}
          outerRadius={84}
          className="min-w-0"
        />
      </div>
      <span className="mb-96"></span>
    </div>
  );
};

export default Page;
