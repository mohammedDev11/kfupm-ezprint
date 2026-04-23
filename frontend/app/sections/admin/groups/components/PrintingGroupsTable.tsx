"use client";

import { Plus, RefreshCw, Trash2 } from "lucide-react";
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
import Input from "@/components/ui/input/Input";
import Modal from "@/components/ui/modal/Modal";
import { exportTableData, TableExportFormat } from "@/lib/export";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/services/api";

type SortDir = "asc" | "desc";
type GroupSortKey = "name" | "members" | "initialQuota" | "restricted" | "schedule";

type GroupSummary = {
  total: number;
  restricted: number;
  selectedByDefault: number;
  totalMembers: number;
};

type GroupItem = {
  id: string;
  name: string;
  members: number;
  initialQuota: number;
  restricted: "Restricted" | "Unrestricted";
  scheduleAmount: number;
  period: string;
  notes: string;
  selectedByDefault?: boolean;
};

type GroupsResponse = {
  summary: GroupSummary;
  groups: GroupItem[];
};

type GroupDetailResponse = {
  group: GroupItem & {
    description: string;
    groupType: string;
    resetPeriod: string;
    perUserAllocation: number;
    enabled: boolean;
    requiresApproval: boolean;
    canUpload: boolean;
    canRelease: boolean;
    costLimit: number;
    memberUserIds: string[];
    membersList: Array<{
      id: string;
      fullName: string;
      username: string;
      email: string;
      department: string;
      userType: string;
    }>;
    allowedQueues: Array<{
      id: string;
      name: string;
      description: string;
    }>;
  };
};

type GroupFormState = {
  name: string;
  description: string;
  initialQuota: string;
  scheduleAmount: string;
  resetPeriod: string;
  restricted: boolean;
};

const emptyForm: GroupFormState = {
  name: "",
  description: "",
  initialQuota: "0",
  scheduleAmount: "0",
  resetPeriod: "None",
  restricted: false,
};

const columnsClassName =
  "[grid-template-columns:72px_minmax(240px,1.4fr)_minmax(120px,0.7fr)_minmax(160px,0.8fr)_minmax(150px,0.8fr)_minmax(180px,0.9fr)_minmax(170px,0.9fr)]";

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

const formatMoney = (value: number) => `${value.toFixed(2)} SAR`;

const restrictedRank: Record<GroupItem["restricted"], number> = {
  Restricted: 1,
  Unrestricted: 0,
};

const compareValues = (a: string | number, b: string | number, direction: SortDir) => {
  if (typeof a === "number" && typeof b === "number") {
    return direction === "asc" ? a - b : b - a;
  }

  return direction === "asc"
    ? String(a).localeCompare(String(b))
    : String(b).localeCompare(String(a));
};

