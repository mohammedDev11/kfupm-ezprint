"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Lock,
  LockOpen,
  Mail,
  Phone,
  Shield,
  SlidersHorizontal,
  UserRound,
  Filter,
  RotateCcw,
  SearchX,
  Trash2,
  FileOutput,
  Wallet,
} from "lucide-react";
import Modal from "@/app/components/ui/modal/Modal";
import Input from "@/app/components/ui/input/Input";
import ExpandedButton from "@/app/components/ui/button/ExpandedButton";
import Button from "@/app/components/ui/button/Button";
import StatusBadge from "@/app/components/ui/badge/StatusBadge";
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
  TableTitleBlock,
  TableTop,
} from "@/app/components/shared/table/Table";
import {
  UserAccountItem,
  UserRestrictedStatus,
  UserSortKey,
  UserDepartment,
  UserRole,
  UserStanding,
  userAccountsData,
  userRestrictedSortOrder,
  userTableColumns,
} from "@/Data/Admin/users";

type SortDir = "asc" | "desc";
type ActionValue =
  | "delete-selected"
  | "export-users"
  | "assign-quota"
  | "restrict-selected"
  | "unrestrict-selected";

type ExportMethod = "PDF" | "Excel" | "CSV";

const columnsClassName =
  "[grid-template-columns:72px_minmax(220px,1.1fr)_minmax(320px,1.6fr)_minmax(160px,0.9fr)_minmax(170px,0.9fr)_minmax(120px,0.7fr)_minmax(100px,0.6fr)]";

const formatMoney = (value: number) => value.toFixed(2);

function RestrictedBadge({ status }: { status: UserRestrictedStatus }) {
  const isUnrestricted = status === "Unrestricted";

  return (
    <StatusBadge
      label=""
      tone={isUnrestricted ? "success" : "danger"}
      icon={
        isUnrestricted ? (
          <LockOpen className="h-5 w-5" />
        ) : (
          <Lock className="h-5 w-5" />
        )
      }
      className="justify-center [&>span:first-child]:h-auto [&>span:first-child]:w-auto [&>span:first-child]:rounded-none [&>span:first-child]:border-0"
    />
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div
      className="flex items-start gap-3 rounded-xl border p-4"
      style={{
        borderColor: "var(--border)",
        background: "var(--surface-2)",
      }}
    >
      <div className="mt-0.5 shrink-0" style={{ color: "var(--muted)" }}>
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          {label}
        </p>
        <div className="mt-1 break-words text-sm sm:text-base">{value}</div>
      </div>
    </div>
  );
}

function FilterCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex items-center justify-between rounded-xl border px-4 py-3 text-left transition"
      style={{
        borderColor: "var(--border)",
        background: checked ? "rgba(55, 125, 255, 0.08)" : "var(--surface-2)",
      }}
    >
      <span className="text-sm font-medium text-[var(--title)]">{label}</span>

      <span
        className={`flex h-5 w-5 items-center justify-center rounded border transition ${
          checked ? "border-brand-500 bg-brand-500" : ""
        }`}
        style={{
          borderColor: checked ? "var(--color-brand-500)" : "var(--border)",
        }}
      >
        {checked ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
      </span>
    </button>
  );
}

