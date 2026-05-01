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
import StatusBadge, { type StatusTone } from "@/components/ui/badge/StatusBadge";
import Button from "@/components/ui/button/Button";
import RefreshButton from "@/components/ui/button/RefreshButton";
import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/ui/dropdown/Dropdown";
import ListBox, { type ListBoxOption } from "@/components/ui/listbox/ListBox";
import Modal from "@/components/ui/modal/Modal";
import { exportTableData, type TableExportFormat } from "@/lib/export";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/services/api";
import {
  Ban,
  Check,
  ClipboardList,
  Copy,
  Gift,
  Maximize2,
  Minimize2,
  Plus,
  ShieldCheck,
  SlidersHorizontal,
  TicketCheck,
  Trash2,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

type RedeemCodeStatus = "unused" | "redeemed" | "expired" | "disabled";
type SortDir = "asc" | "desc";
type SortKey =
  | "code"
  | "quotaAmount"
  | "status"
  | "createdBy"
  | "redeemedBy"
  | "redeemedAt"
  | "expiresAt"
  | "note";
type BulkAction = "disable" | "delete";

type UserSummary = {
  id: string;
  username: string;
  fullName: string;
  email: string;
};

type RedeemCodeItem = {
  id: string;
  code: string;
  quotaAmount: number;
  status: RedeemCodeStatus;
  createdBy: UserSummary | null;
  redeemedBy: UserSummary | null;
  redeemedAt: string | null;
  redeemedAtLabel: string;
  expiresAt: string | null;
  expiresAtLabel: string;
  note: string;
  createdAt: string;
  createdAtLabel: string;
};

type RedeemCodesResponse = {
  summary: {
    total: number;
    unused: number;
    redeemed: number;
    expired: number;
    disabled: number;
  };
  codes: RedeemCodeItem[];
};

type GenerateCodesResponse = {
  generatedCodes: string[];
  codes: RedeemCodeItem[];
};

const columnsClassName =
  "[grid-template-columns:72px_minmax(190px,1fr)_minmax(110px,0.55fr)_minmax(130px,0.7fr)_minmax(190px,1fr)_minmax(190px,1fr)_minmax(170px,0.9fr)_minmax(170px,0.9fr)_minmax(240px,1.2fr)]";

const statusOptions: ListBoxOption[] = [
  { value: "all", label: "All statuses" },
  { value: "unused", label: "Unused" },
  { value: "redeemed", label: "Redeemed" },
  { value: "expired", label: "Expired" },
  { value: "disabled", label: "Disabled" },
];

const actionOptions: ListBoxOption[] = [
  { value: "disable", label: "Disable selected" },
  { value: "delete", label: "Delete selected" },
];

const emptySummary: RedeemCodesResponse["summary"] = {
  total: 0,
  unused: 0,
  redeemed: 0,
  expired: 0,
  disabled: 0,
};

const formatQuota = (value: number) => Number(value || 0).toFixed(2);
const formatCode = (code: string) =>
  code.length <= 6 ? code : code.replace(/(.{4})/g, "$1 ").trim();
const getExportTimestamp = () =>
  new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");

const compareValues = (a: string | number, b: string | number, direction: SortDir) => {
  if (typeof a === "number" && typeof b === "number") {
    return direction === "asc" ? a - b : b - a;
  }

  return direction === "asc"
    ? String(a).localeCompare(String(b))
    : String(b).localeCompare(String(a));
};

const dateValue = (value: string | null) => {
  if (!value) return 0;

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const getPersonLabel = (person: UserSummary | null) => {
  if (!person) return "System";

  return person.fullName || person.username || person.email || "User";
};

const getStatusTone = (status: RedeemCodeStatus): StatusTone => {
  switch (status) {
    case "unused":
      return "success";
    case "redeemed":
      return "inactive";
    case "expired":
      return "warning";
    case "disabled":
    default:
      return "danger";
  }
};

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
      {children}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  type = "text",
  min,
  max,
  step,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  type?: string;
  min?: string;
  max?: string;
  step?: string;
  placeholder?: string;
}) {
  return (
    <input
      type={type}
      min={min}
      max={max}
      step={step}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className="h-12 w-full rounded-md border px-4 text-sm font-medium outline-none transition focus:border-[var(--color-brand-500)] focus:ring-4 focus:ring-[rgba(var(--brand-rgb),0.14)]"
      style={{
        borderColor: "var(--border)",
        background: "var(--surface)",
        color: "var(--title)",
      }}
    />
  );
}

