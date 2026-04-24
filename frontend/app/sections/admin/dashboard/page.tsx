"use client";

import { ChevronDown, RefreshCw } from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

import GeneralDonutChart, {
  DonutChartItem,
} from "@/components/shared/charts/GeneralDonutChart";
import GeneralLineChart from "@/components/shared/charts/GeneralLineChart";
import {
  Table,
  TableBody,
  TableCell,
  TableEmptyState,
  TableGrid,
  TableHeader,
  TableHeaderCell,
  TableMain,
  TableTitleBlock,
  TableTop,
} from "@/components/shared/table/Table";
import TableExportDropdown from "@/components/shared/table/TableExportDropdown";
import Button from "@/components/ui/button/Button";
import { exportTableData, TableExportFormat } from "@/lib/export";
import { apiGet } from "@/services/api";

type SortDir = "asc" | "desc";

type ReportsSummary = {
  period: string;
  generatedAt: string;
  overviewCards: Array<{
    id: string;
    title: string;
    value: string;
    helperText: string;
  }>;
  systemSummary: {
    totalUsers: number;
    activePrinters: number;
    activeQueues: number;
    unreadNotifications: number;
    totalJobs: number;
    printedPages: number;
    pendingRelease: number;
    totalPrintCost: number;
  };
  jobStatusBreakdown: Array<{
    status: string;
    count: number;
    pages: number;
    cost: number;
  }>;
  topUsers: Array<{
    userId: string;
    username: string;
    jobs: number;
    pages: number;
    cost: number;
  }>;
  topPrinters: Array<{
    printerId: string;
    printerName: string;
    jobs: number;
    pages: number;
    cost: number;
  }>;
  groupSummary: Array<{
    id: string;
    name: string;
    members: number;
    jobs: number;
    pages: number;
    cost: number;
  }>;
};

type AdminPrinter = {
  id: string;
  name: string;
  model: string;
  location: string;
  status: string;
  ipAddress: string;
  queueName: string;
  tonerLevel: number;
  paperLevel: number;
  lastUsed: string;
};

type AdminPrintersResponse = {
  printers: AdminPrinter[];
};

type JobStatusSortKey = "status" | "count" | "pages" | "cost";

const periods = ["Last 7 days", "Last 30 days", "Last 90 days", "This year"];
const columnsClassName =
  "[grid-template-columns:minmax(180px,1.2fr)_minmax(110px,0.7fr)_minmax(110px,0.7fr)_minmax(150px,0.8fr)]";

const chartPalette = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

const statusColorMap: Record<string, string> = {
  Printed: "#10b981",
  "Pending Release": "#f59e0b",
  Failed: "#ef4444",
  Cancelled: "#64748b",
  Queued: "#3b82f6",
};

function PeriodDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const activeIndex = Math.max(periods.indexOf(value), 0);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const selectPeriod = (nextPeriod: string) => {
    onChange(nextPeriod);
    setOpen(false);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen((current) => !current);
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      selectPeriod(periods[Math.min(activeIndex + 1, periods.length - 1)]);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      selectPeriod(periods[Math.max(activeIndex - 1, 0)]);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleKeyDown}
        className="inline-flex h-11 min-w-[150px] cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 text-sm font-semibold transition-all duration-200"
        style={{
          borderColor: "var(--border)",
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--surface) 94%, transparent), color-mix(in srgb, var(--surface-2) 96%, transparent))",
          color: "var(--title)",
          boxShadow:
            "0 10px 24px rgba(var(--shadow-color), 0.08), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span>{value}</span>
        <ChevronDown
          className={`h-4 w-4 text-[var(--muted)] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open ? (
        <div
          className="absolute right-0 top-[calc(100%+0.45rem)] z-50 w-44 overflow-hidden rounded-xl border p-1.5 shadow-2xl backdrop-blur-xl"
          style={{
            borderColor: "var(--border)",
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--surface) 97%, transparent), color-mix(in srgb, var(--surface-2) 97%, transparent))",
            boxShadow:
              "0 18px 42px rgba(var(--shadow-color), 0.18), inset 0 1px 0 rgba(255,255,255,0.07)",
          }}
          role="listbox"
        >
          {periods.map((option) => {
            const selected = option === value;

            return (
              <button
                key={option}
                type="button"
                onClick={() => selectPeriod(option)}
                className="flex w-full cursor-pointer items-center rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors duration-150"
                style={{
                  color: selected ? "var(--color-brand-500)" : "var(--paragraph)",
                  background: selected ? "rgba(var(--brand-rgb), 0.12)" : "transparent",
                }}
                role="option"
                aria-selected={selected}
              >
                {option}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  helper,
  index,
}: {
  title: string;
  value: string;
  helper: string;
  index: number;
}) {
  const bars = [
    [34, 58, 74, 52, 82, 68],
    [42, 50, 46, 64, 76, 58],
    [62, 44, 70, 55, 82, 48],
    [28, 46, 36, 66, 54, 78],
  ][index % 4];
  const trendLabels = ["+2.4%", "stable", "+1.8%", "tracked"];
  const positiveTrend = trendLabels[index % trendLabels.length] !== "stable";

  return (
    <div
      className="group relative min-h-[132px] overflow-hidden rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5"
      style={{
        borderColor: "var(--border)",
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--surface) 96%, transparent), color-mix(in srgb, var(--surface-2) 96%, transparent))",
        boxShadow:
          "0 12px 28px rgba(var(--shadow-color), 0.1), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex h-full flex-col gap-3">
        <p className="truncate text-xs font-semibold text-[var(--muted)]">
          {title}
        </p>

        <div
          className="flex min-h-[74px] items-center justify-between gap-4 rounded-[0.85rem] px-4 py-3"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--frame-background) 94%, var(--background)), color-mix(in srgb, var(--background) 92%, var(--surface-2)))",
            boxShadow:
              "inset 0 1px 0 var(--panel-highlight), inset 0 -10px 22px rgba(var(--shadow-color), 0.16)",
          }}
        >
          <p className="min-w-0 truncate text-[2rem] font-semibold leading-none tracking-[-0.03em] text-[var(--title)]">
            {value}
          </p>

          <div className="flex h-12 shrink-0 items-end gap-1.5" aria-hidden="true">
            {bars.map((height, barIndex) => (
              <span
                key={`${title}-${barIndex}`}
                className="w-2 rounded-full transition-all duration-300 group-hover:opacity-100"
                style={{
                  height: `${height}%`,
                  background:
                    barIndex % 2 === 0
                      ? "var(--color-brand-500)"
                      : "color-mix(in srgb, var(--color-brand-500) 58%, var(--color-support-300))",
                  opacity: 0.78,
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="line-clamp-1 text-xs text-[var(--muted)]">{helper}</p>
          <span
            className="shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold"
            style={{
              color: positiveTrend
                ? "var(--color-brand-500)"
                : "var(--muted)",
              background: positiveTrend
                ? "rgba(var(--brand-rgb), 0.1)"
                : "color-mix(in srgb, var(--surface-3) 54%, transparent)",
            }}
          >
            {trendLabels[index % trendLabels.length]}
          </span>
        </div>
      </div>
    </div>
  );
}

const formatMoney = (value: number) => `${value.toFixed(2)} SAR`;

const compareValues = (a: string | number, b: string | number, direction: SortDir) => {
  if (typeof a === "number" && typeof b === "number") {
    return direction === "asc" ? a - b : b - a;
  }

  return direction === "asc"
    ? String(a).localeCompare(String(b))
    : String(b).localeCompare(String(a));
};

export default function Page() {
  const [period, setPeriod] = useState("Last 30 days");
  const [summary, setSummary] = useState<ReportsSummary | null>(null);
  const [printers, setPrinters] = useState<AdminPrinter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusSortKey, setStatusSortKey] = useState<JobStatusSortKey>("count");
  const [statusSortDir, setStatusSortDir] = useState<SortDir>("desc");

  const loadDashboard = async (showSpinner = false) => {
    if (showSpinner) {
      setLoading(true);
    }

    try {
      const query = encodeURIComponent(period);
      const [reportsData, printersData] = await Promise.all([
        apiGet<ReportsSummary>(`/admin/reports/summary?period=${query}`, "admin"),
        apiGet<AdminPrintersResponse>("/admin/printers", "admin"),
      ]);

      setSummary(reportsData);
      setPrinters(Array.isArray(printersData?.printers) ? printersData.printers : []);
      setError("");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load the dashboard.",
      );
      setSummary(null);
      setPrinters([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard(true);
  }, [period]);

  const handleStatusSort = (key: JobStatusSortKey) => {
    if (statusSortKey === key) {
      setStatusSortDir((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setStatusSortKey(key);
    setStatusSortDir(key === "status" ? "asc" : "desc");
  };

  const jobStatusRows = useMemo(() => {
    const rows = summary?.jobStatusBreakdown || [];

    return [...rows].sort((a, b) => {
      if (statusSortKey === "status") {
        return compareValues(a.status, b.status, statusSortDir);
      }

      return compareValues(a[statusSortKey], b[statusSortKey], statusSortDir);
    });
  }, [statusSortDir, statusSortKey, summary]);

  const summaryChartData = useMemo<DonutChartItem[]>(
    () =>
      (summary?.jobStatusBreakdown || []).map((item, index) => ({
        name: item.status,
        value: item.count,
        color: statusColorMap[item.status] || chartPalette[index % chartPalette.length],
      })),
    [summary],
  );

  const printingActivityData = useMemo(
    () =>
      (summary?.topPrinters || []).map((printer) => ({
        printer: printer.printerName,
        jobs: printer.jobs,
        pages: printer.pages,
      })),
    [summary],
  );

  const exportJobStatus = (format: TableExportFormat) => {
    exportTableData({
      title: `Dashboard Job Status Breakdown (${period})`,
      filename: "alpha-queue-dashboard-job-status",
      format,
      columns: [
        { label: "Status", value: (row: ReportsSummary["jobStatusBreakdown"][number]) => row.status },
        { label: "Jobs", value: (row) => row.count },
        { label: "Pages", value: (row) => row.pages },
        { label: "Cost", value: (row) => formatMoney(row.cost) },
      ],
      rows: jobStatusRows,
    });
  };

  return (
    <div className="flex flex-col gap-10">
      <section className="relative space-y-4 pt-12">
        <div className="absolute right-0 top-0">
          <div
            className="rounded-bl-2xl border border-r-0 border-t-0 px-4 py-2.5"
            style={{
              borderColor: "var(--border)",
              background:
                "linear-gradient(180deg, color-mix(in srgb, var(--frame-background) 92%, var(--surface)), color-mix(in srgb, var(--background) 88%, var(--surface-2)))",
              boxShadow:
                "0 10px 24px rgba(var(--shadow-color), 0.1), inset 0 1px 0 var(--panel-highlight)",
            }}
          >
            <h1 className="motion-safe:animate-[pulse_1.05s_ease-out_1] text-sm font-semibold tracking-[0.02em] text-[var(--title)]">
              Dashboard
            </h1>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 sm:items-end">
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <Button
              variant="secondary"
              iconLeft={<RefreshCw className="h-4 w-4" />}
              onClick={() => loadDashboard(false)}
            >
              Refresh
            </Button>

            <PeriodDropdown value={period} onChange={setPeriod} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {(summary?.overviewCards || []).map((card, index) => (
            <SummaryCard
              key={card.id}
              title={card.title}
              value={card.value}
              helper={card.helperText}
              index={index}
            />
          ))}
        </div>
      </section>

      {error ? (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="space-y-3">
          <GeneralDonutChart
            title="Summary Chart"
            data={summaryChartData}
            totalLabel="jobs"
            className="h-full"
          />
          {summaryChartData.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">
              No job-status data is available for the selected period.
            </p>
          ) : null}
        </div>

        <div className="space-y-3">
          <GeneralLineChart
            title="Printing Activity"
            data={printingActivityData}
            metricsConfig={{
              jobs: { label: "Jobs", color: "#3b82f6" },
              pages: { label: "Pages", color: "#10b981" },
            }}
            xDataKey="printer"
            showFilter={false}
            showLegend
            showMoreButton={false}
            className="h-full"
          />
          {printingActivityData.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">
              No printer activity is available for the selected period.
            </p>
          ) : null}
        </div>
      </section>

      <Table>
        <TableTop>
          <TableTitleBlock
            title="Job Status Breakdown"
            description="Shared dashboard table wired to the live reports summary."
          />

          <TableExportDropdown
            disabled={jobStatusRows.length === 0}
            onExport={exportJobStatus}
          />
        </TableTop>

        <TableMain>
          <TableGrid minWidthClassName="min-w-[760px]">
            <TableHeader columnsClassName={columnsClassName}>
              <TableHeaderCell
                label="Status"
                sortable
                active={statusSortKey === "status"}
                direction={statusSortDir}
                onClick={() => handleStatusSort("status")}
              />
              <TableHeaderCell
                label="Jobs"
                sortable
                active={statusSortKey === "count"}
                direction={statusSortDir}
                onClick={() => handleStatusSort("count")}
              />
              <TableHeaderCell
                label="Pages"
                sortable
                active={statusSortKey === "pages"}
                direction={statusSortDir}
                onClick={() => handleStatusSort("pages")}
              />
              <TableHeaderCell
                label="Cost"
                sortable
                active={statusSortKey === "cost"}
                direction={statusSortDir}
                onClick={() => handleStatusSort("cost")}
              />
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableEmptyState text="Loading dashboard breakdown..." />
              ) : jobStatusRows.length === 0 ? (
                <TableEmptyState text="No job status data was returned." />
              ) : (
                jobStatusRows.map((item) => (
                  <div
                    key={item.status}
                    className={`grid w-full border-b border-[var(--border)] px-6 py-5 last:border-b-0 ${columnsClassName}`}
                  >
                    <TableCell className="font-semibold text-[var(--title)]">
                      {item.status}
                    </TableCell>
                    <TableCell className="text-[var(--title)]">{item.count}</TableCell>
                    <TableCell className="text-[var(--title)]">{item.pages}</TableCell>
                    <TableCell className="text-[var(--title)]">
                      {formatMoney(item.cost)}
                    </TableCell>
                  </div>
                ))
              )}
            </TableBody>
          </TableGrid>
        </TableMain>
      </Table>

      {loading ? (
        <div className="rounded-2xl border px-6 py-10 text-center text-sm text-[var(--muted)]">
          Loading dashboard details...
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-2">
              <div
                className="rounded-2xl border p-5"
                style={{ borderColor: "var(--border)", background: "var(--surface)" }}
              >
                <h2 className="title-md">Top Users</h2>
                <div className="mt-4 space-y-3">
                  {(summary?.topUsers || []).map((user) => (
                    <div
                      key={user.userId || user.username}
                      className="rounded-xl border p-4"
                      style={{
                        borderColor: "var(--border)",
                        background: "var(--surface-2)",
                      }}
                    >
                      <p className="font-semibold text-[var(--title)]">{user.username}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {user.jobs} jobs · {user.pages} pages · {formatMoney(user.cost)}
                      </p>
                    </div>
                  ))}
                  {(summary?.topUsers || []).length === 0 ? (
                    <p className="text-sm text-[var(--muted)]">
                      No user activity was returned for this period.
                    </p>
                  ) : null}
                </div>
              </div>

              <div
                className="rounded-2xl border p-5"
                style={{ borderColor: "var(--border)", background: "var(--surface)" }}
              >
                <h2 className="title-md">Top Printers</h2>
                <div className="mt-4 space-y-3">
                  {(summary?.topPrinters || []).map((printer) => (
                    <div
                      key={printer.printerId || printer.printerName}
                      className="rounded-xl border p-4"
                      style={{
                        borderColor: "var(--border)",
                        background: "var(--surface-2)",
                      }}
                    >
                      <p className="font-semibold text-[var(--title)]">
                        {printer.printerName}
                      </p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {printer.jobs} jobs · {printer.pages} pages · {formatMoney(printer.cost)}
                      </p>
                    </div>
                  ))}
                  {(summary?.topPrinters || []).length === 0 ? (
                    <p className="text-sm text-[var(--muted)]">
                      No printer activity was returned for this period.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div
              className="rounded-2xl border p-5"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}
            >
              <h2 className="title-md">Live Printer Snapshot</h2>
              <div className="mt-4 space-y-3">
                {printers.map((printer) => (
                  <div
                    key={printer.id}
                    className="rounded-xl border p-4"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--surface-2)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[var(--title)]">{printer.name}</p>
                        <p className="mt-1 text-sm text-[var(--muted)]">
                          {printer.model} · {printer.location || printer.ipAddress}
                        </p>
                      </div>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          printer.status === "Online"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {printer.status}
                      </span>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-[var(--muted)]">
                      <span>Queue: {printer.queueName || "Unassigned"}</span>
                      <span>Toner: {printer.tonerLevel}%</span>
                      <span>Paper: {printer.paperLevel}%</span>
                      <span>Last Used: {printer.lastUsed}</span>
                    </div>
                  </div>
                ))}
                {printers.length === 0 ? (
                  <p className="text-sm text-[var(--muted)]">
                    No printers were returned by the backend.
                  </p>
                ) : null}
              </div>
            </div>

            <div
              className="rounded-2xl border p-5"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}
            >
              <h2 className="title-md">Group Activity</h2>
              <div className="mt-4 space-y-3">
                {(summary?.groupSummary || []).map((group) => (
                  <div
                    key={group.id}
                    className="rounded-xl border p-4"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--surface-2)",
                    }}
                  >
                    <p className="font-semibold text-[var(--title)]">{group.name}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {group.members} members · {group.jobs} jobs · {group.pages} pages ·{" "}
                      {formatMoney(group.cost)}
                    </p>
                  </div>
                ))}
                {(summary?.groupSummary || []).length === 0 ? (
                  <p className="text-sm text-[var(--muted)]">
                    No group activity was returned for this period.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
