"use client";

import { Bell, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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
import Button from "@/components/ui/button/Button";
import Modal from "@/components/ui/modal/Modal";
import { exportTableData, TableExportFormat } from "@/lib/export";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/services/api";

type SortDir = "asc" | "desc";
type NotificationSortKey = "title" | "type" | "source" | "severity" | "status" | "createdAt";

type UserNotification = {
  id: string;
  title: string;
  message: string;
  type: string;
  source: string;
  severity: "info" | "success" | "warning" | "error" | "critical";
  status: "unread" | "read" | "resolved" | "archived";
  createdAt: string;
  createdAtLabel: string;
  canMarkAsRead?: boolean;
  canArchive?: boolean;
  canDelete?: boolean;
  relatedEntity?: {
    kind: string;
    id: string;
    label: string;
  };
};

type UserNotificationsResponse = {
  notifications: UserNotification[];
  summary: {
    total: number;
    unread: number;
    critical: number;
    actionRequired: number;
  };
};

const REFRESH_SECONDS = 30;
const columnsClassName =
  "[grid-template-columns:72px_minmax(260px,1.4fr)_minmax(150px,0.8fr)_minmax(160px,0.8fr)_minmax(130px,0.7fr)_minmax(130px,0.7fr)_minmax(170px,0.8fr)_minmax(210px,1fr)]";

const severityTone: Record<UserNotification["severity"], string> = {
  info: "bg-slate-100 text-slate-700",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  error: "bg-red-100 text-red-700",
  critical: "bg-red-200 text-red-800",
};

const statusTone: Record<UserNotification["status"], string> = {
  unread: "bg-amber-100 text-amber-700",
  read: "bg-slate-100 text-slate-700",
  resolved: "bg-emerald-100 text-emerald-700",
  archived: "bg-slate-200 text-slate-700",
};

const severityRank: Record<UserNotification["severity"], number> = {
  info: 0,
  success: 1,
  warning: 2,
  error: 3,
  critical: 4,
};

const statusRank: Record<UserNotification["status"], number> = {
  unread: 0,
  read: 1,
  resolved: 2,
  archived: 3,
};

const filterOptions = {
  type: ["all", "print-job", "balance", "redeem-card", "printer", "system"],
  severity: ["all", "info", "success", "warning", "error", "critical"],
  status: ["all", "unread", "read", "resolved", "archived"],
  source: [
    "all",
    "web-print",
    "jobs-pending-release",
    "recent-print-jobs",
    "transaction-history",
    "redeem-card",
    "printer-device",
    "system",
  ],
};

const formatOptionLabel = (value: string) =>
  value
    .replaceAll("-", " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());

const parseSortableDate = (value: string) => {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? value : timestamp;
};

const compareValues = (a: string | number, b: string | number, direction: SortDir) => {
  if (typeof a === "number" && typeof b === "number") {
    return direction === "asc" ? a - b : b - a;
  }

  return direction === "asc"
    ? String(a).localeCompare(String(b))
    : String(b).localeCompare(String(a));
};

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

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex min-w-[180px] flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 rounded-md border px-4 text-sm outline-none"
        style={{
          borderColor: "var(--border)",
          background: "var(--surface)",
          color: "var(--title)",
        }}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option === "all" ? `All ${label}` : formatOptionLabel(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function UserNotificationsTable() {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [summary, setSummary] = useState<UserNotificationsResponse["summary"]>({
    total: 0,
    unread: 0,
    critical: 0,
    actionRequired: 0,
  });
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<NotificationSortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [typeFilter, setTypeFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(REFRESH_SECONDS);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [detailsNotification, setDetailsNotification] =
    useState<UserNotification | null>(null);

  const loadNotifications = async (showSpinner = false) => {
    if (showSpinner) {
      setLoading(true);
    }

    try {
      const data = await apiGet<UserNotificationsResponse>(
        "/user/notifications",
        "user",
      );

      const nextNotifications = Array.isArray(data?.notifications)
        ? data.notifications
        : [];

      setNotifications(nextNotifications);
      setSummary(
        data.summary || {
          total: 0,
          unread: 0,
          critical: 0,
          actionRequired: 0,
        },
      );
      setSelectedIds((current) =>
        current.filter((id) => nextNotifications.some((item) => item.id === id)),
      );
      setError("");
    } catch (requestError) {
      setNotifications([]);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load notifications.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications(true);
  }, []);

  useEffect(() => {
    const refreshTimer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          void loadNotifications(false);
          return REFRESH_SECONDS;
        }

        return current - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(refreshTimer);
    };
  }, []);

  const handleSort = (key: NotificationSortKey) => {
    if (sortKey === key) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDir(key === "createdAt" ? "desc" : "asc");
  };

  const filteredNotifications = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return [...notifications]
      .filter((notification) => {
        const haystack = [
          notification.title,
          notification.message,
          notification.type,
          notification.source,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (searchTerm && !haystack.includes(searchTerm)) {
          return false;
        }

        if (typeFilter !== "all" && notification.type !== typeFilter) {
          return false;
        }

        if (severityFilter !== "all" && notification.severity !== severityFilter) {
          return false;
        }

        if (statusFilter !== "all" && notification.status !== statusFilter) {
          return false;
        }

        if (sourceFilter !== "all" && notification.source !== sourceFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortKey) {
          case "severity":
            return compareValues(severityRank[a.severity], severityRank[b.severity], sortDir);
          case "status":
            return compareValues(statusRank[a.status], statusRank[b.status], sortDir);
          case "createdAt":
            return compareValues(
              parseSortableDate(a.createdAt),
              parseSortableDate(b.createdAt),
              sortDir,
            );
          case "source":
            return compareValues(
              formatOptionLabel(a.source),
              formatOptionLabel(b.source),
              sortDir,
            );
          default:
            return compareValues(a[sortKey], b[sortKey], sortDir);
        }
      });
  }, [
    notifications,
    search,
    sortDir,
    sortKey,
    sourceFilter,
    severityFilter,
    statusFilter,
    typeFilter,
  ]);

  const visibleIds = filteredNotifications.map((notification) => notification.id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

  const toggleSelectedId = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedIds((current) =>
        current.filter((id) => !visibleIds.includes(id)),
      );
      return;
    }

    setSelectedIds((current) => Array.from(new Set([...current, ...visibleIds])));
  };

  const runAction = async (action: () => Promise<void>) => {
    setBusy(true);
    setError("");

    try {
      await action();
      await loadNotifications(false);
      setSecondsLeft(REFRESH_SECONDS);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Notification action failed.",
      );
    } finally {
      setBusy(false);
    }
  };

  const exportNotifications = (format: TableExportFormat) => {
    const rows =
      selectedIds.length > 0
        ? filteredNotifications.filter((notification) =>
            selectedIds.includes(notification.id),
          )
        : filteredNotifications;

    exportTableData({
      title: "User Notifications",
      filename: "alpha-queue-user-notifications",
      format,
      columns: [
        { label: "Title", value: (row: UserNotification) => row.title },
        { label: "Message", value: (row) => row.message },
        { label: "Type", value: (row) => formatOptionLabel(row.type) },
        { label: "Source", value: (row) => formatOptionLabel(row.source) },
        { label: "Severity", value: (row) => formatOptionLabel(row.severity) },
        { label: "Status", value: (row) => formatOptionLabel(row.status) },
        { label: "Created", value: (row) => row.createdAtLabel },
      ],
      rows,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total"
          value={summary.total}
          helper="Notifications currently visible to this user."
        />
        <SummaryCard
          label="Unread"
          value={summary.unread}
          helper="Items that still need attention."
        />
        <SummaryCard
          label="Critical"
          value={summary.critical}
          helper="High-severity alerts."
        />
        <SummaryCard
          label="Action Required"
          value={summary.actionRequired}
          helper="Items flagged by the backend for follow-up."
        />
      </div>

      <Table>
        <TableTop>
          <TableTitleBlock
            title="User Notifications"
            description={`Showing ${filteredNotifications.length} notification${filteredNotifications.length === 1 ? "" : "s"} from the live user feed.`}
          />

          <TableControls>
            <TableSearch
              id="search-user-notifications"
              label="Search notifications"
              value={search}
              onChange={setSearch}
            />

            <TableExportDropdown
              disabled={filteredNotifications.length === 0}
              onExport={exportNotifications}
            />
          </TableControls>
        </TableTop>

        <div className="px-6 pb-6">
          <div className="flex flex-wrap gap-3">
            <SelectField
              label="Type"
              value={typeFilter}
              options={filterOptions.type}
              onChange={setTypeFilter}
            />
            <SelectField
              label="Severity"
              value={severityFilter}
              options={filterOptions.severity}
              onChange={setSeverityFilter}
            />
            <SelectField
              label="Status"
              value={statusFilter}
              options={filterOptions.status}
              onChange={setStatusFilter}
            />
            <SelectField
              label="Source"
              value={sourceFilter}
              options={filterOptions.source}
              onChange={setSourceFilter}
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              iconLeft={<RefreshCw className="h-4 w-4" />}
              disabled={busy}
              onClick={() =>
                runAction(async () => {
                  await loadNotifications(false);
                })
              }
            >
              Refresh ({secondsLeft}s)
            </Button>

            <Button
              variant="outline"
              disabled={busy || selectedIds.length === 0}
              onClick={() =>
                runAction(async () => {
                  await apiPatch(
                    "/user/notifications/bulk/read",
                    { notificationIds: selectedIds },
                    "user",
                  );
                  setSelectedIds([]);
                })
              }
            >
              Mark Selected Read
            </Button>

            <Button
              variant="outline"
              disabled={busy || selectedIds.length === 0}
              onClick={() =>
                runAction(async () => {
                  await Promise.all(
                    selectedIds.map((id) =>
                      apiPatch(`/user/notifications/${id}/archive`, {}, "user"),
                    ),
                  );
                  setSelectedIds([]);
                })
              }
            >
              Archive Selected
            </Button>

            <Button
              variant="outline"
              iconLeft={<Trash2 className="h-4 w-4" />}
              disabled={busy || selectedIds.length === 0}
              onClick={() =>
                runAction(async () => {
                  await apiPost(
                    "/user/notifications/bulk/delete",
                    { notificationIds: selectedIds },
                    "user",
                  );
                  setSelectedIds([]);
                })
              }
            >
              Delete Selected
            </Button>
          </div>

          {error ? (
            <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
        </div>

        <TableMain>
          <TableGrid minWidthClassName="min-w-[1500px]">
            <TableHeader columnsClassName={columnsClassName}>
              <TableCell className="justify-center">
                <TableCheckbox
                  checked={allVisibleSelected}
                  onToggle={toggleSelectAllVisible}
                />
              </TableCell>
              <TableHeaderCell
                label="Notification"
                sortable
                active={sortKey === "title"}
                direction={sortDir}
                onClick={() => handleSort("title")}
              />
              <TableHeaderCell
                label="Type"
                sortable
                active={sortKey === "type"}
                direction={sortDir}
                onClick={() => handleSort("type")}
              />
              <TableHeaderCell
                label="Source"
                sortable
                active={sortKey === "source"}
                direction={sortDir}
                onClick={() => handleSort("source")}
              />
              <TableHeaderCell
                label="Severity"
                sortable
                active={sortKey === "severity"}
                direction={sortDir}
                onClick={() => handleSort("severity")}
              />
              <TableHeaderCell
                label="Status"
                sortable
                active={sortKey === "status"}
                direction={sortDir}
                onClick={() => handleSort("status")}
              />
              <TableHeaderCell
                label="Created"
                sortable
                active={sortKey === "createdAt"}
                direction={sortDir}
                onClick={() => handleSort("createdAt")}
              />
              <TableHeaderCell label="Actions" />
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableEmptyState text="Loading notifications..." />
              ) : filteredNotifications.length === 0 ? (
                <TableEmptyState text="No notifications matched the current filters." />
              ) : (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => setDetailsNotification(notification)}
                    className={`grid w-full cursor-pointer border-b border-[var(--border)] px-6 py-5 transition last:border-b-0 hover:bg-brand-50/30 ${columnsClassName}`}
                  >
                    <TableCell className="justify-center">
                      <TableCheckbox
                        checked={selectedIds.includes(notification.id)}
                        onToggle={() => toggleSelectedId(notification.id)}
                      />
                    </TableCell>

                    <TableCell className="flex-col items-start">
                      <p className="font-semibold text-[var(--title)]">
                        {notification.title}
                      </p>
                      <p className="mt-1 max-w-xl text-sm text-[var(--muted)]">
                        {notification.message}
                      </p>
                    </TableCell>

                    <TableCell className="text-[var(--title)]">
                      {formatOptionLabel(notification.type)}
                    </TableCell>

                    <TableCell className="text-[var(--title)]">
                      {formatOptionLabel(notification.source)}
                    </TableCell>

                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${severityTone[notification.severity]}`}
                      >
                        {formatOptionLabel(notification.severity)}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusTone[notification.status]}`}
                      >
                        {formatOptionLabel(notification.status)}
                      </span>
                    </TableCell>

                    <TableCell className="text-[var(--title)]">
                      {notification.createdAtLabel}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {notification.canMarkAsRead ? (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={busy}
                            onClick={(event) => {
                              event.stopPropagation();
                              void runAction(async () => {
                                await apiPatch(
                                  `/user/notifications/${notification.id}/read`,
                                  {},
                                  "user",
                                );
                              });
                            }}
                          >
                            Mark Read
                          </Button>
                        ) : null}

                        {notification.canArchive ? (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={busy}
                            onClick={(event) => {
                              event.stopPropagation();
                              void runAction(async () => {
                                await apiPatch(
                                  `/user/notifications/${notification.id}/archive`,
                                  {},
                                  "user",
                                );
                              });
                            }}
                          >
                            Archive
                          </Button>
                        ) : null}

                        {notification.canDelete ? (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={busy}
                            onClick={(event) => {
                              event.stopPropagation();
                              void runAction(async () => {
                                await apiDelete(
                                  `/user/notifications/${notification.id}`,
                                  "user",
                                );
                              });
                            }}
                          >
                            Delete
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </div>
                ))
              )}
            </TableBody>
          </TableGrid>
        </TableMain>
      </Table>

      <Modal
        open={Boolean(detailsNotification)}
        onClose={() => setDetailsNotification(null)}
      >
        <div className="space-y-4 pr-8">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl"
              style={{ background: "var(--surface-2)" }}
            >
              <Bell className="h-5 w-5 text-[var(--color-brand-500)]" />
            </div>
            <div>
              <h3 className="title-md">{detailsNotification?.title}</h3>
              <p className="paragraph mt-1">
                {detailsNotification?.createdAtLabel}
              </p>
            </div>
          </div>

          <div
            className="rounded-2xl border p-4"
            style={{
              borderColor: "var(--border)",
              background: "var(--surface-2)",
            }}
          >
            <p className="text-sm text-[var(--title)]">
              {detailsNotification?.message}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div
              className="rounded-xl border p-4"
              style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Type
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--title)]">
                {detailsNotification ? formatOptionLabel(detailsNotification.type) : "-"}
              </p>
            </div>

            <div
              className="rounded-xl border p-4"
              style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Source
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--title)]">
                {detailsNotification ? formatOptionLabel(detailsNotification.source) : "-"}
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
