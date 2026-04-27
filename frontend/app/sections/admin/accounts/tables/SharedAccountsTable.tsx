"use client";

import {
  Archive,
  CheckCircle2,
  CircleAlert,
  Crown,
  Link2,
  Maximize2,
  Minimize2,
  Plus,
  Shield,
  Trash2,
  UserRound,
  WalletCards,
} from "lucide-react";
import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";

import FullscreenTablePortal from "@/components/shared/table/FullscreenTablePortal";
import KpiMetricCard from "@/components/shared/cards/KpiMetricCard";
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
import StatusBadge from "@/components/ui/badge/StatusBadge";
import Button from "@/components/ui/button/Button";
import RefreshButton from "@/components/ui/button/RefreshButton";
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from "@/components/ui/dropdown/Dropdown";
import Input from "@/components/ui/input/Input";
import Modal from "@/components/ui/modal/Modal";
import SegmentToggle from "@/components/shared/actions/SegmentToggle";
import { exportTableData, TableExportFormat } from "@/lib/export";
import {
  sharedAccountsData,
  sharedAccountsTableColumns,
  sharedAccountStatusSortOrder,
  sharedAccountStatusMeta,
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

type MiniPillTone = "neutral" | "brand" | "success" | "warning";
type ExportMethod = TableExportFormat;

export type SharedAccountsTableHandle = {
  openCreateModal: () => void;
};

const columnsClassName =
  "[grid-template-columns:72px_minmax(220px,1.2fr)_minmax(190px,1fr)_minmax(210px,0.85fr)_minmax(260px,1.1fr)_minmax(180px,1fr)_minmax(140px,0.8fr)_minmax(200px,1fr)]";

const cloneSharedAccountsData = () =>
  sharedAccountsData.map((group) => ({
    ...group,
    linkedRoles: [...group.linkedRoles],
    linkedAccounts: group.linkedAccounts.map((account) => ({ ...account })),
    logs: group.logs.map((log) => ({ ...log })),
  }));

function SharedStatusBadge({
  status,
}: {
  status: SharedAccountStatus | string;
}) {
  const compactClassName =
    "whitespace-nowrap rounded-full !gap-2 !px-3 !py-1.5 !text-sm [&>span:first-child]:h-auto [&>span:first-child]:w-auto";

  const normalizedStatus: SharedAccountStatus =
    status === "Active" || status === "Needs Review" || status === "Archived"
      ? status
      : "Archived";

  const meta = sharedAccountStatusMeta[normalizedStatus];
  const icon =
    normalizedStatus === "Active" ? (
      <CheckCircle2 className="h-4 w-4" />
    ) : normalizedStatus === "Needs Review" ? (
      <CircleAlert className="h-4 w-4" />
    ) : (
      <Archive className="h-4 w-4" />
    );

  return (
    <StatusBadge
      label={meta.label}
      tone={meta.tone}
      icon={icon}
      className={compactClassName}
    />
  );
}

function MiniPill({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: MiniPillTone;
}) {
  const toneStyles: Record<MiniPillTone, React.CSSProperties> = {
    brand: {
      borderColor: "color-mix(in srgb, var(--color-brand-500) 28%, transparent)",
      background: "rgba(var(--brand-rgb), 0.12)",
      color: "color-mix(in srgb, var(--color-brand-700) 82%, var(--title))",
    },
    success: {
      borderColor:
        "color-mix(in srgb, var(--color-support-500) 24%, transparent)",
      background:
        "color-mix(in srgb, var(--color-support-500) 12%, var(--surface))",
      color: "color-mix(in srgb, var(--color-support-700) 76%, var(--title))",
    },
    warning: {
      borderColor:
        "color-mix(in srgb, var(--color-warning-500) 24%, transparent)",
      background:
        "color-mix(in srgb, var(--color-warning-500) 12%, var(--surface))",
      color: "color-mix(in srgb, var(--color-warning-600) 78%, var(--title))",
    },
    neutral: {
      borderColor: "var(--border)",
      background: "var(--surface-2)",
      color: "var(--title)",
    },
  };

  return (
    <span
      className="inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold"
      style={toneStyles[tone]}
    >
      {label}
    </span>
  );
}

const getLinkedStatusTone = (status: string): MiniPillTone => {
  if (status === "Active") return "success";
  if (status === "Suspended") return "warning";
  return "neutral";
};

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

const SharedAccountsTable = forwardRef<SharedAccountsTableHandle>(
function SharedAccountsTable(_props, ref) {
  const [groups, setGroups] = useState<SharedAccountItem[]>(
    cloneSharedAccountsData,
  );
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SharedAccountSortKey>("personName");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<SharedAccountItem | null>(
    null
  );
  const [segment, setSegment] = useState<SegmentValue>("details");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  const [actionValue, setActionValue] = useState<ActionValue | null>(null);
  const [exportMethod, setExportMethod] = useState<ExportMethod>("PDF");

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

  useImperativeHandle(
    ref,
    () => ({
      openCreateModal: () => setIsCreateModalOpen(true),
    }),
    [],
  );

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

  const accountStats = useMemo(() => {
    const linkedAccounts = groups.flatMap((group) => group.linkedAccounts);
    const totalBalance = linkedAccounts.reduce(
      (sum, account) => sum + account.balance,
      0
    );
    const activeAccounts = groups.filter(
      (group) => group.status === "Active"
    ).length;
    const reviewOrArchived = groups.length - activeAccounts;

    return {
      totalAccounts: groups.length,
      activeAccounts,
      reviewOrArchived,
      linkedAccounts: linkedAccounts.length,
      totalBalance,
    };
  }, [groups]);

  const kpiCards = [
    {
      title: "Total Shared Accounts",
      value: accountStats.totalAccounts.toLocaleString(),
      helper: `${filteredGroups.length.toLocaleString()} visible in current view`,
      icon: <WalletCards className="h-5 w-5" />,
    },
    {
      title: "Active Accounts",
      value: accountStats.activeAccounts.toLocaleString(),
      helper: "Shared groups currently active",
      icon: <CheckCircle2 className="h-5 w-5" />,
    },
    {
      title: "Review / Archived",
      value: accountStats.reviewOrArchived.toLocaleString(),
      helper: "Groups needing review or archived",
      icon: <Archive className="h-5 w-5" />,
    },
    {
      title: "Linked Balance",
      value: `${accountStats.totalBalance.toFixed(2)} SAR`,
      helper: `${accountStats.linkedAccounts.toLocaleString()} linked accounts tracked`,
      icon: <Link2 className="h-5 w-5" />,
    },
  ];

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

  const exportSharedAccounts = (format: TableExportFormat) => {
    if (selectedGroups.length === 0) return;

    exportTableData({
      title: "Shared Accounts",
      filename: "alpha-queue-shared-accounts",
      format,
      columns: [
        { label: "Person Name", value: (row: SharedAccountItem) => row.personName },
        { label: "Identifier", value: (row) => row.identifier },
        { label: "Primary Account", value: (row) => row.primaryAccount },
        { label: "Linked Accounts", value: (row) => row.linkedCount },
        { label: "Linked Roles", value: (row) => row.linkedRoles },
        { label: "Department", value: (row) => row.department },
        { label: "Status", value: (row) => row.status },
        { label: "Last Activity", value: (row) => row.lastActivity },
        { label: "Notes", value: (row) => row.notes },
      ],
      rows: selectedGroups,
    });
  };

  const handleExportChange = (value: string) => {
    setExportMethod(value as ExportMethod);
    setActionValue("export-groups");
  };

  const handleExportConfirmed = () => {
    exportSharedAccounts(exportMethod);
    setActionValue(null);
  };

  const refreshSharedAccounts = () => {
    setGroups(cloneSharedAccountsData());
    setSelectedIds([]);
    setSelectedGroup(null);
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

  const prepareSelectedGroupDrafts = (group: SharedAccountItem) => {
    setNotesDraft(group.notes);
    setLinkedSearch("");
    const primary = group.linkedAccounts.find((item) => item.isPrimary);
    setNewPrimaryId(primary?.id ?? "");
  };

  const openGroupModal = (group: SharedAccountItem) => {
    prepareSelectedGroupDrafts(group);
    setSelectedGroup(group);
    setSegment("details");
  };

  const syncSelectedGroup = (updatedGroup: SharedAccountItem) => {
    prepareSelectedGroupDrafts(updatedGroup);
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
      refreshSharedAccounts();
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
                status: "Archived" as SharedAccountStatus,
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
        const updatedSelectedGroup: SharedAccountItem = {
          ...selectedGroup,
          status: "Archived" as SharedAccountStatus,
          updatedAt: "2026-04-10 10:30 AM",
          logs: [
            {
              id: `log-${Date.now()}-selected`,
              title: "Group Archived",
              description: "Shared account group archived from admin table.",
              by: "Mohammed Alshammasi",
              date: "2026-04-10 10:30 AM",
            },
            ...selectedGroup.logs,
          ],
        };

        prepareSelectedGroupDrafts(updatedSelectedGroup);
        setSelectedGroup(updatedSelectedGroup);
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
      handleExportConfirmed();
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

              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
                <div className="w-full min-w-0 sm:min-w-[280px]">
                  <Input
                    value={linkedSearch}
                    onChange={(e) => setLinkedSearch(e.target.value)}
                    placeholder="Search linked accounts..."
                    wrapperClassName="h-14"
                    className="h-full py-0"
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
                            tone={getLinkedStatusTone(account.status)}
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
              wrapperClassName="h-14"
              className="h-full !py-0 !text-base"
            />
            <Input
              value={selectedGroup.identifier}
              readOnly
              wrapperClassName="h-14"
              className="h-full !py-0 !text-base"
            />
            <Input
              value={newLinkedUsername}
              onChange={(e) => setNewLinkedUsername(e.target.value)}
              placeholder="Linked username"
              wrapperClassName="h-14"
              className="h-full !py-0 !text-base"
            />
            <Input
              value={newLinkedRole}
              onChange={(e) => setNewLinkedRole(e.target.value)}
              placeholder="Role"
              wrapperClassName="h-14"
              className="h-full !py-0 !text-base"
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button
              variant="outline"
              className="h-14 px-6 text-base"
              onClick={() => setSegment("details")}
            >
              Cancel
            </Button>
            <Button
              iconLeft={<Plus className="h-4 w-4" />}
              className="h-14 px-6 text-base"
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
                      ? "color-mix(in srgb, var(--color-brand-500) 14%, var(--surface))"
                      : "var(--surface-2)",
                    borderColor: isSelected
                      ? "color-mix(in srgb, var(--color-brand-500) 64%, var(--border))"
                      : "var(--border)",
                    boxShadow: isSelected
                      ? "inset 0 0 0 1px color-mix(in srgb, var(--color-brand-500) 36%, transparent)"
                      : "none",
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

          <div className="flex items-center justify-end gap-3">
            <Button
              variant="outline"
              className="h-12 px-6 text-base"
              onClick={() => setSegment("details")}
            >
              Cancel
            </Button>
            <Button
              className="h-12 px-6 text-base"
              onClick={changePrimaryAccount}
            >
              Save Primary Account
            </Button>
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
              wrapperClassName="h-12"
              className="h-full !py-0 !text-base"
              placeholder="Add shared account notes"
            />
          </div>

          <div className="flex items-center justify-end">
            <Button className="h-12 px-6 text-base" onClick={saveNotes}>
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
            <h3 className="title-lg text-[var(--color-brand-600)]">
              Delete Grouping
            </h3>
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

          <div className="flex items-center justify-end gap-3">
            <Button
              variant="outline"
              className="h-12 px-6 text-base"
              onClick={() => setSegment("details")}
            >
              Cancel
            </Button>
            <Button
              iconLeft={<Trash2 className="h-4 w-4" />}
              className="h-12 px-6 text-base"
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
        .shared-accounts-details-modal {
          width: min(1100px, calc(100vw - 2rem)) !important;
          max-width: min(1100px, calc(100vw - 2rem)) !important;
          margin-inline: auto;
          overflow-x: hidden !important;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        @media (min-width: 640px) {
          .shared-accounts-details-modal {
            width: min(1100px, calc(100vw - 3rem)) !important;
            max-width: min(1100px, calc(100vw - 3rem)) !important;
          }
        }

        .shared-accounts-details-modal::-webkit-scrollbar {
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

      <FullscreenTablePortal open={isTableExpanded}>
        {renderSharedAccountsTable(true)}
      </FullscreenTablePortal>

      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

        {renderSharedAccountsTable()}
      </div>

      <Modal
        open={Boolean(selectedGroup)}
        onClose={() => setSelectedGroup(null)}
        className="shared-accounts-details-modal"
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
        {actionValue === "export-groups" ? (
          <SelectedRowsExportModal
            title="Export selected shared accounts"
            description="Review the shared accounts to export, remove any row if needed, then choose the export format."
            rows={selectedGroups}
            emptyText="No shared accounts selected."
            exportMethod={exportMethod}
            onExportMethodChange={setExportMethod}
            onRemove={removeSelectedGroupFromAction}
            onCancel={() => setActionValue(null)}
            onExport={handleExportConfirmed}
            getId={(group) => group.id}
            getTitle={(group) => group.personName}
            getSubtitle={(group) =>
              `${group.primaryAccount} • ${group.department}`
            }
            idPrefix="shared-accounts"
          />
        ) : (
        <div className="w-[min(92vw,720px)] max-w-full min-w-0 space-y-5 overflow-x-hidden">
          <div>
            <h3 className="title-md flex items-center gap-2">
              {actionValue === "archive-group" && (
                <>
                  <Archive className="h-5 w-5 text-[var(--muted)]" />
                  Archive Group
                </>
              )}
              {actionValue === "delete-group" && (
                <>
                  <Trash2 className="h-5 w-5 text-[var(--color-brand-500)]" />
                  Delete Group
                </>
              )}
              {actionValue === "refresh-data" && "Refresh Data"}
            </h3>

            <p className="paragraph mt-2">
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
                : actionValue === "archive-group"
                ? "Archive"
                : "Delete"}
            </Button>
          </div>
        </div>
        )}
      </Modal>
    </>
  );

  function renderSharedAccountsTable(expanded = false) {
    return (
      <Table
        className={`flex min-h-[520px] flex-col ${
          expanded ? "h-dvh !rounded-none" : "max-h-[calc(100vh-20rem)]"
        }`}
      >
        <TableTop className={`shrink-0 ${expanded ? "bg-[var(--surface)]" : ""}`}>
          <TableTitleBlock title="Shared Accounts" />

          <TableControls>
            <TableSearch
              id={
                expanded
                  ? "search-shared-accounts-expanded"
                  : "search-shared-accounts"
              }
              label="Search shared accounts"
              value={search}
              onChange={setSearch}
              wrapperClassName="w-full md:w-[420px]"
            />

            <RefreshButton
              className="h-14"
              onClick={refreshSharedAccounts}
            />

            <Dropdown onValueChange={handleExportChange}>
              <DropdownTrigger className="h-14 min-w-[160px] px-6 text-base">
                Export
              </DropdownTrigger>

              <DropdownContent align="right" widthClassName="w-[220px]">
                <DropdownItem value="CSV" className="py-4 text-lg">
                  CSV
                </DropdownItem>
                <DropdownItem value="PDF" className="py-4 text-lg">
                  PDF
                </DropdownItem>
                <DropdownItem value="Excel" className="py-4 text-lg">
                  Excel
                </DropdownItem>
              </DropdownContent>
            </Dropdown>

            <Dropdown
              onValueChange={(value) => setActionValue(value as ActionValue)}
            >
              <DropdownTrigger className="h-14 min-w-[180px] px-6 text-base">
                Actions
              </DropdownTrigger>

              <DropdownContent align="right" widthClassName="w-[260px]">
                <DropdownItem value="export-groups" className="py-4 text-lg">
                  Export Shared Accounts
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

            <button
              type="button"
              onClick={() => setIsTableExpanded(!expanded)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-transparent text-[var(--muted)] transition hover:text-[var(--color-brand-500)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(var(--brand-rgb),0.16)]"
              aria-label={
                expanded
                  ? "Collapse shared accounts table"
                  : "Expand shared accounts table"
              }
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

        <TableMain className="min-h-0 flex-1">
          <TableGrid minWidthClassName="flex h-full min-w-[1522px] flex-col">
            <TableHeader columnsClassName={columnsClassName}>
              <TableCell className="justify-center">
                <TableCheckbox
                  checked={isAllSelected}
                  onToggle={toggleSelectAll}
                />
              </TableCell>

              {sharedAccountsTableColumns.map((column) => {
                const isSortable =
                  column.sortable || column.key === "linkedRoles";

                return (
                  <TableHeaderCell
                    key={column.key}
                    label={column.label}
                    sortable={isSortable}
                    active={sortKey === column.key}
                    direction={sortDir}
                    onClick={() => isSortable && handleSort(column.key)}
                  />
                );
              })}
            </TableHeader>

            <div className="min-h-0 flex-1 overflow-y-auto">
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
            </div>
          </TableGrid>
        </TableMain>
      </Table>
    );
  }
});

export default SharedAccountsTable;
