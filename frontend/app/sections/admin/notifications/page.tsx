"use client";

import { Bell, RefreshCw, Settings2, ShieldAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import PageIntro from "@/components/shared/page/Text/PageIntro";
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

type Tab = "Notifications" | "Settings";
type SortDir = "asc" | "desc";
type NotificationSortKey = "title" | "type" | "source" | "severity" | "status" | "createdAt";

type AdminNotification = {
  id: string;
  title: string;
  message: string;
  type: string;
  source: string;
  severity: "info" | "warning" | "error" | "critical";
  status: "unread" | "read" | "resolved" | "dismissed";
  affected_device: string;
  error_details: string;
  action_taken: string;
  createdAt: string;
};

type AdminNotificationsResponse = {
  notifications: AdminNotification[];
  summary: {
    total: number;
    unread: number;
    critical: number;
    resolved: number;
  };
};

const REFRESH_SECONDS = 30;
const columnsClassName =
  "[grid-template-columns:72px_minmax(260px,1.4fr)_minmax(150px,0.8fr)_minmax(140px,0.8fr)_minmax(130px,0.7fr)_minmax(130px,0.7fr)_minmax(180px,0.9fr)_minmax(210px,1fr)]";

const toneBySeverity: Record<AdminNotification["severity"], string> = {
  info: "bg-slate-100 text-slate-700",
  warning: "bg-amber-100 text-amber-700",
  error: "bg-red-100 text-red-700",
  critical: "bg-red-200 text-red-800",
};

const toneByStatus: Record<AdminNotification["status"], string> = {
  unread: "bg-amber-100 text-amber-700",
  read: "bg-slate-100 text-slate-700",
  resolved: "bg-emerald-100 text-emerald-700",
  dismissed: "bg-slate-200 text-slate-700",
};

const severityRank: Record<AdminNotification["severity"], number> = {
  info: 0,
  warning: 1,
  error: 2,
  critical: 3,
};

const statusRank: Record<AdminNotification["status"], number> = {
  unread: 0,
  read: 1,
  resolved: 2,
  dismissed: 3,
};

const filterOptions = {
  type: [
    "all",
    "printer_alert",
    "device_error",
    "toner_low",
    "queue_warning",
    "maintenance_reminder",
    "system_warning",
    "job_issue",
  ],
  severity: ["all", "info", "warning", "error", "critical"],
  status: ["all", "unread", "read", "resolved", "dismissed"],
  source: ["all", "Printer", "Device", "Queue", "System", "Report Scheduler", "Admin"],
};

const formatLabel = (value: string) =>
  value
    .replaceAll("_", " ")
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
  title,
  value,
  helper,
}: {
  title: string;
  value: number;
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
            {option === "all" ? `All ${label}` : formatLabel(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function NotificationsPage() {
  const [tab, setTab] = useState<Tab>("Notifications");
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [summary, setSummary] = useState<AdminNotificationsResponse["summary"]>({
    total: 0,
    unread: 0,
    critical: 0,
    resolved: 0,
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
    useState<AdminNotification | null>(null);

  const loadNotifications = async (showSpinner = false) => {
    if (showSpinner) {
      setLoading(true);
    }

    try {
      const data = await apiGet<AdminNotificationsResponse>(
        "/admin/notifications",
        "admin",
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
          resolved: 0,
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
          : "Unable to load admin notifications.",
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
          notification.affected_device,
          notification.error_details,
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
      title: "Admin Notifications",
      filename: "alpha-queue-admin-notifications",
      format,
      columns: [
        { label: "Title", value: (row: AdminNotification) => row.title },
        { label: "Message", value: (row) => row.message },
        { label: "Type", value: (row) => formatLabel(row.type) },
        { label: "Source", value: (row) => row.source },
        { label: "Severity", value: (row) => formatLabel(row.severity) },
        { label: "Status", value: (row) => formatLabel(row.status) },
        { label: "Created", value: (row) => row.createdAt },
        { label: "Affected Device", value: (row) => row.affected_device || "" },
        { label: "Error Details", value: (row) => row.error_details || "" },
      ],
      rows,
    });
  };

  return (
    <div className="space-y-6">
      <PageIntro
        title="Notifications"
        description="Monitor live printer, queue, and job alerts from the backend instead of the old mock table."
      />

      <div className="border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          {(["Notifications", "Settings"] as Tab[]).map((item) => {
            const active = tab === item;

            return (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                className={`rounded-t-md px-5 py-3 text-sm font-semibold transition ${
                  active
                    ? "border-b-2 border-brand-500 text-brand-500"
                    : "text-[var(--muted)]"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      {tab === "Notifications" ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Total"
              value={summary.total}
              helper="Backend-tracked notifications"
            />
            <SummaryCard
              title="Unread"
              value={summary.unread}
              helper="Still waiting for admin action"
            />
            <SummaryCard
              title="Critical"
              value={summary.critical}
              helper="Highest severity alerts"
            />
            <SummaryCard
              title="Resolved"
              value={summary.resolved}
              helper="Already handled in the system"
            />
          </div>

          <Table>
            <TableTop>
              <TableTitleBlock
                title="Admin Notifications"
                description={`Showing ${filteredNotifications.length} notification${filteredNotifications.length === 1 ? "" : "s"} from the live backend feed.`}
              />

              <TableControls>
                <TableSearch
                  id="search-admin-notifications"
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

              <div className="mt-5 flex flex-wrap gap-3">
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
                        "/admin/notifications/bulk/read",
                        { notificationIds: selectedIds },
                        "admin",
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
                          apiPatch(`/admin/notifications/${id}/resolve`, {}, "admin"),
                        ),
                      );
                      setSelectedIds([]);
                    })
                  }
                >
                  Resolve Selected
                </Button>

                <Button
                  variant="outline"
                  disabled={busy || selectedIds.length === 0}
                  onClick={() =>
                    runAction(async () => {
                      await Promise.all(
                        selectedIds.map((id) =>
                          apiPatch(`/admin/notifications/${id}/dismiss`, {}, "admin"),
                        ),
                      );
                      setSelectedIds([]);
                    })
                  }
                >
                  Dismiss Selected
                </Button>

                <Button
                  variant="outline"
                  disabled={busy || selectedIds.length === 0}
                  onClick={() =>
                    runAction(async () => {
                      await apiPost(
                        "/admin/notifications/bulk/delete",
                        { notificationIds: selectedIds },
                        "admin",
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
              <TableGrid minWidthClassName="min-w-[1480px]">
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
                          {formatLabel(notification.type)}
                        </TableCell>

                        <TableCell className="text-[var(--title)]">
                          {notification.source}
                        </TableCell>

                        <TableCell>
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${toneBySeverity[notification.severity]}`}
                          >
                            {formatLabel(notification.severity)}
                          </span>
                        </TableCell>

                        <TableCell>
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${toneByStatus[notification.status]}`}
                          >
                            {formatLabel(notification.status)}
                          </span>
                        </TableCell>

                        <TableCell className="text-[var(--title)]">
                          {notification.createdAt}
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            {notification.status === "unread" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={busy}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  void runAction(async () => {
                                    await apiPatch(
                                      `/admin/notifications/${notification.id}/read`,
                                      {},
                                      "admin",
                                    );
                                  });
                                }}
                              >
                                Mark Read
                              </Button>
                            ) : null}

                            {notification.status !== "resolved" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={busy}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  void runAction(async () => {
                                    await apiPatch(
                                      `/admin/notifications/${notification.id}/resolve`,
                                      {},
                                      "admin",
                                    );
                                  });
                                }}
                              >
                                Resolve
                              </Button>
                            ) : null}

                            {notification.status !== "dismissed" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={busy}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  void runAction(async () => {
                                    await apiPatch(
                                      `/admin/notifications/${notification.id}/dismiss`,
                                      {},
                                      "admin",
                                    );
                                  });
                                }}
                              >
                                Dismiss
                              </Button>
                            ) : null}

                            <Button
                              variant="outline"
                              size="sm"
                              disabled={busy}
                              onClick={(event) => {
                                event.stopPropagation();
                                void runAction(async () => {
                                  await apiDelete(
                                    `/admin/notifications/${notification.id}`,
                                    "admin",
                                  );
                                });
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </div>
                    ))
                  )}
                </TableBody>
              </TableGrid>
            </TableMain>
          </Table>
        </div>
      ) : (
        <div
          className="rounded-2xl border p-6"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ background: "var(--surface-2)" }}
            >
              <Settings2 className="h-5 w-5 text-[var(--color-brand-500)]" />
            </div>
            <div>
              <h2 className="title-md">Notification Settings</h2>
              <p className="paragraph mt-1">
                Live notification state is backend-backed, while rule editing and
                scheduler persistence are intentionally deferred.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div
              className="rounded-2xl border p-5"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface-2)",
              }}
            >
              <p className="text-sm font-semibold text-[var(--title)]">
                Finished now
              </p>
              <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
                <li>Admin can read, resolve, dismiss, and delete live notifications.</li>
                <li>Notifications are created from real job, quota, and backend events.</li>
                <li>Unread and critical counts come from MongoDB.</li>
              </ul>
            </div>

            <div
              className="rounded-2xl border p-5"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface-2)",
              }}
            >
              <p className="text-sm font-semibold text-[var(--title)]">
                Deferred safely
              </p>
              <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
                <li>Rule-builder persistence for thresholds and recipients.</li>
                <li>Email, SMS, and push delivery orchestration.</li>
                <li>Scheduled report notification automation.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

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
              <p className="paragraph mt-1">{detailsNotification?.createdAt}</p>
            </div>
          </div>

          <div
            className="rounded-2xl border p-4"
            style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
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
                Affected Device
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--title)]">
                {detailsNotification?.affected_device || "Not attached"}
              </p>
            </div>

            <div
              className="rounded-xl border p-4"
              style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Error Details
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--title)]">
                {detailsNotification?.error_details || "None"}
              </p>
            </div>
          </div>

          {detailsNotification?.severity === "critical" ? (
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" />
                Critical notification
              </div>
            </div>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