export default function PrintingGroupsTable() {
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [summary, setSummary] = useState<GroupSummary>({
    total: 0,
    restricted: 0,
    selectedByDefault: 0,
    totalMembers: 0,
  });
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<GroupSortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [detailsGroup, setDetailsGroup] =
    useState<GroupDetailResponse["group"] | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<GroupFormState>(emptyForm);

  const loadGroups = async (showSpinner = false) => {
    if (showSpinner) {
      setLoading(true);
    }

    try {
      const data = await apiGet<GroupsResponse>("/admin/groups", "admin");
      const nextGroups = Array.isArray(data?.groups) ? data.groups : [];

      setGroups(nextGroups);
      setSummary(
        data.summary || {
          total: 0,
          restricted: 0,
          selectedByDefault: 0,
          totalMembers: 0,
        },
      );
      setSelectedIds((current) =>
        current.filter((id) => nextGroups.some((group) => group.id === id)),
      );
      setError("");
    } catch (requestError) {
      setGroups([]);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load groups.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadGroups(true);
  }, []);

  const handleSort = (key: GroupSortKey) => {
    if (sortKey === key) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDir(key === "name" || key === "restricted" ? "asc" : "desc");
  };

  const filteredGroups = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return [...groups]
      .filter((group) => {
        if (!searchTerm) {
          return true;
        }

        return [group.name, group.period, group.notes, group.restricted]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(searchTerm);
      })
      .sort((a, b) => {
        switch (sortKey) {
          case "members":
            return compareValues(a.members, b.members, sortDir);
          case "initialQuota":
            return compareValues(a.initialQuota, b.initialQuota, sortDir);
          case "restricted":
            return compareValues(
              restrictedRank[a.restricted],
              restrictedRank[b.restricted],
              sortDir,
            );
          case "schedule":
            return compareValues(a.scheduleAmount, b.scheduleAmount, sortDir);
          case "name":
          default:
            return compareValues(a.name, b.name, sortDir);
        }
      });
  }, [groups, search, sortDir, sortKey]);

  const visibleIds = filteredGroups.map((group) => group.id);
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
      await loadGroups(false);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Group action failed.",
      );
    } finally {
      setBusy(false);
    }
  };

  const openCreateForm = () => {
    setEditingGroupId(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  const openEditForm = async (groupId: string) => {
    setBusy(true);
    setError("");

    try {
      const data = await apiGet<GroupDetailResponse>(`/admin/groups/${groupId}`, "admin");
      const group = data.group;
      setEditingGroupId(group.id);
      setForm({
        name: group.name,
        description: group.description || "",
        initialQuota: String(group.initialQuota || 0),
        scheduleAmount: String(group.scheduleAmount || 0),
        resetPeriod: group.resetPeriod || group.period || "None",
        restricted: group.restricted === "Restricted",
      });
      setIsFormOpen(true);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load group details.",
      );
    } finally {
      setBusy(false);
    }
  };

  const openDetails = async (groupId: string) => {
    setBusy(true);
    setError("");

    try {
      const data = await apiGet<GroupDetailResponse>(`/admin/groups/${groupId}`, "admin");
      setDetailsGroup(data.group);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load group details.",
      );
    } finally {
      setBusy(false);
    }
  };

  const submitForm = async () => {
    const payload = {
      name: form.name,
      description: form.description,
      initialQuota: Number(form.initialQuota || 0),
      scheduleAmount: Number(form.scheduleAmount || 0),
      resetPeriod: form.resetPeriod || "None",
      restricted: form.restricted,
      groupType: "Custom",
      memberUserIds: [],
      allowedQueueIds: [],
    };

    await runAction(async () => {
      if (editingGroupId) {
        await apiPatch(`/admin/groups/${editingGroupId}`, payload, "admin");
      } else {
        await apiPost("/admin/groups", payload, "admin");
      }

      setIsFormOpen(false);
      setForm(emptyForm);
      setEditingGroupId(null);
    });
  };

  const exportGroups = (format: TableExportFormat) => {
    const rows =
      selectedIds.length > 0
        ? filteredGroups.filter((group) => selectedIds.includes(group.id))
        : filteredGroups;

    exportTableData({
      title: "Printing Groups",
      filename: "alpha-queue-groups",
      format,
      columns: [
        { label: "Group", value: (row: GroupItem) => row.name },
        { label: "Members", value: (row) => row.members },
        { label: "Initial Quota", value: (row) => formatMoney(row.initialQuota) },
        { label: "Restricted", value: (row) => row.restricted },
        {
          label: "Schedule",
          value: (row) => `${formatMoney(row.scheduleAmount)} / ${row.period}`,
        },
        { label: "Notes", value: (row) => row.notes || "" },
      ],
      rows,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Groups" value={summary.total} helper="Group records in MongoDB" />
        <SummaryCard label="Restricted" value={summary.restricted} helper="Printing-restricted groups" />
        <SummaryCard label="Default" value={summary.selectedByDefault} helper="Selected by default in access rules" />
        <SummaryCard label="Members" value={summary.totalMembers} helper="Total members across groups" />
      </div>

      <Table>
        <TableTop>
          <TableTitleBlock
            title="Printing Groups"
            description={`Showing ${filteredGroups.length} group${filteredGroups.length === 1 ? "" : "s"} from the live backend module.`}
          />

          <TableControls>
            <TableSearch
              id="search-groups"
              label="Search groups"
              value={search}
              onChange={setSearch}
            />

            <Button
              variant="secondary"
              iconLeft={<RefreshCw className="h-4 w-4" />}
              className="h-14 px-6 text-base"
              disabled={busy}
              onClick={() => loadGroups(false)}
            >
              Refresh
            </Button>

            <TableExportDropdown
              disabled={filteredGroups.length === 0}
              onExport={exportGroups}
            />

            <Button
              variant="primary"
              iconLeft={<Plus className="h-4 w-4" />}
              className="h-14 px-6 text-base"
              disabled={busy}
              onClick={openCreateForm}
            >
              Add Group
            </Button>

            <Button
              variant="outline"
              iconLeft={<Trash2 className="h-4 w-4" />}
              className="h-14 px-6 text-base"
              disabled={busy || selectedIds.length === 0}
              onClick={() =>
                runAction(async () => {
                  await Promise.all(
                    selectedIds.map((id) => apiDelete(`/admin/groups/${id}`, "admin")),
                  );
                  setSelectedIds([]);
                })
              }
            >
              Delete Selected
            </Button>
          </TableControls>
        </TableTop>

        {error ? (
          <div className="px-6 pb-2">
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          </div>
        ) : null}

        <TableMain>
          <TableGrid minWidthClassName="min-w-[1120px]">
            <TableHeader columnsClassName={columnsClassName}>
              <TableCell className="justify-center">
                <TableCheckbox
                  checked={allVisibleSelected}
                  onToggle={toggleSelectAllVisible}
                />
              </TableCell>
              <TableHeaderCell
                label="Group"
                sortable
                active={sortKey === "name"}
                direction={sortDir}
                onClick={() => handleSort("name")}
              />
              <TableHeaderCell
                label="Members"
                sortable
                active={sortKey === "members"}
                direction={sortDir}
                onClick={() => handleSort("members")}
              />
              <TableHeaderCell
                label="Initial Quota"
                sortable
                active={sortKey === "initialQuota"}
                direction={sortDir}
                onClick={() => handleSort("initialQuota")}
              />
              <TableHeaderCell
                label="Restricted"
                sortable
                active={sortKey === "restricted"}
                direction={sortDir}
                onClick={() => handleSort("restricted")}
              />
              <TableHeaderCell
                label="Schedule"
                sortable
                active={sortKey === "schedule"}
                direction={sortDir}
                onClick={() => handleSort("schedule")}
              />
              <TableHeaderCell label="Actions" />
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableEmptyState text="Loading groups..." />
              ) : filteredGroups.length === 0 ? (
                <TableEmptyState text="No groups matched the current search." />
              ) : (
                filteredGroups.map((group) => (
                  <div
                    key={group.id}
                    onClick={() => openDetails(group.id)}
                    className={`grid w-full cursor-pointer border-b border-[var(--border)] px-6 py-5 transition last:border-b-0 hover:bg-brand-50/30 ${columnsClassName}`}
                  >
                    <TableCell className="justify-center">
                      <TableCheckbox
                        checked={selectedIds.includes(group.id)}
                        onToggle={() => toggleSelectedId(group.id)}
                      />
                    </TableCell>

                    <TableCell className="flex-col items-start">
                      <p className="font-semibold text-[var(--title)]">{group.name}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {group.notes || "No notes"}
                      </p>
                    </TableCell>

                    <TableCell className="text-[var(--title)]">{group.members}</TableCell>

                    <TableCell className="text-[var(--title)]">
                      {formatMoney(group.initialQuota)}
                    </TableCell>

                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          group.restricted === "Restricted"
                            ? "bg-red-100 text-red-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {group.restricted}
                      </span>
                    </TableCell>

                    <TableCell className="text-[var(--title)]">
                      {formatMoney(group.scheduleAmount)} / {group.period}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={busy}
                          onClick={(event) => {
                            event.stopPropagation();
                            void openEditForm(group.id);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={busy}
                          onClick={(event) => {
                            event.stopPropagation();
                            void runAction(async () => {
                              await apiDelete(`/admin/groups/${group.id}`, "admin");
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

      <Modal open={isFormOpen} onClose={() => setIsFormOpen(false)}>
        <div className="space-y-4 pr-8">
          <div>
            <h3 className="title-md">
              {editingGroupId ? "Edit Group" : "Create Group"}
            </h3>
            <p className="paragraph mt-1">
              This form is wired to the live groups module and stores directly in
              MongoDB.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-[var(--muted)]">Name</label>
              <Input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="Group name"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-[var(--muted)]">
                Description
              </label>
              <Input
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="Optional group description"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--muted)]">
                Initial Quota
              </label>
              <Input
                type="number"
                min="0"
                value={form.initialQuota}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    initialQuota: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--muted)]">
                Scheduled Quota
              </label>
              <Input
                type="number"
                min="0"
                value={form.scheduleAmount}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    scheduleAmount: event.target.value,
                  }))
                }
              />
            </div>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-[var(--muted)]">
                Reset Period
              </span>
              <select
                value={form.resetPeriod}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    resetPeriod: event.target.value,
                  }))
                }
                className="h-12 rounded-md border px-4 text-sm outline-none"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface)",
                  color: "var(--title)",
                }}
              >
                {["None", "Monthly", "Semester", "Annual"].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label
              className="flex items-center gap-3 rounded-md border px-4 py-3"
              style={{ borderColor: "var(--border)" }}
            >
              <input
                type="checkbox"
                checked={form.restricted}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    restricted: event.target.checked,
                  }))
                }
              />
              <span className="text-sm font-medium text-[var(--title)]">
                Restrict printing for this group
              </span>
            </label>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              disabled={busy || !form.name.trim()}
              onClick={submitForm}
            >
              {editingGroupId ? "Save Changes" : "Create Group"}
            </Button>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => setIsFormOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={Boolean(detailsGroup)} onClose={() => setDetailsGroup(null)}>
        <div className="space-y-4 pr-8">
          <div>
            <h3 className="title-md">{detailsGroup?.name}</h3>
            <p className="paragraph mt-1">
              Real group details returned by the backend module.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {[
              ["Description", detailsGroup?.description || "No description"],
              ["Type", detailsGroup?.groupType || "Custom"],
              ["Members", detailsGroup?.members ?? 0],
              ["Initial Quota", detailsGroup ? formatMoney(detailsGroup.initialQuota) : "0 SAR"],
              [
                "Scheduled Amount",
                detailsGroup ? formatMoney(detailsGroup.scheduleAmount) : "0 SAR",
              ],
              ["Reset Period", detailsGroup?.resetPeriod || "None"],
              ["Restricted", detailsGroup?.restricted || "Unrestricted"],
              [
                "Cost Limit",
                detailsGroup ? formatMoney(detailsGroup.costLimit || 0) : "0 SAR",
              ],
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
                  {String(value)}
                </p>
              </div>
            ))}
          </div>

          <div
            className="rounded-2xl border p-4"
            style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
          >
            <p className="text-sm font-semibold text-[var(--title)]">
              Allowed Queues
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {detailsGroup?.allowedQueues?.length ? (
                detailsGroup.allowedQueues.map((queue) => (
                  <span
                    key={queue.id}
                    className="inline-flex rounded-full border px-3 py-1 text-xs font-semibold text-[var(--title)]"
                    style={{ borderColor: "var(--border)" }}
                  >
                    {queue.name}
                  </span>
                ))
              ) : (
                <span className="text-sm text-[var(--muted)]">
                  No queue restrictions configured.
                </span>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
