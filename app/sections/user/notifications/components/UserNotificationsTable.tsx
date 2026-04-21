"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Bell, Check, RefreshCw, Trash2 } from "lucide-react";
import Modal from "@/app/components/ui/modal/Modal";
import Button from "@/app/components/ui/button/Button";
import ExpandedButton from "@/app/components/ui/button/ExpandedButton";
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from "@/app/components/ui/dropdown/Dropdown";
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
  TableTop,
} from "@/app/components/shared/table/Table";
import {
  userNotificationActionOptions,
  userNotificationColumns,
  userNotificationData,
  userNotificationModalContent,
  userNotificationSeverityOptions,
  userNotificationSeverityRank,
  userNotificationSourceOptions,
  userNotificationStatusOptions,
  userNotificationStatusRank,
  userNotificationTableMeta,
  userNotificationTypeOptions,
  type UserNotificationActionValue,
  type UserNotificationItem,
  type UserNotificationSeverity,
  type UserNotificationSortKey,
  type UserNotificationStatus,
} from "@/Data/User/notifications";

type SortDir = "asc" | "desc";

const TOTAL_SECONDS = Number(userNotificationTableMeta.refreshSeconds);
const columnsClassName = userNotificationTableMeta.columnsClassName;

function formatTypeLabel(type: UserNotificationItem["type"]) {
  switch (type) {
    case "print-job":
      return "Print Job";
    case "balance":
      return "Balance";
    case "redeem-card":
      return "Redeem Card";
    case "printer":
      return "Printer";
    case "system":
      return "System";
    case "account":
      return "Account";
    default:
      return type;
  }
}

function formatSourceLabel(source: UserNotificationItem["source"]) {
  switch (source) {
    case "web-print":
      return "Web Print";
    case "jobs-pending-release":
      return "Jobs Pending Release";
    case "recent-print-jobs":
      return "Recent Print Jobs";
    case "transaction-history":
      return "Transaction History";
    case "redeem-card":
      return "Redeem Card";
    case "printer-device":
      return "Printer Device";
    case "system":
      return "System";
    default:
      return source;
  }
}

