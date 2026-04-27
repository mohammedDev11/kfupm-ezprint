"use client";

import KpiMetricCard from "@/components/shared/cards/KpiMetricCard";
import FullscreenTablePortal from "@/components/shared/table/FullscreenTablePortal";
import SelectedRowsExportModal from "@/components/shared/table/SelectedRowsExportModal";
import {
  Table,
  TableBody,
  TableCell,
  TableCheckbox,
  TableControls,
  TableEmptyState,
  TableGrid,
  TableHeader,
  TableHeaderCell,
  TableMain,
  TableSearch,
  TableTitleBlock,
  TableTop,
} from "@/components/shared/table/Table";
import TableExportDropdown from "@/components/shared/table/TableExportDropdown";
import StatusBadge from "@/components/ui/badge/StatusBadge";
import Button from "@/components/ui/button/Button";
import RefreshButton from "@/components/ui/button/RefreshButton";
import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/ui/dropdown/Dropdown";
import Modal from "@/components/ui/modal/Modal";
import { exportTableData, TableExportFormat } from "@/lib/export";
import { apiGet } from "@/services/api";
import {
  AlertTriangle,
  CheckCircle2,
  Maximize2,
  Minimize2,
  ScrollText,
  SlidersHorizontal,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

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

type SortDir = "asc" | "desc";
type LogSortKey =
  | "time"
  | "type"
  | "title"
  | "user"
  | "printer"
  | "pages"
  | "status";

const columnsClassName =
  "[grid-template-columns:72px_minmax(170px,0.85fr)_minmax(140px,0.7fr)_minmax(280px,1.4fr)_minmax(180px,0.9fr)_minmax(190px,0.9fr)_minmax(100px,0.5fr)_minmax(140px,0.7fr)]";

const typeOptions = ["all", "Print Job", "System", "User", "Printer"];
const statusOptions = ["all", "Success", "Failed", "Warning"];
const getExportTimestamp = () =>
  new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");

const logTableColumns: Array<{
  key: LogSortKey;
  label: string;
}> = [
  { key: "time", label: "Time" },
  { key: "type", label: "Type" },
  { key: "title", label: "Event" },
  { key: "user", label: "User" },
  { key: "printer", label: "Printer" },
  { key: "pages", label: "Pages" },
  { key: "status", label: "Status" },
];

const getStatusTone = (status: ActivityLog["status"]) => {
  if (status === "Success") return "success";
  if (status === "Failed") return "danger";
  if (status === "Warning") return "warning";
  return "inactive";
};

const parseSortableDate = (value: string) => {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? value : timestamp;
};

const compareValues = (
  a: string | number,
  b: string | number,
  direction: SortDir,
) => {
  if (typeof a === "number" && typeof b === "number") {
    return direction === "asc" ? a - b : b - a;
  }

  return direction === "asc"
    ? String(a).localeCompare(String(b))
    : String(b).localeCompare(String(a));
};

const ActivityLogTable = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState<LogSortKey>("time");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportMethod, setExportMethod] = useState<TableExportFormat>("PDF");

  const loadLogs = useCallback(async (showSpinner = false) => {
    if (showSpinner) {
      setLoading(true);
    }

    try {
      const data = await apiGet<LogsResponse>("/admin/logs", "admin");
      const nextLogs = data.logs || [];
      setLogs(nextLogs);
      setSelectedIds((current) =>
        current.filter((id) => nextLogs.some((log) => log.id === id)),
      );
      setError("");
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Unable to load logs.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      void loadLogs(false);
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, [loadLogs]);

  const handleSort = (key: LogSortKey) => {
    if (sortKey === key) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDir(key === "time" || key === "pages" ? "desc" : "asc");
  };

  const filteredLogs = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return [...logs]
      .filter((log) => {
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

        if (typeFilter !== "all") {
          const isPrinterLog =
            typeFilter === "Printer" &&
            ["Printer", "Device"].includes(log.type);
          const isUserLog =
            typeFilter === "User" && ["User", "Security"].includes(log.type);

          if (log.type !== typeFilter && !isPrinterLog && !isUserLog) {
            return false;
          }
        }

        if (statusFilter !== "all" && log.status !== statusFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const getSortValue = (log: ActivityLog) => {
          switch (sortKey) {
            case "time":
              return parseSortableDate(log.time);
            case "type":
              return log.type;
            case "title":
              return log.title;
            case "user":
              return log.user;
            case "printer":
              return log.printer;
            case "pages":
              return log.pages ?? 0;
            case "status":
              return log.status;
            default:
              return log.time;
          }
        };

        return compareValues(getSortValue(a), getSortValue(b), sortDir);
      });
  }, [logs, search, sortDir, sortKey, statusFilter, typeFilter]);

  const successCount = logs.filter((log) => log.status === "Success").length;
  const failureCount = logs.filter((log) => log.status === "Failed").length;
  const warningCount = logs.filter((log) => log.status === "Warning").length;
  const visibleIds = filteredLogs.map((log) => log.id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
  const activeFilterCount = [typeFilter !== "all", statusFilter !== "all"].filter(
    Boolean,
  ).length;

  const kpiCards = [
    {
      title: "Entries",
      value: logs.length.toLocaleString(),
      helper: "Logs returned from MongoDB",
      icon: <ScrollText className="h-4 w-4" />,
    },
    {
      title: "Success",
      value: successCount.toLocaleString(),
      helper: "Completed backend actions",
      icon: <CheckCircle2 className="h-4 w-4" />,
    },
    {
      title: "Failures",
      value: failureCount.toLocaleString(),
      helper: "Requests or jobs that failed",
      icon: <XCircle className="h-4 w-4" />,
    },
    {
      title: "Warnings",
      value: warningCount.toLocaleString(),
      helper: "Issues worth checking soon",
      icon: <AlertTriangle className="h-4 w-4" />,
    },
  ];

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds((current) =>
        current.filter((id) => !visibleIds.includes(id)),
      );
      return;
    }

    setSelectedIds((current) => Array.from(new Set([...current, ...visibleIds])));
  };

  const toggleRowSelection = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const selectedLogs = useMemo(
    () => logs.filter((log) => selectedIds.includes(log.id)),
    [logs, selectedIds],
  );

  const exportLogs = (format: TableExportFormat) => {
    if (selectedLogs.length === 0) return;

    exportTableData({
      title: "System Logs",
      filename: `logs-export-${getExportTimestamp()}`,
      format,
      columns: [
        { label: "Time", value: (row: ActivityLog) => row.time },
        { label: "Type", value: (row) => row.type },
        { label: "Event", value: (row) => row.title },
        { label: "User", value: (row) => row.user || "" },
        { label: "Printer", value: (row) => row.printer || "" },
        { label: "Pages", value: (row) => row.pages ?? "" },
        { label: "Status", value: (row) => row.status },
      ],
      rows: selectedLogs,
    });
  };

  const handleExportChange = (format: TableExportFormat) => {
    setExportMethod(format);
    setIsExportModalOpen(true);
  };

  const handleExportConfirmed = () => {
    exportLogs(exportMethod);
    setIsExportModalOpen(false);
  };

  const removeSelectedLogFromExport = (id: string) => {
    setSelectedIds((current) => current.filter((item) => item !== id));
  };

  const renderLogsTable = (expanded = false) => (
    <Table
      className={`flex min-h-[520px] flex-col ${
        expanded ? "h-dvh !rounded-none" : "max-h-[calc(100vh-20rem)]"
      }`}
    >
      <TableTop
        className={`shrink-0 ${expanded ? "bg-[var(--surface)]" : ""}`}
      >
        <TableTitleBlock title="System Logs" />

        <TableControls>
          <TableSearch
            id={expanded ? "search-logs-expanded" : "search-logs"}
            label="Search logs"
            value={search}
            onChange={setSearch}
          />

          <RefreshButton className="h-14" onClick={() => loadLogs(false)} />

          <Dropdown>
            <DropdownTrigger className="h-14 min-w-[150px] px-6 text-base">
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filter</span>
                {activeFilterCount > 0 ? (
                  <span
                    className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-xs font-semibold"
                    style={{
                      background: "rgba(var(--brand-rgb), 0.12)",
                      color: "var(--color-brand-600)",
                    }}
                  >
                    {activeFilterCount}
                  </span>
                ) : null}
              </span>
            </DropdownTrigger>

            <DropdownContent align="right" widthClassName="w-[360px]">
              <div className="space-y-4 p-2">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                    Type
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    {typeOptions.map((option) => {
                      const isSelected = typeFilter === option;

                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setTypeFilter(option)}
                          className="rounded-md border px-3 py-2 text-left text-sm font-semibold transition"
                          style={{
                            background: isSelected
                              ? "rgba(var(--brand-rgb), 0.1)"
                              : "var(--surface-2)",
                            borderColor: isSelected
                              ? "color-mix(in srgb, var(--color-brand-500) 36%, var(--border))"
                              : "var(--border)",
                            color: isSelected
                              ? "var(--color-brand-600)"
                              : "var(--paragraph)",
                          }}
                        >
                          {option === "all" ? "All" : option}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                    Status
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    {statusOptions.map((option) => {
                      const isSelected = statusFilter === option;

                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setStatusFilter(option)}
                          className="rounded-md border px-3 py-2 text-left text-sm font-semibold transition"
                          style={{
                            background: isSelected
                              ? "rgba(var(--brand-rgb), 0.1)"
                              : "var(--surface-2)",
                            borderColor: isSelected
                              ? "color-mix(in srgb, var(--color-brand-500) 36%, var(--border))"
                              : "var(--border)",
                            color: isSelected
                              ? "var(--color-brand-600)"
                              : "var(--paragraph)",
                          }}
                        >
                          {option === "all" ? "All" : option}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {activeFilterCount > 0 ? (
                  <Button
                    variant="outline"
                    className="h-11 w-full text-sm"
                    onClick={() => {
                      setTypeFilter("all");
                      setStatusFilter("all");
                    }}
                  >
                    Reset Filters
                  </Button>
                ) : null}
              </div>
            </DropdownContent>
          </Dropdown>

          <TableExportDropdown
            disabled={selectedIds.length === 0}
            onExport={handleExportChange}
          />

          <button
            type="button"
            onClick={() => setIsTableExpanded(!expanded)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-transparent text-[var(--muted)] transition hover:text-[var(--color-brand-500)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(var(--brand-rgb),0.16)]"
            aria-label={expanded ? "Collapse logs table" : "Expand logs table"}
            title={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? (
              <Minimize2 className="h-5 w-5" />
            ) : (
              <Maximize2 className="h-5 w-5" />
            )}
          </button>
        </TableControls>
      </TableTop>

      {error ? (
        <div className="px-6 pb-2">
          <p
            className="rounded-xl border px-4 py-3 text-sm"
            style={{
              borderColor:
                "color-mix(in srgb, var(--color-brand-600) 24%, transparent)",
              background:
                "color-mix(in srgb, var(--color-brand-500) 10%, var(--surface))",
              color:
                "color-mix(in srgb, var(--color-brand-700) 82%, var(--title))",
            }}
          >
            {error}
          </p>
        </div>
      ) : null}

      <TableMain className="min-h-0 flex-1">
        <TableGrid minWidthClassName="flex h-full min-w-[1320px] flex-col">
          <TableHeader columnsClassName={columnsClassName}>
            <TableCell className="justify-center">
              <TableCheckbox checked={allVisibleSelected} onToggle={toggleSelectAll} />
            </TableCell>

            {logTableColumns.map((column) => (
              <TableHeaderCell
                key={column.key}
                label={column.label}
                sortable
                active={sortKey === column.key}
                direction={sortDir}
                onClick={() => handleSort(column.key)}
              />
            ))}
          </TableHeader>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <TableBody>
              {loading ? (
                <TableEmptyState text="Loading logs..." />
              ) : filteredLogs.length === 0 ? (
                <TableEmptyState text="No logs matched the current filters." />
              ) : (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className={`grid w-full cursor-pointer border-b border-[var(--border)] px-6 py-5 transition last:border-b-0 hover:bg-brand-50/30 ${columnsClassName}`}
                  >
                    <TableCell className="justify-center">
                      <TableCheckbox
                        checked={selectedIds.includes(log.id)}
                        onToggle={() => toggleRowSelection(log.id)}
                      />
                    </TableCell>

                    <TableCell className="text-sm font-medium text-[var(--title)]">
                      {log.time}
                    </TableCell>

                    <TableCell>
                      <span
                        className="inline-flex max-w-[120px] items-center rounded-full border px-3 py-1 text-xs font-semibold"
                        style={{
                          borderColor: "var(--border)",
                          background: "var(--surface-2)",
                          color: "var(--paragraph)",
                        }}
                        title={log.type}
                      >
                        <span className="truncate">{log.type}</span>
                      </span>
                    </TableCell>

                    <TableCell className="flex-col items-start">
                      <p className="font-semibold text-[var(--title)]">{log.title}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">
                        {log.description}
                      </p>
                    </TableCell>

                    <TableCell className="text-sm font-medium text-[var(--title)]">
                      {log.user || "—"}
                    </TableCell>

                    <TableCell className="text-sm font-medium text-[var(--title)]">
                      {log.printer || "—"}
                    </TableCell>

                    <TableCell className="text-sm font-medium text-[var(--title)]">
                      {log.pages ?? "—"}
                    </TableCell>

                    <TableCell>
                      <StatusBadge
                        label={log.status}
                        tone={getStatusTone(log.status)}
                        className="px-3 py-1.5 text-sm"
                      />
                    </TableCell>
                  </div>
                ))
              )}
            </TableBody>
          </div>
        </TableGrid>
      </TableMain>
    </Table>
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card, index) => (
          <KpiMetricCard
            key={card.title}
            title={card.title}
            value={card.value}
            helper={card.helper}
            icon={card.icon}
            index={index}
          />
        ))}
      </div>

      <FullscreenTablePortal open={isTableExpanded}>
        {renderLogsTable(true)}
      </FullscreenTablePortal>

      {renderLogsTable()}

      <Modal open={isExportModalOpen} onClose={() => setIsExportModalOpen(false)}>
        <SelectedRowsExportModal
          title="Export selected logs"
          description="Review the logs to export, remove any row if needed, then choose the export format."
          rows={selectedLogs}
          emptyText="Select rows to export."
          exportMethod={exportMethod}
          onExportMethodChange={setExportMethod}
          onRemove={removeSelectedLogFromExport}
          onCancel={() => setIsExportModalOpen(false)}
          onExport={handleExportConfirmed}
          getId={(log) => log.id}
          getTitle={(log) => log.title}
          getSubtitle={(log) =>
            `${log.time} - ${log.type} - ${log.user || "No user"} - ${log.status}`
          }
          idPrefix="logs"
        />
      </Modal>

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