export default function RedeemCodesTable() {
  const [codes, setCodes] = useState<RedeemCodeItem[]>([]);
  const [summary, setSummary] =
    useState<RedeemCodesResponse["summary"]>(emptySummary);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("code");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [quotaAmount, setQuotaAmount] = useState("10");
  const [expiresAt, setExpiresAt] = useState("");
  const [note, setNote] = useState("");
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  const [copiedCodeId, setCopiedCodeId] = useState("");
  const [copiedGenerated, setCopiedGenerated] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [generateBusy, setGenerateBusy] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportMethod, setExportMethod] = useState<TableExportFormat>("PDF");

  const loadCodes = async (showSpinner = false) => {
    if (showSpinner) {
      setLoading(true);
    }

    try {
      const data = await apiGet<RedeemCodesResponse>(
        "/admin/redeem-codes",
        "admin",
      );
      const nextCodes = Array.isArray(data?.codes) ? data.codes : [];
      setCodes(nextCodes);
      setSummary(data?.summary || emptySummary);
      setSelectedIds((current) =>
        current.filter((id) => nextCodes.some((code) => code.id === id)),
      );
      setError("");
    } catch (requestError) {
      setCodes([]);
      setSummary(emptySummary);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load redeem codes.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      void loadCodes(true);
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, []);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDir(
      key === "quotaAmount" || key === "redeemedAt" || key === "expiresAt"
        ? "desc"
        : "asc",
    );
  };

  const filteredCodes = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return [...codes]
      .filter((code) => {
        const matchesSearch =
          !searchTerm ||
          [
            code.code,
            code.note,
            getPersonLabel(code.createdBy),
            getPersonLabel(code.redeemedBy),
            code.status,
          ]
            .join(" ")
            .toLowerCase()
            .includes(searchTerm);

        const matchesStatus =
          statusFilter === "all" || code.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        switch (sortKey) {
          case "quotaAmount":
            return compareValues(a.quotaAmount, b.quotaAmount, sortDir);
          case "createdBy":
            return compareValues(
              getPersonLabel(a.createdBy),
              getPersonLabel(b.createdBy),
              sortDir,
            );
          case "redeemedBy":
            return compareValues(
              getPersonLabel(a.redeemedBy),
              getPersonLabel(b.redeemedBy),
              sortDir,
            );
          case "redeemedAt":
            return compareValues(dateValue(a.redeemedAt), dateValue(b.redeemedAt), sortDir);
          case "expiresAt":
            return compareValues(dateValue(a.expiresAt), dateValue(b.expiresAt), sortDir);
          case "note":
            return compareValues(a.note, b.note, sortDir);
          case "status":
            return compareValues(a.status, b.status, sortDir);
          case "code":
          default:
            return compareValues(a.code, b.code, sortDir);
        }
      });
  }, [codes, search, sortDir, sortKey, statusFilter]);

  const visibleIds = filteredCodes.map((code) => code.id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
  const selectedCodes = useMemo(
    () => codes.filter((code) => selectedIds.includes(code.id)),
    [codes, selectedIds],
  );
  const activeFilterCount = statusFilter !== "all" ? 1 : 0;

  const kpiCards = [
    {
      title: "Total Codes",
      value: summary.total.toLocaleString(),
      helper: "All generated voucher codes",
      icon: <TicketCheck className="h-4 w-4" />,
    },
    {
      title: "Unused",
      value: summary.unused.toLocaleString(),
      helper: "Available for redemption",
      icon: <ShieldCheck className="h-4 w-4" />,
    },
    {
      title: "Redeemed",
      value: summary.redeemed.toLocaleString(),
      helper: "Already claimed by users",
      icon: <Gift className="h-4 w-4" />,
    },
    {
      title: "Expired/Disabled",
      value: (summary.expired + summary.disabled).toLocaleString(),
      helper: "No longer redeemable",
      icon: <Ban className="h-4 w-4" />,
    },
  ];

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

  const copyText = async (value: string, id: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedCodeId(id);
      window.setTimeout(() => setCopiedCodeId(""), 1400);
    } catch {
      setCopiedCodeId("");
    }
  };

  const copyGeneratedCodes = async () => {
    if (generatedCodes.length === 0) return;

    try {
      await navigator.clipboard.writeText(generatedCodes.join("\n"));
      setCopiedGenerated(true);
      window.setTimeout(() => setCopiedGenerated(false), 1400);
    } catch {
      setCopiedGenerated(false);
    }
  };

  const runBulkAction = async (action: BulkAction) => {
    if (selectedIds.length === 0) return;

    const confirmed = window.confirm(
      action === "disable"
        ? `Disable ${selectedIds.length} selected code${selectedIds.length === 1 ? "" : "s"}? Redeemed codes will be skipped.`
        : `Delete ${selectedIds.length} selected code${selectedIds.length === 1 ? "" : "s"}?`,
    );

    if (!confirmed) return;

    setBusy(true);
    setError("");

    try {
      if (action === "disable") {
        await apiPatch("/admin/redeem-codes/bulk/disable", { ids: selectedIds }, "admin");
      } else {
        await apiPost("/admin/redeem-codes/bulk/delete", { ids: selectedIds }, "admin");
      }

      setSelectedIds([]);
      await loadCodes(false);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Redeem code action failed.",
      );
    } finally {
      setBusy(false);
    }
  };

  const disableSingleCode = async (code: RedeemCodeItem) => {
    setBusy(true);
    setError("");

    try {
      await apiPatch(`/admin/redeem-codes/${code.id}/disable`, {}, "admin");
      await loadCodes(false);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to disable redeem code.",
      );
    } finally {
      setBusy(false);
    }
  };

  const deleteSingleCode = async (code: RedeemCodeItem) => {
    const confirmed = window.confirm(`Delete redeem code ${formatCode(code.code)}?`);

    if (!confirmed) return;

    setBusy(true);
    setError("");

    try {
      await apiDelete(`/admin/redeem-codes/${code.id}`, "admin");
      setSelectedIds((current) => current.filter((id) => id !== code.id));
      await loadCodes(false);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to delete redeem code.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleGenerate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGenerateBusy(true);
    setGenerateError("");

    try {
      const expiryIso = expiresAt ? `${expiresAt}T23:59:59.000` : "";
      const data = await apiPost<GenerateCodesResponse>(
        "/admin/redeem-codes/generate",
        {
          quotaAmount: Number(quotaAmount),
          count: 1,
          numberOfCodes: 1,
          expiresAt: expiryIso,
          note,
        },
        "admin",
      );

      setGeneratedCodes(Array.isArray(data?.generatedCodes) ? data.generatedCodes : []);
      await loadCodes(false);
    } catch (requestError) {
      setGenerateError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to generate redeem codes.",
      );
    } finally {
      setGenerateBusy(false);
    }
  };

  const exportCodes = (format: TableExportFormat) => {
    if (selectedCodes.length === 0) return;

    exportTableData({
      title: "Redeem Codes",
      filename: `redeem-codes-export-${getExportTimestamp()}`,
      format,
      columns: [
        { label: "Code", value: (row: RedeemCodeItem) => formatCode(row.code) },
        { label: "Quota", value: (row) => formatQuota(row.quotaAmount) },
        { label: "Status", value: (row) => row.status },
        { label: "Created By", value: (row) => getPersonLabel(row.createdBy) },
        { label: "Redeemed By", value: (row) => getPersonLabel(row.redeemedBy) },
        { label: "Redeemed Date", value: (row) => row.redeemedAtLabel },
        { label: "Expiry Date", value: (row) => row.expiresAtLabel || "No expiry" },
        { label: "Note", value: (row) => row.note },
      ],
      rows: selectedCodes,
    });
  };

  const handleExportChange = (format: TableExportFormat) => {
    setExportMethod(format);
    setIsExportModalOpen(true);
  };

  const renderTable = (expanded = false) => (
    <Table
      className={`flex min-h-[560px] flex-col ${
        expanded ? "h-dvh !rounded-none" : "max-h-[calc(100vh-20rem)]"
      }`}
    >
      <TableTop
        className={`shrink-0 ${expanded ? "bg-[var(--surface)]" : ""}`}
      >
        <TableTitleBlock title="Redeem Codes" />

        <TableControls>
          <TableSearch
            id={expanded ? "search-redeem-codes-expanded" : "search-redeem-codes"}
            label="Search codes"
            value={search}
            onChange={setSearch}
          />

          <RefreshButton
            className="h-14"
            disabled={busy}
            onClick={() => loadCodes(false)}
          />

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

            <DropdownContent align="right" widthClassName="w-[240px]">
              <div className="space-y-4 p-2">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                    Status
                  </p>
                  <ListBox
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                    options={statusOptions}
                    triggerClassName="h-11 px-3"
                    maxHeightClassName="max-h-52"
                    ariaLabel="Filter by redeem code status"
                  />
                </div>

                {activeFilterCount > 0 ? (
                  <Button
                    variant="outline"
                    className="h-11 w-full text-sm"
                    onClick={() => {
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

          <ListBox
            value=""
            onValueChange={(value) => void runBulkAction(value as BulkAction)}
            options={actionOptions}
            placeholder={
              <span className="inline-flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                Actions
              </span>
            }
            disabled={selectedIds.length === 0 || busy}
            className="w-full md:w-[180px]"
            triggerClassName="h-14 px-5"
            align="right"
            ariaLabel="Redeem code bulk actions"
          />

          <Button
            className="h-14 px-5 text-base"
            iconLeft={<Plus className="relative z-10 h-4 w-4" />}
            onClick={() => {
              setIsGenerateOpen(true);
              setGeneratedCodes([]);
              setGenerateError("");
            }}
          >
            Generate Code
          </Button>

          <button
            type="button"
            onClick={() => setIsTableExpanded(!expanded)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-transparent text-[var(--muted)] transition hover:text-[var(--color-brand-500)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(var(--brand-rgb),0.16)]"
            aria-label={
              expanded ? "Collapse redeem codes table" : "Expand redeem codes table"
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
        <TableGrid minWidthClassName="flex h-full min-w-[1500px] flex-col">
          <TableHeader columnsClassName={columnsClassName}>
            <TableCell className="justify-center">
              <TableCheckbox
                checked={allVisibleSelected}
                onToggle={toggleSelectAllVisible}
              />
            </TableCell>
            <TableHeaderCell
              label="Code"
              sortable
              active={sortKey === "code"}
              direction={sortDir}
              onClick={() => handleSort("code")}
            />
            <TableHeaderCell
              label="Quota"
              sortable
              active={sortKey === "quotaAmount"}
              direction={sortDir}
              onClick={() => handleSort("quotaAmount")}
            />
            <TableHeaderCell
              label="Status"
              sortable
              active={sortKey === "status"}
              direction={sortDir}
              onClick={() => handleSort("status")}
            />
            <TableHeaderCell
              label="Created By"
              sortable
              active={sortKey === "createdBy"}
              direction={sortDir}
              onClick={() => handleSort("createdBy")}
            />
            <TableHeaderCell
              label="Redeemed By"
              sortable
              active={sortKey === "redeemedBy"}
              direction={sortDir}
              onClick={() => handleSort("redeemedBy")}
            />
            <TableHeaderCell
              label="Redeemed Date"
              sortable
              active={sortKey === "redeemedAt"}
              direction={sortDir}
              onClick={() => handleSort("redeemedAt")}
            />
            <TableHeaderCell
              label="Expiry Date"
              sortable
              active={sortKey === "expiresAt"}
              direction={sortDir}
              onClick={() => handleSort("expiresAt")}
            />
            <TableHeaderCell
              label="Note"
              sortable
              active={sortKey === "note"}
              direction={sortDir}
              onClick={() => handleSort("note")}
            />
          </TableHeader>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <TableBody>
              {loading ? (
                <TableEmptyState text="Loading redeem codes..." />
              ) : filteredCodes.length === 0 ? (
                <TableEmptyState text="No redeem codes found." />
              ) : (
                filteredCodes.map((code) => {
                  const isSelected = selectedIds.includes(code.id);

                  return (
                    <div
                      key={code.id}
                      className={`grid w-full border-b border-[var(--border)] px-6 py-5 transition last:border-b-0 hover:bg-brand-50/30 ${columnsClassName}`}
                    >
                      <TableCell className="justify-center">
                        <TableCheckbox
                          checked={isSelected}
                          onToggle={() => toggleSelectedId(code.id)}
                        />
                      </TableCell>

                      <TableCell className="gap-2 font-mono font-semibold text-[var(--title)]">
                        <span>{formatCode(code.code)}</span>
                        <button
                          type="button"
                          onClick={() => void copyText(code.code, code.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted)] transition hover:text-[var(--color-brand-500)]"
                          aria-label="Copy redeem code"
                          title="Copy code"
                        >
                          {copiedCodeId === code.id ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </TableCell>

                      <TableCell className="font-semibold text-[var(--title)]">
                        {formatQuota(code.quotaAmount)}
                      </TableCell>

                      <TableCell>
                        <StatusBadge
                          label={code.status}
                          tone={getStatusTone(code.status)}
                          className="px-3 py-2 text-xs capitalize"
                        />
                      </TableCell>

                      <TableCell className="flex-col items-start">
                        <p className="font-semibold text-[var(--title)]">
                          {getPersonLabel(code.createdBy)}
                        </p>
                        <p className="mt-1 text-sm text-[var(--muted)]">
                          {code.createdAtLabel}
                        </p>
                      </TableCell>

                      <TableCell className="text-[var(--title)]">
                        {code.redeemedBy ? getPersonLabel(code.redeemedBy) : "-"}
                      </TableCell>

                      <TableCell className="text-[var(--title)]">
                        {code.redeemedAtLabel || "-"}
                      </TableCell>

                      <TableCell className="text-[var(--title)]">
                        {code.expiresAtLabel || "No expiry"}
                      </TableCell>

                      <TableCell className="justify-between gap-3 text-[var(--title)]">
                        <span className="line-clamp-2 min-w-0">
                          {code.note || "-"}
                        </span>
                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            type="button"
                            disabled={busy || code.status === "redeemed" || code.status === "disabled"}
                            onClick={() => void disableSingleCode(code)}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted)] transition hover:text-[var(--color-brand-500)] disabled:pointer-events-none disabled:opacity-35"
                            aria-label="Disable redeem code"
                            title="Disable"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void deleteSingleCode(code)}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted)] transition hover:text-[var(--color-brand-500)] disabled:pointer-events-none disabled:opacity-35"
                            aria-label="Delete redeem code"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
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

  return (
    <div className="space-y-6">
      <FullscreenTablePortal open={isTableExpanded}>
        {renderTable(true)}
      </FullscreenTablePortal>

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

      {renderTable()}

      <Modal open={isExportModalOpen} onClose={() => setIsExportModalOpen(false)}>
        <SelectedRowsExportModal
          title="Export selected redeem codes"
          description="Review the redeem codes to export, remove any row if needed, then choose the export format."
          rows={selectedCodes}
          emptyText="Select rows to export."
          exportMethod={exportMethod}
          onExportMethodChange={setExportMethod}
          onRemove={(id) =>
            setSelectedIds((current) => current.filter((item) => item !== id))
          }
          onCancel={() => setIsExportModalOpen(false)}
          onExport={() => {
            exportCodes(exportMethod);
            setIsExportModalOpen(false);
          }}
          getId={(code) => code.id}
          getTitle={(code) => formatCode(code.code)}
          getSubtitle={(code) =>
            `${formatQuota(code.quotaAmount)} quota - ${code.status}`
          }
          idPrefix="redeem-codes"
        />
      </Modal>

      <Modal
        open={isGenerateOpen}
        onClose={() => {
          setIsGenerateOpen(false);
          setGenerateError("");
        }}
      >
        <form onSubmit={handleGenerate} className="w-[min(92vw,860px)] space-y-6">
          <div>
            <h3 className="title-md">Generate Redeem Code</h3>
            <p className="paragraph mt-1">
              Create secure one-time voucher codes that add quota when redeemed.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <FieldLabel>Quota Amount</FieldLabel>
              <TextInput
                type="number"
                min="0.01"
                step="0.01"
                value={quotaAmount}
                onChange={setQuotaAmount}
                placeholder="10.00"
              />
            </div>

            <div className="space-y-2">
              <FieldLabel>Expiry Date</FieldLabel>
              <TextInput type="date" value={expiresAt} onChange={setExpiresAt} />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <FieldLabel>Note</FieldLabel>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Optional note for admin context or campaign name"
                rows={3}
                className="w-full resize-none rounded-md border px-4 py-3 text-sm font-medium outline-none transition focus:border-[var(--color-brand-500)] focus:ring-4 focus:ring-[rgba(var(--brand-rgb),0.14)]"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface)",
                  color: "var(--title)",
                }}
              />
            </div>
          </div>

          {generateError ? (
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
              {generateError}
            </p>
          ) : null}

          {generatedCodes.length > 0 ? (
            <div
              className="rounded-2xl border p-4"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface-2)",
              }}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[var(--title)]">
                    Generated Code
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Copy it now or export it from the table later.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="h-11"
                  iconLeft={
                    copiedGenerated ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )
                  }
                  onClick={() => void copyGeneratedCodes()}
                >
                  {copiedGenerated ? "Copied" : "Copy Code"}
                </Button>
              </div>

              <div className="mt-4 grid max-h-[220px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                {generatedCodes.map((code) => (
                  <div
                    key={code}
                    className="rounded-xl border px-3 py-2 font-mono text-sm font-semibold text-[var(--title)]"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--surface)",
                    }}
                  >
                    {formatCode(code)}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              className="h-12"
              onClick={() => setIsGenerateOpen(false)}
            >
              Close
            </Button>
            <Button
              type="submit"
              className="h-12"
              disabled={generateBusy}
              iconLeft={<Plus className="relative z-10 h-4 w-4" />}
            >
              {generateBusy ? "Generating..." : "Generate"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