function SeverityBadge({ severity }: { severity: UserNotificationSeverity }) {
  const styles: Record<UserNotificationSeverity, string> = {
    info: "bg-slate-800 text-white",
    success: "bg-green-100 text-green-600",
    warning: "bg-amber-100 text-amber-600",
    error: "bg-red-100 text-red-500",
    critical: "bg-red-100 text-red-500",
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium ${styles[severity]}`}
    >
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </span>
  );
}

function StatusBadge({ status }: { status: UserNotificationStatus }) {
  const styles: Record<UserNotificationStatus, string> = {
    unread: "bg-amber-100 text-amber-600",
    read: "bg-slate-800 text-white",
    resolved: "bg-green-100 text-green-600",
    archived: "bg-slate-100 text-slate-500",
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium ${styles[status]}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function RefreshTimer({
  secondsLeft,
  onRefreshNow,
}: {
  secondsLeft: number;
  onRefreshNow: () => void;
}) {
  const progress = secondsLeft / TOTAL_SECONDS;
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);
  const done = secondsLeft === 0;

  return (
    <button
      type="button"
      onClick={onRefreshNow}
      className="btn-secondary h-12 gap-3 px-4"
    >
      <span className="relative flex h-6 w-6 items-center justify-center">
        {done ? (
          <Check className="h-5 w-5 text-success-500" />
        ) : (
          <>
            <svg className="h-6 w-6 -rotate-90" viewBox="0 0 40 40">
              <circle
                cx="20"
                cy="20"
                r={radius}
                fill="none"
                stroke="rgba(148,163,184,0.25)"
                strokeWidth="4"
              />
              <circle
                cx="20"
                cy="20"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                className="text-brand-500 transition-all duration-1000 ease-linear"
              />
            </svg>
            <RefreshCw className="absolute h-3.5 w-3.5 text-brand-500" />
          </>
        )}
      </span>

      <span className="font-medium">
        {done ? "Updated" : `${secondsLeft}s`}
      </span>
    </button>
  );
}

const UserNotificationsTable = () => {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<UserNotificationSortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [secondsLeft, setSecondsLeft] = useState<number>(TOTAL_SECONDS);
  const [typeFilter, setTypeFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");

  const [detailsModal, setDetailsModal] = useState<UserNotificationItem | null>(
    null
  );
  const [actionModal, setActionModal] =
    useState<UserNotificationActionValue | null>(null);
  const [deleteModal, setDeleteModal] = useState<UserNotificationItem | null>(
    null
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 0) return TOTAL_SECONDS;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleRefreshNow = () => {
    setSecondsLeft(0);
    setTimeout(() => {
      setSecondsLeft(TOTAL_SECONDS);
    }, 900);
  };

  const handleSort = (key: UserNotificationSortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDir("asc");
  };

  const toggleRowSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredNotifications = useMemo(() => {
    const term = search.trim().toLowerCase();

    return [...userNotificationData]
      .filter((item) => {
        const matchesSearch =
          !term ||
          item.title.toLowerCase().includes(term) ||
          item.message.toLowerCase().includes(term) ||
          formatSourceLabel(item.source).toLowerCase().includes(term) ||
          formatTypeLabel(item.type).toLowerCase().includes(term);

        const matchesType = typeFilter === "all" || item.type === typeFilter;
        const matchesSeverity =
          severityFilter === "all" || item.severity === severityFilter;
        const matchesStatus =
          statusFilter === "all" || item.status === statusFilter;
        const matchesSource =
          sourceFilter === "all" || item.source === sourceFilter;

        return (
          matchesSearch &&
          matchesType &&
          matchesSeverity &&
          matchesStatus &&
          matchesSource
        );
      })
      .sort((a, b) => {
        const direction = sortDir === "asc" ? 1 : -1;

        switch (sortKey) {
          case "title":
            return a.title.localeCompare(b.title) * direction;
          case "type":
            return a.type.localeCompare(b.type) * direction;
          case "source":
            return a.source.localeCompare(b.source) * direction;
          case "severity":
            return (
              (userNotificationSeverityRank[a.severity] -
                userNotificationSeverityRank[b.severity]) *
              direction
            );
          case "status":
            return (
              (userNotificationStatusRank[a.status] -
                userNotificationStatusRank[b.status]) *
              direction
            );
          case "date":
          default:
            return (
              (new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()) *
              direction
            );
        }
      });
  }, [
    search,
    typeFilter,
    severityFilter,
    statusFilter,
    sourceFilter,
    sortKey,
    sortDir,
  ]);

  const allVisibleIds = filteredNotifications.map((item) => item.id);
  const isAllSelected =
    allVisibleIds.length > 0 &&
    allVisibleIds.every((id) => selectedIds.includes(id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !allVisibleIds.includes(id))
      );
      return;
    }

    setSelectedIds((prev) => Array.from(new Set([...prev, ...allVisibleIds])));
  };

  const actionTitleMap: Record<UserNotificationActionValue, string> = {
    "mark-selected-read": userNotificationModalContent.markRead.title,
    "mark-selected-unread": userNotificationModalContent.markUnread.title,
    "archive-selected": userNotificationModalContent.archive.title,
    "delete-selected": userNotificationModalContent.delete.title,
    "clear-read": userNotificationModalContent.clearRead.title,
  };

  const actionDescriptionMap: Record<UserNotificationActionValue, string> = {
    "mark-selected-read": userNotificationModalContent.markRead.description,
    "mark-selected-unread": userNotificationModalContent.markUnread.description,
    "archive-selected": userNotificationModalContent.archive.description,
    "delete-selected": userNotificationModalContent.delete.description,
    "clear-read": userNotificationModalContent.clearRead.description,
  };

  return (
    <>
      <Table>
        <TableTop className="pb-4">
          <p className="paragraph mt-1">
            {filteredNotifications.length} notifications
          </p>

          <TableControls>
            <TableSearch
              id="search-user-notifications"
              label={userNotificationTableMeta.searchPlaceholder}
              value={search}
              onChange={setSearch}
              wrapperClassName="w-full md:w-[430px]"
            />

            <Dropdown onValueChange={setTypeFilter}>
              <DropdownTrigger className="h-12 min-w-[160px] px-5 text-base">
                {userNotificationTypeOptions.find(
                  (item) => item.value === typeFilter
                )?.label ?? "All Types"}
              </DropdownTrigger>
              <DropdownContent widthClassName="w-[220px]">
                {userNotificationTypeOptions.map((item) => (
                  <DropdownItem key={item.value} value={item.value}>
                    {item.label}
                  </DropdownItem>
                ))}
              </DropdownContent>
            </Dropdown>

            <Dropdown onValueChange={setSeverityFilter}>
              <DropdownTrigger className="h-12 min-w-[170px] px-5 text-base">
                {userNotificationSeverityOptions.find(
                  (item) => item.value === severityFilter
                )?.label ?? "All Severities"}
              </DropdownTrigger>
              <DropdownContent widthClassName="w-[220px]">
                {userNotificationSeverityOptions.map((item) => (
                  <DropdownItem key={item.value} value={item.value}>
                    {item.label}
                  </DropdownItem>
                ))}
              </DropdownContent>
            </Dropdown>

            <Dropdown onValueChange={setStatusFilter}>
              <DropdownTrigger className="h-12 min-w-[160px] px-5 text-base">
                {userNotificationStatusOptions.find(
                  (item) => item.value === statusFilter
                )?.label ?? "All Statuses"}
              </DropdownTrigger>
              <DropdownContent widthClassName="w-[220px]">
                {userNotificationStatusOptions.map((item) => (
                  <DropdownItem key={item.value} value={item.value}>
                    {item.label}
                  </DropdownItem>
                ))}
              </DropdownContent>
            </Dropdown>

            <Dropdown onValueChange={setSourceFilter}>
              <DropdownTrigger className="h-12 min-w-[170px] px-5 text-base">
                {userNotificationSourceOptions.find(
                  (item) => item.value === sourceFilter
                )?.label ?? "All Sources"}
              </DropdownTrigger>
              <DropdownContent widthClassName="w-[240px]">
                {userNotificationSourceOptions.map((item) => (
                  <DropdownItem key={item.value} value={item.value}>
                    {item.label}
                  </DropdownItem>
                ))}
              </DropdownContent>
            </Dropdown>

            <RefreshTimer
              secondsLeft={secondsLeft}
              onRefreshNow={handleRefreshNow}
            />

            <Dropdown
              onValueChange={(value) =>
                setActionModal(value as UserNotificationActionValue)
              }
            >
              <DropdownTrigger className="h-12 min-w-[180px] px-5 text-base">
                Actions
              </DropdownTrigger>

              <DropdownContent align="right" widthClassName="w-[260px]">
                {userNotificationActionOptions.map((item) => (
                  <DropdownItem
                    key={item.value}
                    value={item.value}
                    className="py-4 text-base"
                  >
                    {item.label}
                  </DropdownItem>
                ))}
              </DropdownContent>
            </Dropdown>
          </TableControls>
        </TableTop>

        <TableMain>
          <TableGrid minWidthClassName="min-w-[1380px]">
            <TableHeader columnsClassName={columnsClassName}>
              <TableCell className="justify-center">
                <TableCheckbox
                  checked={isAllSelected}
                  onToggle={toggleSelectAll}
                />
              </TableCell>

              {userNotificationColumns.map((column) => (
                <TableHeaderCell
                  key={column.key}
                  label={column.label}
                  sortable={column.sortable}
                  active={sortKey === column.key}
                  direction={sortDir}
                  onClick={() =>
                    handleSort(column.key as UserNotificationSortKey)
                  }
                />
              ))}

              <div
                className="text-[11px] font-semibold uppercase tracking-[0.18em] sm:text-xs"
                style={{ color: "var(--muted)" }}
              >
                Quick Actions
              </div>
            </TableHeader>

            <TableBody>
              {filteredNotifications.length === 0 ? (
                <TableEmptyState
                  text={userNotificationTableMeta.emptyStateText}
                />
              ) : (
                filteredNotifications.map((item) => {
                  const isSelected = selectedIds.includes(item.id);

                  return (
                    <div
                      key={item.id}
                      onClick={() => setDetailsModal(item)}
                      className={`grid w-full cursor-pointer items-center border-b border-[var(--border)] px-6 py-4 transition last:border-b-0 hover:bg-brand-50/30 ${columnsClassName}`}
                    >
                      <TableCell className="justify-center">
                        <TableCheckbox
                          checked={isSelected}
                          onToggle={() => toggleRowSelection(item.id)}
                        />
                      </TableCell>

                      <TableCell className="min-w-0 pr-8">
                        <div className="w-full min-w-0">
                          <span className="block truncate text-sm font-semibold text-[var(--title)]">
                            {item.title}
                          </span>
                          <span className="block truncate text-sm text-[var(--muted)]">
                            {item.message}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="min-w-0">
                        <span className="paragraph block truncate">
                          {formatTypeLabel(item.type)}
                        </span>
                      </TableCell>

                      <TableCell className="min-w-0">
                        <span className="paragraph block truncate">
                          {formatSourceLabel(item.source)}
                        </span>
                      </TableCell>

                      <TableCell>
                        <SeverityBadge severity={item.severity} />
                      </TableCell>

                      <TableCell className="min-w-0">
                        <span className="paragraph block truncate">
                          {item.createdAtLabel}
                        </span>
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={item.status} />
                      </TableCell>

                      <TableCell
                        className="justify-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExpandedButton
                          id={`delete-${item.id}`}
                          label="Delete"
                          icon={Trash2}
                          variant="danger"
                          onClick={() => setDeleteModal(item)}
                        />
                      </TableCell>
                    </div>
                  );
                })
              )}
            </TableBody>
          </TableGrid>
        </TableMain>
      </Table>

      <Modal open={Boolean(detailsModal)} onClose={() => setDetailsModal(null)}>
        <div className="space-y-5 pr-8">
          <div className="flex items-start gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
              }}
            >
              <Bell className="h-5 w-5 text-[var(--muted)]" />
            </div>

            <div>
              <h3 className="title-md">{detailsModal?.title}</h3>
              <p className="paragraph mt-1">
                {userNotificationModalContent.details.description}
              </p>
            </div>
          </div>

          <div
            className="rounded-xl border p-4"
            style={{
              background: "var(--surface-2)",
              borderColor: "var(--border)",
            }}
          >
            <p className="paragraph">{detailsModal?.message}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-[var(--muted)]">Type</p>
              <p className="paragraph mt-1">
                {detailsModal ? formatTypeLabel(detailsModal.type) : "-"}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--muted)]">Source</p>
              <p className="paragraph mt-1">
                {detailsModal ? formatSourceLabel(detailsModal.source) : "-"}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--muted)]">
                Severity
              </p>
              <div className="mt-2">
                {detailsModal ? (
                  <SeverityBadge severity={detailsModal.severity} />
                ) : null}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--muted)]">Status</p>
              <div className="mt-2">
                {detailsModal ? (
                  <StatusBadge status={detailsModal.status} />
                ) : null}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--muted)]">Date</p>
              <p className="paragraph mt-1">
                {detailsModal?.createdAtLabel ?? "-"}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--muted)]">
                Reference
              </p>
              <p className="paragraph mt-1">
                {detailsModal?.relatedEntity?.label ?? "No linked reference"}
              </p>
            </div>
          </div>
        </div>
      </Modal>

      <Modal open={Boolean(actionModal)} onClose={() => setActionModal(null)}>
        <div className="space-y-3 pr-8">
          <h3 className="title-md">
            {actionModal ? actionTitleMap[actionModal] : "Notification Action"}
          </h3>

          <p className="paragraph">
            {actionModal
              ? actionDescriptionMap[actionModal]
              : "Apply an action to your selected notifications."}
          </p>

          <p className="paragraph">
            Selected rows:{" "}
            <span className="font-semibold">{selectedIds.length}</span>
          </p>

          <div className="pt-2">
            <Button variant="primary">Confirm</Button>
          </div>
        </div>
      </Modal>

      <Modal open={Boolean(deleteModal)} onClose={() => setDeleteModal(null)}>
        <div className="space-y-3 pr-8">
          <h3 className="title-md">Delete Notification</h3>
          <p className="paragraph">
            This notification will be permanently removed from your notification
            list.
          </p>
          <p className="paragraph font-medium text-[var(--title)]">
            {deleteModal?.title}
          </p>

          <div className="pt-2">
            <Button variant="primary">Delete</Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default UserNotificationsTable;
