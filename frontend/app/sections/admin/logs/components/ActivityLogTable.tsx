"use client";

import Button from "@/components/ui/button/Button";
import Input from "@/components/ui/input/Input";
import Modal from "@/components/ui/modal/Modal";
import { apiGet } from "@/services/api";
import { Download, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type ActivityLog = {
  id: string;
  time: string;
  type: string;
  title: string;
  description: string;
  user: string;
  printer: string;
  pages: number | null;
  status: "Success" | "Failed" | "Warning" | "Info";
  documentName: string;
  deviceIp: string;
  queueName: string;
  serialNumber: string;
  location: string;
  resolutionNote: string;
  category: string;
  performedAt: string;
  success: boolean;
};

type LogsResponse = {
  total: number;
  count: number;
  filtersApplied: {
    search: string;
    category: string;
    success: string;
    startDate: string;
    endDate: string;
  };
  logs: ActivityLog[];
  auditLogs: ActivityLog[];
};

const statusTone: Record<ActivityLog["status"], string> = {
  Success: "bg-emerald-100 text-emerald-700",
  Failed: "bg-red-100 text-red-700",
  Warning: "bg-amber-100 text-amber-700",
  Info: "bg-slate-100 text-slate-700",
};

const typeOptions = ["all", "Print Job", "Device", "Security", "System"];
const statusOptions = ["all", "Success", "Failed", "Warning", "Info"];

function SummaryCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number;
  helper: string;
}) {
  return (
    <div
      className="rounded-2xl border p-5"
      style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold text-[var(--title)]">{value}</p>
      <p className="mt-2 text-sm text-[var(--muted)]">{helper}</p>
    </div>
  );
}

function downloadCsv(rows: ActivityLog[]) {
  const csv = [
    [
      "Time",
      "Type",
      "Title",
      "Description",
      "User",
      "Printer",
      "Pages",
      "Status",
      "Queue",
      "Device IP",
      "Serial Number",
      "Location",
    ].join(","),
    ...rows.map((log) =>
      [
        log.time,
        log.type,
        log.title,
        log.description,
        log.user,
        log.printer,
        log.pages ?? "",
        log.status,
        log.queueName,
        log.deviceIp,
        log.serialNumber,
        log.location,
      ]
        .map((value) => `"${String(value || "").replaceAll('"', '""')}"`)
        .join(","),
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "alpha-queue-logs.csv";
  link.click();
  URL.revokeObjectURL(url);
}

const ActivityLogTable = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

  const loadLogs = async (showSpinner = false) => {
    if (showSpinner) {
      setLoading(true);
    }

    try {
      const data = await apiGet<LogsResponse>("/admin/logs", "admin");
      setLogs(data.logs || []);
      setError("");
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Unable to load logs.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs(true);
  }, []);

  const filteredLogs = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return logs.filter((log) => {
      const haystack = [
        log.time,
        log.type,
        log.title,
        log.description,
        log.user,
        log.printer,
        log.documentName,
        log.queueName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (searchTerm && !haystack.includes(searchTerm)) {
        return false;
      }

      if (typeFilter !== "all" && log.type !== typeFilter) {
        return false;
      }

      if (statusFilter !== "all" && log.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [logs, search, statusFilter, typeFilter]);

  const successCount = logs.filter((log) => log.status === "Success").length;
  const failureCount = logs.filter((log) => log.status === "Failed").length;
  const warningCount = logs.filter((log) => log.status === "Warning").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Entries" value={logs.length} helper="Logs returned from MongoDB" />
        <SummaryCard label="Success" value={successCount} helper="Completed backend actions" />
        <SummaryCard label="Failures" value={failureCount} helper="Requests or jobs that failed" />
        <SummaryCard label="Warnings" value={warningCount} helper="Issues worth checking soon" />
      </div>

      <div
        className="rounded-2xl border p-5"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex-1">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by user, printer, document, queue, or action"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <label className="flex min-w-[180px] flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Type
              </span>
              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                className="h-12 rounded-md border px-4 text-sm outline-none"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface)",
                  color: "var(--title)",
                }}
              >
                {typeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === "all" ? "All Types" : option}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex min-w-[180px] flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Status
              </span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-12 rounded-md border px-4 text-sm outline-none"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface)",
                  color: "var(--title)",
                }}
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === "all" ? "All Statuses" : option}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button
            variant="secondary"
            iconLeft={<RefreshCw className="h-4 w-4" />}
            onClick={() => loadLogs(false)}
          >
            Refresh Logs
          </Button>

          <Button
            variant="outline"
            iconLeft={<Download className="h-4 w-4" />}
            disabled={filteredLogs.length === 0}
            onClick={() => downloadCsv(filteredLogs)}
          >
            Export Visible CSV
          </Button>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div
          className="mt-5 overflow-hidden rounded-2xl border"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--border)]">
              <thead style={{ background: "var(--surface-2)" }}>
                <tr className="text-left text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Printer</th>
                  <th className="px-4 py-3">Pages</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-sm text-[var(--muted)]"
                    >
                      Loading logs...
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-sm text-[var(--muted)]"
                    >
                      No logs matched the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="cursor-pointer align-top hover:bg-brand-50/20"
                      onClick={() => setSelectedLog(log)}
                    >
                      <td className="px-4 py-4 text-sm text-[var(--title)]">{log.time}</td>
                      <td className="px-4 py-4 text-sm text-[var(--title)]">{log.type}</td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-[var(--title)]">{log.title}</p>
                        <p className="mt-1 max-w-xl text-sm text-[var(--muted)]">
                          {log.description}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-sm text-[var(--title)]">{log.user}</td>
                      <td className="px-4 py-4 text-sm text-[var(--title)]">{log.printer}</td>
                      <td className="px-4 py-4 text-sm text-[var(--title)]">
                        {log.pages ?? "—"}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusTone[log.status]}`}
                        >
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal open={Boolean(selectedLog)} onClose={() => setSelectedLog(null)}>
        <div className="space-y-4 pr-8">
          <div>
            <h3 className="title-md">{selectedLog?.title}</h3>
            <p className="paragraph mt-1">{selectedLog?.time}</p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {[
              ["Type", selectedLog?.type || "—"],
              ["Status", selectedLog?.status || "—"],
              ["User", selectedLog?.user || "—"],
              ["Printer", selectedLog?.printer || "—"],
              ["Pages", selectedLog?.pages ?? "—"],
              ["Document", selectedLog?.documentName || "—"],
              ["Queue", selectedLog?.queueName || "—"],
              ["Device IP", selectedLog?.deviceIp || "—"],
              ["Serial Number", selectedLog?.serialNumber || "—"],
              ["Location", selectedLog?.location || "—"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border p-4"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface-2)",
                }}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  {label}
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--title)]">
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div
            className="rounded-2xl border p-4"
            style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
          >
            <p className="text-sm font-semibold text-[var(--title)]">Description</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {selectedLog?.description || "No description."}
            </p>
            {selectedLog?.resolutionNote ? (
              <>
                <p className="mt-4 text-sm font-semibold text-[var(--title)]">
                  Resolution Note
                </p>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {selectedLog.resolutionNote}
                </p>
              </>
            ) : null}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ActivityLogTable;
