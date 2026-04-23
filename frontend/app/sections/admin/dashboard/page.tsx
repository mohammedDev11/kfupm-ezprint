"use client";

import { RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import GeneralDonutChart, {
  DonutChartItem,
} from "@/components/shared/charts/GeneralDonutChart";
import GeneralLineChart from "@/components/shared/charts/GeneralLineChart";
import PageIntro from "@/components/shared/page/Text/PageIntro";
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

function SummaryCard({
  title,
  value,
  helper,
}: {
  title: string;
  value: string;
  helper: string;
}) {
  return (
    <div
      className="rounded-2xl border p-5"
      style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
        {title}
      </p>
      <p className="mt-3 text-2xl font-semibold text-[var(--title)]">{value}</p>
      <p className="mt-2 text-sm text-[var(--muted)]">{helper}</p>
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
      <PageIntro
        title="Dashboard"
        description="Live admin overview powered by real backend reporting data."
      />

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex min-w-[220px] flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            Reporting Period
          </span>
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            className="h-12 rounded-md border px-4 text-sm outline-none"
            style={{
              borderColor: "var(--border)",
              background: "var(--surface)",
              color: "var(--title)",
            }}
          >
            {periods.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <Button
          variant="secondary"
          iconLeft={<RefreshCw className="h-4 w-4" />}
          onClick={() => loadDashboard(false)}
        >
          Refresh
        </Button>
      </div>

      {error ? (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {(summary?.overviewCards || []).map((card) => (
          <SummaryCard
            key={card.id}
            title={card.title}
            value={card.value}
            helper={card.helperText}
          />
        ))}
      </div>

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
