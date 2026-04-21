"use client";

import React, { useMemo, useState } from "react";
import {
  BarChart3,
  CreditCard,
  FileText,
  Folder,
  Printer,
  Users,
} from "lucide-react";
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from "@/app/components/ui/dropdown/Dropdown";
import Card from "@/app/components/ui/card/Card";
import UsageProgress from "@/app/components/shared/features/UsageProgress";
import {
  reportCategories,
  reportPeriods,
  type ReportCategoryId,
  type ReportItem,
  type ReportPeriod,
} from "@/Data/Admin/reports";
import { cn } from "@/app/components/lib/cn";
import ReportExportButton from "./ReportExportButton";

const categoryIcons: Record<ReportCategoryId, React.ReactNode> = {
  user: <Users className="h-4 w-4" />,
  printer: <Printer className="h-4 w-4" />,
  group: <Folder className="h-4 w-4" />,
  account: <CreditCard className="h-4 w-4" />,
  summary: <BarChart3 className="h-4 w-4" />,
};

function ReportTabs({
  value,
  onChange,
}: {
  value: ReportCategoryId;
  onChange: (value: ReportCategoryId) => void;
}) {
  return (
    <div
      className="inline-flex flex-wrap items-center gap-3 rounded-3xl border p-2"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      {reportCategories.map((category) => {
        const active = category.id === value;

        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onChange(category.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-200",
              active
                ? "bg-brand-500 text-white shadow-sm"
                : "text-[var(--paragraph)] hover:bg-[var(--surface-2)]"
            )}
          >
            {categoryIcons[category.id]}
            <span>{category.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function ReportRow({ report }: { report: ReportItem }) {
  const [period, setPeriod] = useState<ReportPeriod>(report.defaultPeriod);

  return (
    <div className="flex flex-col gap-5 border-b border-[var(--border)] px-6 py-5 last:border-b-0 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
          style={{ background: "var(--surface-2)" }}
        >
          <FileText className="h-5 w-5 text-brand-500" />
        </div>

        <div className="min-w-0">
          <h3 className="text-xl font-semibold text-[var(--foreground)]">
            {report.title}
          </h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {report.description}
          </p>

          {typeof report.usagePercent === "number" ? (
            <UsageProgress value={report.usagePercent} className="mt-3" />
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:items-end">
        <Dropdown
          value={period}
          onValueChange={(value) => setPeriod(value as ReportPeriod)}
        >
          <DropdownTrigger className="h-12 min-w-[150px] rounded-xl px-4 text-sm">
            {period}
          </DropdownTrigger>

          <DropdownContent align="right" widthClassName="w-[180px]">
            {reportPeriods.map((item) => (
              <DropdownItem key={item} value={item}>
                {item}
              </DropdownItem>
            ))}
          </DropdownContent>
        </Dropdown>

        <div className="flex flex-wrap items-center gap-3">
          {report.supportedFormats.map((format) => (
            <ReportExportButton
              key={format}
              format={format}
              onClick={() => console.log(`Export ${report.title} as ${format}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
const ReportsPanel = () => {
  const [activeCategory, setActiveCategory] =
    useState<ReportCategoryId>("printer");

  const currentCategory = useMemo(
    () => reportCategories.find((item) => item.id === activeCategory)!,
    [activeCategory]
  );

  return (
    <section className="space-y-6">
      <ReportTabs value={activeCategory} onChange={setActiveCategory} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <Card className="h-fit rounded-[28px]">
          <div className="space-y-6 ">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ background: "var(--surface-2)" }}
            >
              <BarChart3 className="h-8 w-8 text-brand-500" />
            </div>

            <div>
              <h2 className="title-md">{currentCategory.panelTitle}</h2>
              <p className="paragraph mt-3">
                {currentCategory.panelDescription}
              </p>
            </div>

            <div
              className="border-t pt-5"
              style={{ borderColor: "var(--border)" }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-[0.18em]"
                style={{ color: "var(--muted)" }}
              >
                Export formats
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                {currentCategory.exportFormats.map((format) => (
                  <ReportExportButton
                    key={format}
                    format={format}
                    className="hover:scale-100"
                    onClick={() =>
                      console.log(
                        `Quick export for ${currentCategory.label}: ${format}`
                      )
                    }
                  />
                ))}
              </div>
            </div>

            <div
              className="border-t pt-5"
              style={{ borderColor: "var(--border)" }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-[0.18em]"
                style={{ color: "var(--muted)" }}
              >
                Report readiness
              </p>

              <UsageProgress
                value={currentCategory.overviewPercent}
                className="mt-4"
              />
            </div>
          </div>
        </Card>

        <Card className="rounded-[28px] p-0 overflow-hidden">
          <div className="divide-y divide-[var(--border)]">
            {currentCategory.reports.map((report) => (
              <ReportRow key={report.id} report={report} />
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
};

export default ReportsPanel;