const UserAccountsTable = () => {
  const [users, setUsers] = useState<UserAccountItem[]>(userAccountsData);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<UserSortKey>("username");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [openUserModal, setOpenUserModal] = useState<UserAccountItem | null>(
    null
  );

  const [editingRestricted, setEditingRestricted] =
    useState<UserRestrictedStatus>("Unrestricted");
  const [editingQuota, setEditingQuota] = useState("");
  const [editingNotes, setEditingNotes] = useState("");

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [actionModal, setActionModal] = useState<ActionValue | null>(null);

  const [filterRestricted, setFilterRestricted] = useState<
    UserRestrictedStatus[]
  >([]);
  const [filterRoles, setFilterRoles] = useState<UserRole[]>([]);
  const [filterDepartments, setFilterDepartments] = useState<UserDepartment[]>(
    []
  );
  const [filterStandings, setFilterStandings] = useState<UserStanding[]>([]);
  const [minimumQuota, setMinimumQuota] = useState("");
  const [maximumQuota, setMaximumQuota] = useState("");

  const [exportMethod, setExportMethod] = useState<ExportMethod>("PDF");
  const [quotaToAssign, setQuotaToAssign] = useState("");
  const [quotaComment, setQuotaComment] = useState("");

  useEffect(() => {
    if (openUserModal) {
      setEditingRestricted(openUserModal.restricted);
      setEditingQuota(String(openUserModal.quota));
      setEditingNotes(openUserModal.notes);
    }
  }, [openUserModal]);

  useEffect(() => {
    if (actionModal === "export-users") {
      setExportMethod("PDF");
    }

    if (actionModal === "assign-quota") {
      setQuotaToAssign("");
      setQuotaComment("");
    }
  }, [actionModal]);

  const roleOptions: UserRole[] = ["Student", "Faculty", "Staff", "Admin"];
  const departmentOptions: UserDepartment[] = [
    "Software Engineering",
    "Computer Science",
    "Information Systems",
    "Cybersecurity",
    "Mathematics",
    "Deanship",
  ];
  const standingOptions: UserStanding[] = [
    "Freshman",
    "Sophomore",
    "Junior",
    "Senior",
    "Graduate",
    "Faculty",
    "Staff",
  ];
  const restrictedOptions: UserRestrictedStatus[] = [
    "Restricted",
    "Unrestricted",
  ];

  const handleSort = (key: UserSortKey) => {
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

  const toggleFromList = <T,>(
    value: T,
    list: T[],
    setter: (next: T[]) => void
  ) => {
    if (list.includes(value)) {
      setter(list.filter((item) => item !== value));
      return;
    }

    setter([...list, value]);
  };

  const resetFilters = () => {
    setFilterRestricted([]);
    setFilterRoles([]);
    setFilterDepartments([]);
    setFilterStandings([]);
    setMinimumQuota("");
    setMaximumQuota("");
  };

  const hasActiveFilters =
    filterRestricted.length > 0 ||
    filterRoles.length > 0 ||
    filterDepartments.length > 0 ||
    filterStandings.length > 0 ||
    minimumQuota.trim() !== "" ||
    maximumQuota.trim() !== "";

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    const minQuotaValue =
      minimumQuota.trim() === "" ? null : Number(minimumQuota);
    const maxQuotaValue =
      maximumQuota.trim() === "" ? null : Number(maximumQuota);

    return [...users]
      .filter((user) => {
        const matchesSearch =
          !term ||
          user.username.toLowerCase().includes(term) ||
          user.fullName.toLowerCase().includes(term) ||
          user.restricted.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          user.role.toLowerCase().includes(term) ||
          user.department.toLowerCase().includes(term) ||
          user.standing.toLowerCase().includes(term);

        const matchesRestricted =
          filterRestricted.length === 0 ||
          filterRestricted.includes(user.restricted);

        const matchesRole =
          filterRoles.length === 0 || filterRoles.includes(user.role);

        const matchesDepartment =
          filterDepartments.length === 0 ||
          filterDepartments.includes(user.department);

        const matchesStanding =
          filterStandings.length === 0 ||
          filterStandings.includes(user.standing);

        const matchesMinQuota =
          minQuotaValue === null || user.quota >= minQuotaValue;

        const matchesMaxQuota =
          maxQuotaValue === null || user.quota <= maxQuotaValue;

        return (
          matchesSearch &&
          matchesRestricted &&
          matchesRole &&
          matchesDepartment &&
          matchesStanding &&
          matchesMinQuota &&
          matchesMaxQuota
        );
      })
      .sort((a, b) => {
        const getSortValue = (item: UserAccountItem) => {
          switch (sortKey) {
            case "username":
              return item.username.toLowerCase();
            case "fullName":
              return item.fullName.toLowerCase();
            case "quota":
              return item.quota;
            case "restricted":
              return userRestrictedSortOrder[item.restricted];
            case "pages":
              return item.pages;
            case "jobs":
              return item.jobs;
            default:
              return item.username.toLowerCase();
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
  }, [
    users,
    search,
    sortKey,
    sortDir,
    filterRestricted,
    filterRoles,
    filterDepartments,
    filterStandings,
    minimumQuota,
    maximumQuota,
  ]);

  const selectedUsers = useMemo(
    () => users.filter((user) => selectedIds.includes(user.id)),
    [users, selectedIds]
  );

  const allVisibleIds = filteredUsers.map((user) => user.id);
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

  const removeSelectedUserFromAction = (id: string) => {
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  };

  const applyBulkRestrictedStatus = (status: UserRestrictedStatus) => {
    if (selectedIds.length === 0) return;

    setUsers((prev) =>
      prev.map((user) =>
        selectedIds.includes(user.id) ? { ...user, restricted: status } : user
      )
    );

    if (openUserModal && selectedIds.includes(openUserModal.id)) {
      setOpenUserModal((prev) =>
        prev ? { ...prev, restricted: status } : prev
      );
      setEditingRestricted(status);
    }

    setActionModal(null);
  };

  const handleActionChange = (value: string) => {
    const nextValue = value as ActionValue;

    if (nextValue === "restrict-selected") {
      applyBulkRestrictedStatus("Restricted");
      return;
    }

    if (nextValue === "unrestrict-selected") {
      applyBulkRestrictedStatus("Unrestricted");
      return;
    }

    setActionModal(nextValue);
  };

  const handleSaveUserModal = () => {
    if (!openUserModal) return;

    const parsedQuota = Number(editingQuota);
    const safeQuota = Number.isNaN(parsedQuota)
      ? openUserModal.quota
      : parsedQuota;

    const updatedUser: UserAccountItem = {
      ...openUserModal,
      restricted: editingRestricted,
      quota: safeQuota,
      notes: editingNotes,
    };

    setUsers((prev) =>
      prev.map((user) => (user.id === openUserModal.id ? updatedUser : user))
    );

    setOpenUserModal(null);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;

    setUsers((prev) => prev.filter((user) => !selectedIds.includes(user.id)));
    setSelectedIds([]);
    setActionModal(null);
  };

  const handleAssignQuota = () => {
    const parsedQuota = Number(quotaToAssign);
    if (selectedIds.length === 0 || Number.isNaN(parsedQuota)) return;

    setUsers((prev) =>
      prev.map((user) =>
        selectedIds.includes(user.id)
          ? {
              ...user,
              quota: parsedQuota,
              notes: quotaComment.trim()
                ? `${user.notes} ${quotaComment.trim()}`
                : user.notes,
            }
          : user
      )
    );

    if (openUserModal && selectedIds.includes(openUserModal.id)) {
      setOpenUserModal((prev) =>
        prev
          ? {
              ...prev,
              quota: parsedQuota,
              notes: quotaComment.trim()
                ? `${prev.notes} ${quotaComment.trim()}`
                : prev.notes,
            }
          : prev
      );
    }

    setActionModal(null);
  };

  const actionTitleMap: Record<ActionValue, string> = {
    "delete-selected": "Delete selected",
    "export-users": "Export users",
    "assign-quota": "Assign quota",
    "restrict-selected": "Restrict selected",
    "unrestrict-selected": "Unrestrict selected",
  };

  return (
    <>
      <Table>
        <TableTop>
          <TableTitleBlock
            title="User Accounts"
            description={
              hasActiveFilters
                ? `Showing ${filteredUsers.length} filtered user${
                    filteredUsers.length === 1 ? "" : "s"
                  }`
                : undefined
            }
          />

          <TableControls>
            <TableSearch
              id="search-users"
              label="Search users"
              value={search}
              onChange={setSearch}
            />

            <Button
              variant="outline"
              iconLeft={<SlidersHorizontal className="h-4 w-4" />}
              className="h-14 px-6 text-base"
              onClick={() => setIsFilterModalOpen(true)}
            >
              Filter
            </Button>

            <Dropdown onValueChange={handleActionChange}>
              <DropdownTrigger className="h-14 min-w-[180px] px-6 text-base">
                Actions
              </DropdownTrigger>

              <DropdownContent align="right" widthClassName="w-[280px]">
                <DropdownItem value="delete-selected" className="py-4 text-lg">
                  Delete selected
                </DropdownItem>

                <DropdownItem value="export-users" className="py-4 text-lg">
                  Export users
                </DropdownItem>

                <DropdownItem value="assign-quota" className="py-4 text-lg">
                  Assign quota
                </DropdownItem>

                <DropdownItem
                  value="restrict-selected"
                  className="py-4 text-lg"
                >
                  Restrict selected
                </DropdownItem>

                <DropdownItem
                  value="unrestrict-selected"
                  className="py-4 text-lg"
                >
                  Unrestrict selected
                </DropdownItem>
              </DropdownContent>
            </Dropdown>
          </TableControls>
        </TableTop>

        <TableMain>
          <TableGrid minWidthClassName="min-w-[1200px]">
            <TableHeader columnsClassName={columnsClassName}>
              <TableCell className="justify-center">
                <TableCheckbox
                  checked={isAllSelected}
                  onToggle={toggleSelectAll}
                />
              </TableCell>

              {userTableColumns.map((column) => (
                <TableHeaderCell
                  key={column.key}
                  label={column.label}
                  sortable={column.sortable}
                  active={sortKey === column.key}
                  direction={sortDir}
                  onClick={() => handleSort(column.key)}
                />
              ))}
            </TableHeader>

            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableEmptyState text="No users found" />
              ) : (
                filteredUsers.map((user) => {
                  const isSelected = selectedIds.includes(user.id);

                  return (
                    <div
                      key={user.id}
                      onClick={() => setOpenUserModal(user)}
                      className={`grid w-full cursor-pointer border-b border-[var(--border)] px-6 py-5 transition last:border-b-0 hover:bg-brand-50/30 ${columnsClassName}`}
                    >
                      <TableCell className="justify-center">
                        <TableCheckbox
                          checked={isSelected}
                          onToggle={() => toggleRowSelection(user.id)}
                        />
                      </TableCell>

                      <TableCell className="text-[32px] font-semibold text-[var(--title)] sm:text-base">
                        {user.username}
                      </TableCell>

                      <TableCell className="paragraph">
                        {user.fullName}
                      </TableCell>

                      <TableCell className="text-[32px] font-semibold text-[var(--title)] sm:text-base">
                        {formatMoney(user.quota)}
                      </TableCell>

                      <TableCell>
                        <RestrictedBadge status={user.restricted} />
                      </TableCell>

                      <TableCell className="text-[32px] font-medium text-[var(--title)] sm:text-base">
                        {user.pages}
                      </TableCell>

                      <TableCell className="text-[32px] font-medium text-[var(--title)] sm:text-base">
                        {user.jobs}
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
        open={Boolean(openUserModal)}
        onClose={() => setOpenUserModal(null)}
      >
        {openUserModal ? (
          <div className="w-[min(92vw,860px)] space-y-6 pr-4">
            <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="title-md">{openUserModal.fullName}</h3>
                <p className="paragraph mt-1">
                  Username:{" "}
                  <span className="font-semibold">
                    {openUserModal.username}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-[var(--muted)]">
                  Status
                </span>

                <div
                  className="inline-flex items-center rounded-full border p-1"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--surface-2)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setEditingRestricted("Unrestricted")}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                      editingRestricted === "Unrestricted" ? "shadow-sm" : ""
                    }`}
                    style={{
                      background:
                        editingRestricted === "Unrestricted"
                          ? "rgba(34, 197, 94, 0.12)"
                          : "transparent",
                      color:
                        editingRestricted === "Unrestricted"
                          ? "var(--color-success-600)"
                          : "var(--muted)",
                    }}
                  >
                    <LockOpen className="h-4 w-4" />
                    Unrestricted
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingRestricted("Restricted")}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                      editingRestricted === "Restricted" ? "shadow-sm" : ""
                    }`}
                    style={{
                      background:
                        editingRestricted === "Restricted"
                          ? "rgba(239, 68, 68, 0.12)"
                          : "transparent",
                      color:
                        editingRestricted === "Restricted"
                          ? "var(--color-danger-500)"
                          : "var(--muted)",
                    }}
                  >
                    <Lock className="h-4 w-4" />
                    Restricted
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <InfoRow
                icon={<Mail className="h-4 w-4" />}
                label="Email"
                value={openUserModal.email}
              />
              <InfoRow
                icon={<Phone className="h-4 w-4" />}
                label="Phone"
                value={openUserModal.phone}
              />
              <InfoRow
                icon={<Shield className="h-4 w-4" />}
                label="Role"
                value={openUserModal.role}
              />
              <InfoRow
                icon={<UserRound className="h-4 w-4" />}
                label="Standing"
                value={openUserModal.standing}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div
                className="rounded-2xl border p-4"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface-2)",
                }}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  Quota
                </p>
                <div className="mt-3">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingQuota}
                    onChange={(e) => setEditingQuota(e.target.value)}
                    placeholder="Enter quota"
                    className="text-lg font-semibold"
                  />
                </div>
              </div>

              <div
                className="rounded-2xl border p-4"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface-2)",
                }}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  Pages
                </p>
                <p className="mt-2 text-2xl font-semibold text-[var(--title)]">
                  {openUserModal.pages}
                </p>
              </div>

              <div
                className="rounded-2xl border p-4"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface-2)",
                }}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  Jobs
                </p>
                <p className="mt-2 text-2xl font-semibold text-[var(--title)]">
                  {openUserModal.jobs}
                </p>
              </div>

              <div
                className="rounded-2xl border p-4"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface-2)",
                }}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  Last Activity
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--title)]">
                  {openUserModal.lastActivity}
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
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Notes
              </p>

              <div className="mt-3">
                <Input
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  placeholder="Add notes about this user"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button className="px-8" onClick={handleSaveUserModal}>
                Save
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
      >
        <div className="w-[min(92vw,900px)] space-y-6 pr-4">
          <div className="flex items-start justify-between gap-4 border-b pb-5">
            <div>
              <h3 className="title-md flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter Users
              </h3>
              <p className="paragraph mt-1">
                Narrow the table by user status, role, department, standing, and
                quota range.
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div
              className="rounded-2xl border p-5"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface-2)",
              }}
            >
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Restricted Status
              </h4>

              <div className="grid gap-3">
                {restrictedOptions.map((status) => (
                  <FilterCheckbox
                    key={status}
                    label={status}
                    checked={filterRestricted.includes(status)}
                    onChange={() =>
                      toggleFromList(
                        status,
                        filterRestricted,
                        setFilterRestricted
                      )
                    }
                  />
                ))}
              </div>
            </div>

            <div
              className="rounded-2xl border p-5"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface-2)",
              }}
            >
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Role
              </h4>

              <div className="grid gap-3 sm:grid-cols-2">
                {roleOptions.map((role) => (
                  <FilterCheckbox
                    key={role}
                    label={role}
                    checked={filterRoles.includes(role)}
                    onChange={() =>
                      toggleFromList(role, filterRoles, setFilterRoles)
                    }
                  />
                ))}
              </div>
            </div>

            <div
              className="rounded-2xl border p-5"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface-2)",
              }}
            >
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Department
              </h4>

              <div className="grid gap-3">
                {departmentOptions.map((department) => (
                  <FilterCheckbox
                    key={department}
                    label={department}
                    checked={filterDepartments.includes(department)}
                    onChange={() =>
                      toggleFromList(
                        department,
                        filterDepartments,
                        setFilterDepartments
                      )
                    }
                  />
                ))}
              </div>
            </div>

            <div
              className="rounded-2xl border p-5"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface-2)",
              }}
            >
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Standing
              </h4>

              <div className="grid gap-3 sm:grid-cols-2">
                {standingOptions.map((standing) => (
                  <FilterCheckbox
                    key={standing}
                    label={standing}
                    checked={filterStandings.includes(standing)}
                    onChange={() =>
                      toggleFromList(
                        standing,
                        filterStandings,
                        setFilterStandings
                      )
                    }
                  />
                ))}
              </div>
            </div>
          </div>

          <div
            className="rounded-2xl border p-5"
            style={{
              borderColor: "var(--border)",
              background: "var(--surface-2)",
            }}
          >
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              Quota Range
            </h4>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="mb-2 text-sm font-medium text-[var(--title)]">
                  Minimum quota
                </p>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={minimumQuota}
                  onChange={(e) => setMinimumQuota(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-[var(--title)]">
                  Maximum quota
                </p>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={maximumQuota}
                  onChange={(e) => setMaximumQuota(e.target.value)}
                  placeholder="500.00"
                />
              </div>
            </div>
          </div>

          <div
            className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="paragraph flex items-center gap-2">
              {hasActiveFilters ? (
                <>
                  <Filter className="h-4 w-4" />
                  Active filters applied
                </>
              ) : (
                <>
                  <SearchX className="h-4 w-4" />
                  No filters applied
                </>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant="outline"
                iconLeft={<RotateCcw className="h-4 w-4" />}
                onClick={resetFilters}
              >
                Reset
              </Button>

              <Button onClick={() => setIsFilterModalOpen(false)}>
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal open={Boolean(actionModal)} onClose={() => setActionModal(null)}>
        {actionModal === "delete-selected" ? (
          <div className="w-[min(92vw,760px)] space-y-5 pr-4">
            <div
              className="border-b pb-4"
              style={{ borderColor: "var(--border)" }}
            >
              <h3 className="title-md flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-500" />
                Delete selected users
              </h3>
              <p className="paragraph mt-2">
                This action will remove the selected users from the table.
                Review the list below and remove any row you do not want to
                delete.
              </p>
              <p className="paragraph mt-2">
                Total selected:{" "}
                <span className="font-semibold">{selectedUsers.length}</span>
              </p>
            </div>

            <div
              className="max-h-[320px] space-y-3 overflow-y-auto pr-2"
              style={{ scrollbarWidth: "thin" }}
            >
              {selectedUsers.length === 0 ? (
                <div
                  className="rounded-2xl border p-5 text-sm"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--surface-2)",
                    color: "var(--muted)",
                  }}
                >
                  No users selected.
                </div>
              ) : (
                selectedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border p-4"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--surface-2)",
                    }}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[var(--title)]">
                        {user.fullName}
                      </p>
                      <p className="truncate text-sm text-[var(--muted)]">
                        {user.username} • {user.email}
                      </p>
                    </div>

                    <ExpandedButton
                      id={`remove-delete-${user.id}`}
                      label="Remove"
                      icon={Trash2}
                      variant="danger"
                      onClick={() => removeSelectedUserFromAction(user.id)}
                    />
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setActionModal(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleDeleteSelected}
                className="px-8"
                disabled={selectedUsers.length === 0}
              >
                Delete
              </Button>
            </div>
          </div>
        ) : null}

        {actionModal === "export-users" ? (
          <div className="w-[min(92vw,760px)] space-y-5 pr-4">
            <div
              className="border-b pb-4"
              style={{ borderColor: "var(--border)" }}
            >
              <h3 className="title-md flex items-center gap-2">
                <FileOutput className="h-5 w-5 text-brand-500" />
                Export selected users
              </h3>
              <p className="paragraph mt-2">
                Review the users to export, remove any row if needed, then
                choose the export format.
              </p>
              <p className="paragraph mt-2">
                Total selected:{" "}
                <span className="font-semibold">{selectedUsers.length}</span>
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
              <div
                className="max-h-[320px] space-y-3 overflow-y-auto pr-2"
                style={{ scrollbarWidth: "thin" }}
              >
                {selectedUsers.length === 0 ? (
                  <div
                    className="rounded-2xl border p-5 text-sm"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--surface-2)",
                      color: "var(--muted)",
                    }}
                  >
                    No users selected.
                  </div>
                ) : (
                  selectedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between gap-4 rounded-2xl border p-4"
                      style={{
                        borderColor: "var(--border)",
                        background: "var(--surface-2)",
                      }}
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[var(--title)]">
                          {user.fullName}
                        </p>
                        <p className="truncate text-sm text-[var(--muted)]">
                          {user.username} • {user.department}
                        </p>
                      </div>

                      <ExpandedButton
                        id={`remove-export-${user.id}`}
                        label="Remove"
                        icon={Trash2}
                        variant="danger"
                        onClick={() => removeSelectedUserFromAction(user.id)}
                      />
                    </div>
                  ))
                )}
              </div>

              <div
                className="rounded-2xl border p-4"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface-2)",
                }}
              >
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  Export Method
                </p>

                <Dropdown
                  value={exportMethod}
                  onValueChange={(value) =>
                    setExportMethod(value as ExportMethod)
                  }
                  fullWidth
                >
                  <DropdownTrigger className="h-12 w-full">
                    {exportMethod}
                  </DropdownTrigger>

                  <DropdownContent widthClassName="w-full">
                    <DropdownItem value="PDF">PDF</DropdownItem>
                    <DropdownItem value="Excel">Excel</DropdownItem>
                    <DropdownItem value="CSV">CSV</DropdownItem>
                  </DropdownContent>
                </Dropdown>

                <p className="mt-4 text-sm text-[var(--muted)]">
                  Selected format:{" "}
                  <span className="font-semibold text-[var(--title)]">
                    {exportMethod}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setActionModal(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => setActionModal(null)}
                className="px-8"
                disabled={selectedUsers.length === 0}
              >
                Export
              </Button>
            </div>
          </div>
        ) : null}

        {actionModal === "assign-quota" ? (
          <div className="w-[min(92vw,760px)] space-y-5 pr-4">
            <div
              className="border-b pb-4"
              style={{ borderColor: "var(--border)" }}
            >
              <h3 className="title-md flex items-center gap-2">
                <Wallet className="h-5 w-5 text-brand-500" />
                Assign quota
              </h3>
              <p className="paragraph mt-2">
                Set a new quota value for the selected users. You can also leave
                a short note for this update.
              </p>
              <p className="paragraph mt-2">
                Total selected:{" "}
                <span className="font-semibold">{selectedUsers.length}</span>
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
              <div
                className="max-h-[320px] space-y-3 overflow-y-auto pr-2"
                style={{ scrollbarWidth: "thin" }}
              >
                {selectedUsers.length === 0 ? (
                  <div
                    className="rounded-2xl border p-5 text-sm"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--surface-2)",
                      color: "var(--muted)",
                    }}
                  >
                    No users selected.
                  </div>
                ) : (
                  selectedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between gap-4 rounded-2xl border p-4"
                      style={{
                        borderColor: "var(--border)",
                        background: "var(--surface-2)",
                      }}
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[var(--title)]">
                          {user.fullName}
                        </p>
                        <p className="truncate text-sm text-[var(--muted)]">
                          Current quota: {formatMoney(user.quota)}
                        </p>
                      </div>

                      <ExpandedButton
                        id={`remove-quota-${user.id}`}
                        label="Remove"
                        icon={Trash2}
                        variant="danger"
                        onClick={() => removeSelectedUserFromAction(user.id)}
                      />
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-4">
                <div
                  className="rounded-2xl border p-4"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--surface-2)",
                  }}
                >
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                    New Quota
                  </p>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={quotaToAssign}
                    onChange={(e) => setQuotaToAssign(e.target.value)}
                    placeholder="Enter new quota"
                  />
                </div>

                <div
                  className="rounded-2xl border p-4"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--surface-2)",
                  }}
                >
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                    Comment
                  </p>
                  <Input
                    value={quotaComment}
                    onChange={(e) => setQuotaComment(e.target.value)}
                    placeholder="Optional note for this quota update"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setActionModal(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleAssignQuota}
                className="px-8"
                disabled={
                  selectedUsers.length === 0 ||
                  quotaToAssign.trim() === "" ||
                  Number.isNaN(Number(quotaToAssign))
                }
              >
                Assign Quota
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
};

export default UserAccountsTable;
