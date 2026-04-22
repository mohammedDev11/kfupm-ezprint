"use client";

import {
  Archive,
  CheckCircle2,
  CircleAlert,
  Crown,
  Link2,
  Plus,
  Shield,
  Trash2,
  UserRound,
  FileOutput,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

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
import StatusBadge from "@/components/ui/badge/StatusBadge";
import Button from "@/components/ui/button/Button";
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from "@/components/ui/dropdown/Dropdown";
import Input from "@/components/ui/input/Input";
import Modal from "@/components/ui/modal/Modal";
import SegmentToggle from "@/components/shared/actions/SegmentToggle";
import {
  sharedAccountsData,
  sharedAccountsTableColumns,
  sharedAccountStatusSortOrder,
  SharedAccountItem,
  SharedAccountSortKey,
  SharedAccountStatus,
} from "@/lib/mock-data/Admin/accounts";

type SortDir = "asc" | "desc";

type ActionValue =
  | "export-groups"
  | "archive-group"
  | "delete-group"
  | "refresh-data";

type SegmentValue =
  | "details"
  | "add-linked-account"
  | "change-primary-account"
  | "view-logs"
  | "edit-notes"
  | "delete-grouping";

const columnsClassName =
  "[grid-template-columns:72px_minmax(220px,1.2fr)_minmax(190px,1fr)_minmax(120px,0.7fr)_minmax(220px,1.1fr)_minmax(180px,1fr)_minmax(140px,0.8fr)_minmax(200px,1fr)]";

function SharedStatusBadge({
  status,
}: {
  status: SharedAccountStatus | string;
}) {
  const compactClassName =
    "whitespace-nowrap rounded-full !gap-2 !px-3 !py-1.5 !text-sm [&>span:first-child]:h-auto [&>span:first-child]:w-auto";

  if (status === "Active") {
    return (
      <StatusBadge
        label="Active"
        tone="success"
        icon={<CheckCircle2 className="h-4 w-4" />}
        className={compactClassName}
      />
    );
  }

  if (status === "Suspended" || status === "Needs Review") {
    return (
      <StatusBadge
        label="Suspended"
        tone="danger"
        icon={<CircleAlert className="h-4 w-4" />}
        className={compactClassName}
      />
    );
  }

  return (
    <StatusBadge
      label="Inactive"
      tone="inactive"
      icon={<Archive className="h-4 w-4" />}
      className={compactClassName}
    />
  );
}

function MiniPill({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "brand" | "success";
}) {
  const className =
    tone === "brand"
      ? "border-transparent bg-brand-500 text-white"
      : tone === "success"
      ? "border-transparent bg-success-100 text-success-600"
      : "border-[var(--border)] bg-[var(--surface-2)] text-[var(--title)]";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold ${className}`}
    >
      {label}
    </span>
  );
}

function InfoCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      className="min-w-0 rounded-[28px] border p-7"
      style={{
        background: "var(--surface-2)",
        borderColor: "var(--border)",
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
        {label}
      </p>
      <div className="mt-4 break-words text-3xl font-semibold text-[var(--title)]">
        {value}
      </div>
    </div>
  );
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <p className="break-words paragraph !text-lg">
      <span className="text-[var(--muted)]">{label}: </span>
      <span className="font-semibold text-[var(--title)]">{value}</span>
    </p>
  );
}

const SharedAccountsTable = () => {
  const [groups, setGroups] = useState<SharedAccountItem[]>(sharedAccountsData);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SharedAccountSortKey>("personName");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<SharedAccountItem | null>(
    null
  );
  const [segment, setSegment] = useState<SegmentValue>("details");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [actionValue, setActionValue] = useState<ActionValue | null>(null);

  const [createFullName, setCreateFullName] = useState("");
  const [createIdentifier, setCreateIdentifier] = useState("");
  const [createDepartment, setCreateDepartment] = useState("");
  const [createNotes, setCreateNotes] = useState("");
  const [accountSearch, setAccountSearch] = useState("");

  const [notesDraft, setNotesDraft] = useState("");
  const [linkedSearch, setLinkedSearch] = useState("");
  const [newLinkedUsername, setNewLinkedUsername] = useState("");
  const [newLinkedRole, setNewLinkedRole] = useState("");
  const [newPrimaryId, setNewPrimaryId] = useState("");

  useEffect(() => {
    if (!selectedGroup) return;
    setNotesDraft(selectedGroup.notes);
    setLinkedSearch("");
    const primary = selectedGroup.linkedAccounts.find((item) => item.isPrimary);
    setNewPrimaryId(primary?.id ?? "");
  }, [selectedGroup]);

  const handleSort = (key: SharedAccountSortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDir("asc");
  };

  const filteredGroups = useMemo(() => {
    const term = search.trim().toLowerCase();

    return [...groups]
      .filter((group) => {
        if (!term) return true;

        return (
          group.personName.toLowerCase().includes(term) ||
          group.primaryAccount.toLowerCase().includes(term) ||
          group.department.toLowerCase().includes(term) ||
          group.status.toLowerCase().includes(term) ||
          group.linkedRoles.join(" ").toLowerCase().includes(term) ||
          group.identifier.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => {
        const getSortValue = (item: SharedAccountItem) => {
          switch (sortKey) {
            case "personName":
              return item.personName.toLowerCase();
            case "primaryAccount":
              return item.primaryAccount.toLowerCase();
            case "linkedCount":
              return item.linkedCount;
            case "linkedRoles":
              return item.linkedRoles.join(", ").toLowerCase();
            case "department":
              return item.department.toLowerCase();
            case "status":
              return sharedAccountStatusSortOrder[item.status];
            case "lastActivity":
              return item.lastActivity.toLowerCase();
            default:
              return item.personName.toLowerCase();
          }
        };

        const aValue = getSortValue(a);
        const bValue = getSortValue(b);

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortDir === "asc" ? aValue - bValue : bValue - aValue;
        }

        return sortDir === "asc"
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      });
  }, [groups, search, sortKey, sortDir]);

  const selectedGroups = useMemo(
    () => groups.filter((group) => selectedIds.includes(group.id)),
    [groups, selectedIds]
  );

  const allVisibleIds = filteredGroups.map((group) => group.id);
  const isAllSelected =
    allVisibleIds.length > 0 &&
    allVisibleIds.every((id) => selectedIds.includes(id));

  const toggleRowSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !allVisibleIds.includes(id))
      );
      return;
    }

    setSelectedIds((prev) => Array.from(new Set([...prev, ...allVisibleIds])));
  };

  const removeSelectedGroupFromAction = (id: string) => {
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  };

  const selectedLinkedAccounts = useMemo(() => {
    if (!selectedGroup) return [];

    const term = linkedSearch.trim().toLowerCase();

    return selectedGroup.linkedAccounts.filter((account) => {
      if (!term) return true;

      return (
        account.username.toLowerCase().includes(term) ||
        account.identifier.toLowerCase().includes(term) ||
        account.department.toLowerCase().includes(term) ||
        account.role.toLowerCase().includes(term)
      );
    });
  }, [selectedGroup, linkedSearch]);

  const totals = useMemo(() => {
    if (!selectedGroup) return null;

    const linkedAccounts = selectedGroup.linkedAccounts;

    return {
      linkedAccounts: linkedAccounts.length,
      pages: linkedAccounts.reduce((sum, item) => sum + item.pages, 0),
      jobs: linkedAccounts.reduce((sum, item) => sum + item.jobs, 0),
      balance: linkedAccounts.reduce((sum, item) => sum + item.balance, 0),
    };
  }, [selectedGroup]);

  const segmentOptions = [
    { value: "details", label: "View Details" },
    { value: "add-linked-account", label: "Add Linked Account" },
    { value: "change-primary-account", label: "Change Primary Account" },
    { value: "view-logs", label: "View Logs" },
    { value: "edit-notes", label: "Edit Notes" },
    { value: "delete-grouping", label: "Delete Grouping" },
  ];

  const openGroupModal = (group: SharedAccountItem) => {
    setSelectedGroup(group);
    setSegment("details");
  };

  const syncSelectedGroup = (updatedGroup: SharedAccountItem) => {
    setSelectedGroup(updatedGroup);
    setGroups((prev) =>
      prev.map((group) => (group.id === updatedGroup.id ? updatedGroup : group))
    );
  };

  const createSharedAccount = () => {
    const fullName = createFullName.trim() || "New Person";
    const identifier = createIdentifier.trim() || `EMP-${1000 + groups.length}`;
    const department = createDepartment.trim() || "General";
    const now = "2026-04-10 10:30 AM";

    const usernameBase = fullName
      .toLowerCase()
      .replace(/\s+/g, ".")
      .replace(/[^a-z0-9.]/g, "");

    const newGroup: SharedAccountItem = {
      id: `shared-${Date.now()}`,
      personName: fullName,
      identifier,
      primaryAccount: usernameBase || "new.primary",
      linkedCount: 1,
      linkedRoles: ["Staff"],
      department,
      status: "Active" as SharedAccountStatus,
      lastActivity: now,
      createdBy: "Mohammed Alshammasi",
      createdAt: now,
      updatedAt: now,
      notes: createNotes.trim() || "New shared account group created manually.",
      linkedAccounts: [
        {
          id: `linked-${Date.now()}`,
          username: usernameBase || "new.primary",
          identifier,
          department,
          role: "Staff",
          status: "Active",
          balance: 0,
          pages: 0,
          jobs: 0,
          lastActivity: now,
          isPrimary: true,
        },
      ],
      logs: [
        {
          id: `log-${Date.now()}`,
          title: "Create Shared Account Group",
          description: "Created new shared account group from admin panel.",
          by: "Mohammed Alshammasi",
          date: now,
        },
      ],
    };

    setGroups((prev) => [newGroup, ...prev]);
    setIsCreateModalOpen(false);
    setCreateFullName("");
    setCreateIdentifier("");
    setCreateDepartment("");
    setCreateNotes("");
    setAccountSearch("");
  };

  const saveNotes = () => {
    if (!selectedGroup) return;

    const updatedGroup: SharedAccountItem = {
      ...selectedGroup,
      notes: notesDraft.trim() || selectedGroup.notes,
      updatedAt: "2026-04-10 10:30 AM",
      logs: [
        {
          id: `log-${Date.now()}`,
          title: "Edit Notes",
          description: "Updated shared account notes.",
          by: "Mohammed Alshammasi",
          date: "2026-04-10 10:30 AM",
        },
        ...selectedGroup.logs,
      ],
    };

    syncSelectedGroup(updatedGroup);
    setSegment("details");
  };

  const addLinkedAccount = () => {
    if (!selectedGroup) return;
    if (!newLinkedUsername.trim()) return;

    const role = newLinkedRole.trim() || "Staff";
    const newAccount = {
      id: `linked-${Date.now()}`,
      username: newLinkedUsername.trim(),
      identifier: `${selectedGroup.identifier}-ALT`,
      department: selectedGroup.department,
      role,
      status: "Active" as const,
      balance: 0,
      pages: 0,
      jobs: 0,
      lastActivity: "2026-04-10 10:30 AM",
      isPrimary: false,
    };

    const updatedAccounts = [...selectedGroup.linkedAccounts, newAccount];
    const updatedGroup: SharedAccountItem = {
      ...selectedGroup,
      linkedAccounts: updatedAccounts,
      linkedCount: updatedAccounts.length,
      linkedRoles: Array.from(
        new Set(updatedAccounts.map((item) => item.role))
      ),
      updatedAt: "2026-04-10 10:30 AM",
      logs: [
        {
          id: `log-${Date.now()}`,
          title: "Linked Account Added",
          description: `Added linked account "${newAccount.username}".`,
          by: "Mohammed Alshammasi",
          date: "2026-04-10 10:30 AM",
        },
        ...selectedGroup.logs,
      ],
    };

    syncSelectedGroup(updatedGroup);
    setNewLinkedUsername("");
    setNewLinkedRole("");
    setSegment("details");
  };

  const changePrimaryAccount = () => {
    if (!selectedGroup || !newPrimaryId) return;

    const updatedAccounts = selectedGroup.linkedAccounts.map((account) => ({
      ...account,
      isPrimary: account.id === newPrimaryId,
    }));

    const nextPrimary =
      updatedAccounts.find((account) => account.isPrimary)?.username ??
      selectedGroup.primaryAccount;

    const updatedGroup: SharedAccountItem = {
      ...selectedGroup,
      linkedAccounts: updatedAccounts,
      primaryAccount: nextPrimary,
      updatedAt: "2026-04-10 10:30 AM",
      logs: [
        {
          id: `log-${Date.now()}`,
          title: "Primary Account Changed",
          description: `Primary account changed to "${nextPrimary}".`,
          by: "Mohammed Alshammasi",
          date: "2026-04-10 10:30 AM",
        },
        ...selectedGroup.logs,
      ],
    };

    syncSelectedGroup(updatedGroup);
    setSegment("details");
  };

  const deleteGrouping = () => {
    if (!selectedGroup) return;

    setGroups((prev) => prev.filter((group) => group.id !== selectedGroup.id));
    setSelectedIds((prev) => prev.filter((id) => id !== selectedGroup.id));
    setSelectedGroup(null);
  };

  const handleActionConfirm = () => {
    if (!actionValue) return;

    if (actionValue === "refresh-data") {
      setGroups([...sharedAccountsData]);
      setSelectedIds([]);
      setActionValue(null);
      return;
    }

    if (actionValue === "archive-group") {
      if (selectedIds.length === 0) return;

      setGroups((prev) =>
        prev.map((group) =>
          selectedIds.includes(group.id)
            ? {
                ...group,
                status: "Inactive" as SharedAccountStatus,
                updatedAt: "2026-04-10 10:30 AM",
                logs: [
                  {
                    id: `log-${Date.now()}-${group.id}`,
                    title: "Group Archived",
                    description:
                      "Shared account group archived from admin table.",
                    by: "Mohammed Alshammasi",
                    date: "2026-04-10 10:30 AM",
                  },
                  ...group.logs,
                ],
              }
            : group
        )
      );

      if (selectedGroup && selectedIds.includes(selectedGroup.id)) {
        setSelectedGroup((prev) =>
          prev
            ? {
                ...prev,
                status: "Inactive" as SharedAccountStatus,
                updatedAt: "2026-04-10 10:30 AM",
                logs: [
                  {
                    id: `log-${Date.now()}-selected`,
                    title: "Group Archived",
                    description:
                      "Shared account group archived from admin table.",
                    by: "Mohammed Alshammasi",
                    date: "2026-04-10 10:30 AM",
                  },
                  ...prev.logs,
                ],
              }
            : prev
        );
      }

      setActionValue(null);
      return;
    }

    if (actionValue === "delete-group") {
      if (selectedIds.length === 0) return;

      setGroups((prev) =>
        prev.filter((group) => !selectedIds.includes(group.id))
      );

      if (selectedGroup && selectedIds.includes(selectedGroup.id)) {
        setSelectedGroup(null);
      }

      setSelectedIds([]);
      setActionValue(null);
      return;
    }

    if (actionValue === "export-groups") {
      setActionValue(null);
      return;
    }

    setActionValue(null);
  };

  const renderSegmentContent = () => {
    if (!selectedGroup || !totals) return null;

    if (segment === "details") {
      return (
        <div className="min-w-0 space-y-8 overflow-x-hidden">
          <div className="grid min-w-0 gap-5 xl:grid-cols-4">
            <InfoCard
              label="Total Linked Accounts"
              value={totals.linkedAccounts}
            />
            <InfoCard label="Combined Pages Printed" value={totals.pages} />
            <InfoCard label="Combined Jobs Submitted" value={totals.jobs} />
            <InfoCard
              label="Combined Balance"
              value={totals.balance.toFixed(2)}
            />
          </div>

          <div className="grid min-w-0 gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
            <div
              className="min-w-0 rounded-[32px] border p-8"
              style={{
                background: "var(--surface-2)",
                borderColor: "var(--border)",
              }}
            >
              <h4 className="mb-7 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                Person Information
              </h4>

              <div className="space-y-4">
                <DetailField
                  label="Full name"
                  value={selectedGroup.personName}
                />
                <DetailField
                  label="Identifier"
                  value={selectedGroup.identifier}
                />
                <DetailField
                  label="Department"
                  value={selectedGroup.department}
                />
                <DetailField
                  label="Created by"
                  value={selectedGroup.createdBy}
                />
                <DetailField
                  label="Created date"
                  value={selectedGroup.createdAt}
                />
                <DetailField
                  label="Last updated"
                  value={selectedGroup.updatedAt}
                />
                <DetailField label="Notes" value={selectedGroup.notes} />
              </div>
            </div>

            <div
              className="min-w-0 rounded-[32px] border p-8"
              style={{
                background: "var(--surface-2)",
                borderColor: "var(--border)",
              }}
            >
              <h4 className="mb-7 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                Security / Audit
              </h4>

              <div className="space-y-5">
                {selectedGroup.logs.slice(0, 2).map((log) => (
                  <div
                    key={log.id}
                    className="min-w-0 rounded-[28px] border p-7"
                    style={{
                      background: "var(--surface)",
                      borderColor: "var(--border)",
                    }}
                  >
                    <div className="flex min-w-0 flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0">
                        <h5 className="break-words text-2xl font-semibold text-[var(--title)]">
                          {log.title}
                        </h5>
                        <p className="paragraph mt-3 break-words !text-lg">
                          {log.description}
                        </p>
                        <p className="mt-4 break-words text-xl font-semibold text-[var(--title)]">
                          By {log.by}
                        </p>
                      </div>

                      <p className="shrink-0 text-lg text-[var(--muted)]">
                        {log.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            className="min-w-0 rounded-[32px] border p-8"
            style={{
              background: "var(--surface-2)",
              borderColor: "var(--border)",
            }}
          >
            <div className="mb-5 flex min-w-0 flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                Linked Accounts
              </h4>

              <div className="flex min-w-0 flex-col gap-3 sm:flex-row">
                <div className="w-full min-w-0 sm:min-w-[260px]">
                  <Input
                    value={linkedSearch}
                    onChange={(e) => setLinkedSearch(e.target.value)}
                    placeholder="Search linked accounts..."
                  />
                </div>

                <Button
                  iconLeft={<Link2 className="h-4 w-4" />}
                  className="h-14 shrink-0 px-8 text-base"
                  onClick={() => setSegment("add-linked-account")}
                >
                  Add Linked Account
                </Button>
              </div>
            </div>

            <div className="space-y-5">
              {selectedLinkedAccounts.length === 0 ? (
                <div className="rounded-[28px] border px-7 py-6 text-[var(--muted)]">
                  No linked accounts found.
                </div>
              ) : (
                selectedLinkedAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="min-w-0 rounded-[28px] border px-7 py-6"
                    style={{
                      background: "var(--surface)",
                      borderColor: "var(--border)",
                    }}
                  >
                    <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,1fr)] xl:items-start">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <h5 className="break-all text-2xl font-semibold text-[var(--title)]">
                            {account.username}
                          </h5>
                          {account.isPrimary ? (
                            <MiniPill label="Primary Account" tone="brand" />
                          ) : null}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-3">
                          <MiniPill label={account.role} />
                          <MiniPill
                            label={account.status}
                            tone={
                              account.status === "Active"
                                ? "success"
                                : "neutral"
                            }
                          />
                        </div>

                        <p className="paragraph mt-4 break-words !text-lg">
                          {account.identifier} • {account.department}
                        </p>
                      </div>

                      <div className="min-w-0 xl:pt-1">
                        <p className="paragraph break-words !text-lg">
                          Balance:{" "}
                          <span className="font-semibold text-[var(--title)]">
                            {account.balance.toFixed(2)}
                          </span>
                        </p>
                      </div>

                      <div className="min-w-0 xl:pt-1">
                        <p className="paragraph break-words !text-lg">
                          Pages:{" "}
                          <span className="font-semibold text-[var(--title)]">
                            {account.pages}
                          </span>
                        </p>
                      </div>

                      <div className="min-w-0 xl:pt-1">
                        <p className="paragraph break-words !text-lg">
                          Jobs:{" "}
                          <span className="font-semibold text-[var(--title)]">
                            {account.jobs}
                          </span>
                        </p>
                      </div>

                      <div className="min-w-0 xl:pt-1">
                        <p className="paragraph break-words !text-lg">
                          Last activity:{" "}
                          <span className="font-semibold text-[var(--title)]">
                            {account.lastActivity}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      );
    }

    if (segment === "add-linked-account") {
      return (
        <div className="min-w-0 space-y-8 overflow-x-hidden">
          <div>
            <h3 className="title-lg">Add Linked Account</h3>
            <p className="paragraph mt-3 !text-lg">
              Add another account under the same real person profile.
            </p>
          </div>

          <div className="grid min-w-0 gap-5 md:grid-cols-2">
            <Input
              value={selectedGroup.personName}
              readOnly
              className="!py-7 !text-2xl"
            />
            <Input
              value={selectedGroup.identifier}
              readOnly
              className="!py-7 !text-2xl"
            />
            <Input
              value={newLinkedUsername}
              onChange={(e) => setNewLinkedUsername(e.target.value)}
              placeholder="Linked username"
              className="!py-7 !text-2xl"
            />
            <Input
              value={newLinkedRole}
              onChange={(e) => setNewLinkedRole(e.target.value)}
              placeholder="Role"
              className="!py-7 !text-2xl"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setSegment("details")}>
              Cancel
            </Button>
            <Button
              iconLeft={<Plus className="h-4 w-4" />}
              onClick={addLinkedAccount}
            >
              Add Linked Account
            </Button>
          </div>
        </div>
      );
    }

    if (segment === "change-primary-account") {
      return (
        <div className="min-w-0 space-y-8 overflow-x-hidden">
          <div>
            <h3 className="title-lg">Change Primary Account</h3>
            <p className="paragraph mt-3 !text-lg">
              Select the account that should become the primary identity for
              this group.
            </p>
          </div>

          <div className="space-y-4">
            {selectedGroup.linkedAccounts.map((account) => {
              const isSelected = newPrimaryId === account.id;

              return (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => setNewPrimaryId(account.id)}
                  className="flex w-full min-w-0 items-center justify-between gap-4 rounded-[28px] border px-7 py-6 text-left transition hover:opacity-90"
                  style={{
                    background: isSelected
                      ? "rgba(55, 125, 255, 0.08)"
                      : "var(--surface-2)",
                    borderColor: isSelected
                      ? "var(--color-brand-500)"
                      : "var(--border)",
                  }}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h5 className="break-all text-2xl font-semibold text-[var(--title)]">
                        {account.username}
                      </h5>
                      {account.isPrimary ? (
                        <MiniPill label="Current Primary" tone="brand" />
                      ) : null}
                    </div>

                    <p className="paragraph mt-3 break-words !text-lg">
                      {account.identifier} • {account.department}
                    </p>
                  </div>

                  <Crown
                    className="h-7 w-7 shrink-0"
                    style={{
                      color: isSelected
                        ? "var(--color-brand-500)"
                        : "var(--muted)",
                    }}
                  />
                </button>
              );
            })}
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setSegment("details")}>
              Cancel
            </Button>
            <Button onClick={changePrimaryAccount}>Save Primary Account</Button>
          </div>
        </div>
      );
    }

    if (segment === "view-logs") {
      return (
        <div className="min-w-0 space-y-8 overflow-x-hidden">
          <div>
            <h3 className="title-lg">Shared Account Logs</h3>
            <p className="paragraph mt-3 !text-lg">
              Audit trail for {selectedGroup.personName}
            </p>
          </div>

          <div className="space-y-5">
            {selectedGroup.logs.map((log) => (
              <div
                key={log.id}
                className="min-w-0 rounded-[32px] border p-8"
                style={{
                  background: "var(--surface-2)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="flex min-w-0 flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0">
                    <h4 className="break-words text-2xl font-semibold text-[var(--title)]">
                      {log.title}
                    </h4>
                    <p className="paragraph mt-4 break-words !text-xl">
                      {log.description}
                    </p>
                    <p className="mt-6 break-words text-xl font-semibold text-[var(--title)]">
                      {log.by} • {log.date}
                    </p>
                  </div>

                  <Shield className="h-7 w-7 shrink-0 text-[var(--muted)]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (segment === "edit-notes") {
      return (
        <div className="min-w-0 space-y-8 overflow-x-hidden">
          <div>
            <h3 className="title-lg">Edit Notes</h3>
            <p className="paragraph mt-3 !text-lg">
              Update the notes for this shared account grouping.
            </p>
          </div>

          <div
            className="min-w-0 rounded-[32px] border p-8"
            style={{
              background: "var(--surface-2)",
              borderColor: "var(--border)",
            }}
          >
            <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Notes
            </label>
            <Input
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              className="!py-7 !text-2xl"
              placeholder="Add shared account notes"
            />
          </div>

          <div className="flex justify-end">
            <Button className="px-8" onClick={saveNotes}>
              Save Notes
            </Button>
          </div>
        </div>
      );
    }

    if (segment === "delete-grouping") {
      return (
        <div className="min-w-0 space-y-8 overflow-x-hidden">
          <div>
            <h3 className="title-lg text-red-500">Delete Grouping</h3>
            <p className="paragraph mt-3 !text-lg">
              This will permanently remove the shared account grouping record.
            </p>
          </div>

          <div
            className="min-w-0 rounded-[32px] border p-8"
            style={{
              background: "var(--surface-2)",
              borderColor: "var(--border)",
            }}
          >
            <div className="space-y-4">
              <DetailField
                label="Person Name"
                value={selectedGroup.personName}
              />
              <DetailField
                label="Primary Account"
                value={selectedGroup.primaryAccount}
              />
              <DetailField
                label="Linked Count"
                value={selectedGroup.linkedCount}
              />
              <DetailField
                label="Department"
                value={selectedGroup.department}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setSegment("details")}>
              Cancel
            </Button>
            <Button
              iconLeft={<Trash2 className="h-4 w-4" />}
              onClick={deleteGrouping}
            >
              Delete Grouping
            </Button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <style jsx global>{`
        div.relative.max-h-\\[90vh\\].w-fit.max-w-\\[min\\(96vw\\,1100px\\)\\].overflow-y-auto.rounded-2xl.p-6.shadow-xl:has(
            .shared-accounts-modal-shell
          ) {
          width: min(96vw, 1100px) !important;
          max-width: min(96vw, 1100px) !important;
          overflow-x: hidden !important;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        div.relative.max-h-\\[90vh\\].w-fit.max-w-\\[min\\(96vw\\,1100px\\)\\].overflow-y-auto.rounded-2xl.p-6.shadow-xl:has(
            .shared-accounts-modal-shell
          )::-webkit-scrollbar {
          display: none;
        }

        .shared-accounts-modal-shell * {
          min-width: 0;
          box-sizing: border-box;
        }

        .shared-segment-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .shared-segment-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <Table>
        <TableTop>
          <TableTitleBlock
            title="Shared Accounts"
            description={`Manage grouped identities and linked account relationships.${
              selectedIds.length > 0 ? ` ${selectedIds.length} selected.` : ""
            }`}
          />

          <TableControls>
            <TableSearch
              id="search-shared-accounts"
              label="Search shared accounts"
              value={search}
              onChange={setSearch}
              wrapperClassName="w-full md:w-[420px]"
            />

            <Button
              iconLeft={<Plus className="h-4 w-4" />}
              className="h-14 px-6 text-base"
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create Shared Account Group
            </Button>

            <Dropdown
              onValueChange={(value) => setActionValue(value as ActionValue)}
            >
              <DropdownTrigger className="h-14 min-w-[180px] px-6 text-base">
                Actions
              </DropdownTrigger>

              <DropdownContent align="right" widthClassName="w-[260px]">
                <DropdownItem value="export-groups" className="py-4 text-lg">
                  Export Groups
                </DropdownItem>
                <DropdownItem value="archive-group" className="py-4 text-lg">
                  Archive Group
                </DropdownItem>
                <DropdownItem value="delete-group" className="py-4 text-lg">
                  Delete Group
                </DropdownItem>
                <DropdownItem value="refresh-data" className="py-4 text-lg">
                  Refresh Data
                </DropdownItem>
              </DropdownContent>
            </Dropdown>
          </TableControls>
        </TableTop>

        <TableMain>
          <TableGrid minWidthClassName="min-w-[1522px]">
            <TableHeader columnsClassName={columnsClassName}>
              <TableCell className="justify-center">
                <TableCheckbox
                  checked={isAllSelected}
                  onToggle={toggleSelectAll}
                />
              </TableCell>

              {sharedAccountsTableColumns.map((column) => (
                <TableHeaderCell
                  key={column.key}
                  label={column.label}
                  sortable={column.sortable}
                  active={sortKey === column.key}
                  direction={sortDir}
                  onClick={() => column.sortable && handleSort(column.key)}
                />
              ))}
            </TableHeader>

            <TableBody>
              {filteredGroups.length === 0 ? (
                <TableEmptyState text="No shared accounts found" />
              ) : (
                filteredGroups.map((group) => {
                  const isSelected = selectedIds.includes(group.id);

                  return (
                    <div
                      key={group.id}
                      onClick={() => openGroupModal(group)}
                      className={`grid w-full cursor-pointer border-b border-[var(--border)] px-6 py-5 transition last:border-b-0 hover:bg-brand-50/30 ${columnsClassName}`}
                    >
                      <TableCell
                        className="justify-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <TableCheckbox
                          checked={isSelected}
                          onToggle={() => toggleRowSelection(group.id)}
                        />
                      </TableCell>

                      <TableCell className="text-[32px] font-semibold text-[var(--title)] sm:text-base">
                        {group.personName}
                      </TableCell>

                      <TableCell className="paragraph font-semibold text-[var(--title)]">
                        {group.primaryAccount}
                      </TableCell>

                      <TableCell className="paragraph font-semibold text-[var(--title)]">
                        {group.linkedCount}
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {group.linkedRoles.map((role) => (
                            <MiniPill key={role} label={role} />
                          ))}
                        </div>
                      </TableCell>

                      <TableCell className="paragraph">
                        {group.department}
                      </TableCell>

                      <TableCell>
                        <SharedStatusBadge status={group.status} />
                      </TableCell>

                      <TableCell className="paragraph">
                        {group.lastActivity}
                      </TableCell>
                    </div>
                  );
                })
              )}
            </TableBody>
          </TableGrid>
        </TableMain>
      </Table>

      <Modal
        open={Boolean(selectedGroup)}
        onClose={() => setSelectedGroup(null)}
      >
        {selectedGroup ? (
          <div className="shared-accounts-modal-shell w-full max-w-full min-w-0 space-y-8 overflow-x-hidden pr-2">
            <div className="min-w-0 space-y-5">
              <div className="min-w-0">
                <h3 className="break-words title-xl">
                  {selectedGroup.personName}
                </h3>
                <p className="paragraph mt-2 break-words !text-lg">
                  Primary account:{" "}
                  <span className="font-semibold text-[var(--title)]">
                    {selectedGroup.primaryAccount}
                  </span>
                </p>
              </div>

              <div className="shared-segment-scroll w-full overflow-x-auto overflow-y-hidden pb-1">
                <div className="w-max min-w-full">
                  <SegmentToggle
                    options={segmentOptions}
                    value={segment}
                    onChange={(value) => setSegment(value as SegmentValue)}
                    className="w-max min-w-full max-w-none flex-nowrap"
                    buttonClassName="text-base"
                  />
                </div>
              </div>
            </div>

            <div className="min-w-0 overflow-x-hidden">
              {renderSegmentContent()}
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      >
        <div className="w-[min(96vw,920px)] max-w-full min-w-0 space-y-8 overflow-x-hidden">
          <div>
            <h3 className="title-lg">Create Shared Account Group</h3>
          </div>

          <div className="grid min-w-0 gap-6 md:grid-cols-2">
            <div className="min-w-0">
              <label className="mb-2 block text-sm font-medium text-[var(--muted)]">
                Full Name *
              </label>
              <Input
                value={createFullName}
                onChange={(e) => setCreateFullName(e.target.value)}
                placeholder="e.g. Jane Smith"
              />
            </div>

            <div className="min-w-0">
              <label className="mb-2 block text-sm font-medium text-[var(--muted)]">
                Employee / University ID
              </label>
              <Input
                value={createIdentifier}
                onChange={(e) => setCreateIdentifier(e.target.value)}
                placeholder="e.g. EMP-1042"
              />
            </div>

            <div className="min-w-0">
              <label className="mb-2 block text-sm font-medium text-[var(--muted)]">
                Department
              </label>
              <Input
                value={createDepartment}
                onChange={(e) => setCreateDepartment(e.target.value)}
                placeholder="e.g. IT"
              />
            </div>

            <div className="min-w-0">
              <label className="mb-2 block text-sm font-medium text-[var(--muted)]">
                Notes
              </label>
              <Input
                value={createNotes}
                onChange={(e) => setCreateNotes(e.target.value)}
                placeholder="Optional notes..."
              />
            </div>
          </div>

          <div className="min-w-0">
            <label className="mb-2 block text-sm font-medium text-[var(--muted)]">
              Search & Add Accounts
            </label>
            <Input
              value={accountSearch}
              onChange={(e) => setAccountSearch(e.target.value)}
              placeholder="Search by username or name..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              iconLeft={<UserRound className="h-4 w-4" />}
              onClick={createSharedAccount}
            >
              Create Group
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={Boolean(actionValue)} onClose={() => setActionValue(null)}>
        <div className="w-[min(92vw,720px)] max-w-full min-w-0 space-y-5 overflow-x-hidden">
          <div>
            <h3 className="title-md flex items-center gap-2">
              {actionValue === "export-groups" && (
                <>
                  <FileOutput className="h-5 w-5 text-brand-500" />
                  Export Groups
                </>
              )}
              {actionValue === "archive-group" && (
                <>
                  <Archive className="h-5 w-5 text-[var(--muted)]" />
                  Archive Group
                </>
              )}
              {actionValue === "delete-group" && (
                <>
                  <Trash2 className="h-5 w-5 text-red-500" />
                  Delete Group
                </>
              )}
              {actionValue === "refresh-data" && "Refresh Data"}
            </h3>

            <p className="paragraph mt-2">
              {actionValue === "export-groups" &&
                "Review the selected groups below before wiring this action to your export service."}
              {actionValue === "archive-group" &&
                "The selected groups below will be archived."}
              {actionValue === "delete-group" &&
                "The selected groups below will be permanently removed from the table."}
              {actionValue === "refresh-data" &&
                "This will restore the local preview data."}
            </p>

            {actionValue !== "refresh-data" ? (
              <p className="paragraph mt-2">
                Total selected:{" "}
                <span className="font-semibold">{selectedGroups.length}</span>
              </p>
            ) : null}
          </div>

          {actionValue !== "refresh-data" ? (
            <div
              className="max-h-[320px] space-y-3 overflow-y-auto pr-2"
              style={{ scrollbarWidth: "thin" }}
            >
              {selectedGroups.length === 0 ? (
                <div
                  className="rounded-2xl border p-5 text-sm"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--surface-2)",
                    color: "var(--muted)",
                  }}
                >
                  No groups selected.
                </div>
              ) : (
                selectedGroups.map((group) => (
                  <div
                    key={group.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border p-4"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--surface-2)",
                    }}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[var(--title)]">
                        {group.personName}
                      </p>
                      <p className="truncate text-sm text-[var(--muted)]">
                        {group.primaryAccount} • {group.department}
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      className="shrink-0"
                      onClick={() => removeSelectedGroupFromAction(group.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))
              )}
            </div>
          ) : null}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setActionValue(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleActionConfirm}
              disabled={
                actionValue !== "refresh-data" && selectedGroups.length === 0
              }
            >
              {actionValue === "refresh-data"
                ? "Refresh"
                : actionValue === "export-groups"
                ? "Export"
                : actionValue === "archive-group"
                ? "Archive"
                : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SharedAccountsTable;
