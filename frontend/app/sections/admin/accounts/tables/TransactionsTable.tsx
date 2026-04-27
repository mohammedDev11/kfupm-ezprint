"use client";

import Modal from "@/components/ui/modal/Modal";
import {
  Check,
  CircleAlert,
  CircleDollarSign,
  Maximize2,
  Minimize2,
  Printer,
  ReceiptText,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import { useMemo, useState } from "react";
//import MainButton from "@/app/Mohammed/components/MainButton";
import FullscreenTablePortal from "@/components/shared/table/FullscreenTablePortal";
import KpiMetricCard from "@/components/shared/cards/KpiMetricCard";
import SelectedRowsExportModal from "@/components/shared/table/SelectedRowsExportModal";
import {
  TransactionBulkAction,
  TransactionItem,
  TransactionReviewStatus,
  TransactionSortKey,
  TransactionType,
  transactionBulkActionOptions,
  transactionReviewMeta,
  transactionReviewSortOrder,
  transactionTableColumns,
  transactionTypeMeta,
  transactionTypeSortOrder,
  transactionsData,
} from "@/lib/mock-data/Admin/accounts";
import { cn } from "@/lib/cn";
import { exportTableData, TableExportFormat } from "@/lib/export";
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

type SortDir = "asc" | "desc";
type ExportMethod = TableExportFormat;
type TransactionTypeFilter =
  | "all"
  | Extract<TransactionType, "Top-up" | "Print Charge" | "Refund">;
type AmountDirectionFilter = "all" | "credit" | "debit";

const columnsClassName =
  "[grid-template-columns:72px_minmax(190px,1fr)_minmax(160px,0.8fr)_minmax(180px,0.8fr)_minmax(320px,1.5fr)_minmax(150px,0.8fr)_minmax(170px,0.9fr)_minmax(160px,0.8fr)]";

const transactionTypeFilterOptions: {
  value: TransactionTypeFilter;
  label: string;
}[] = [
  { value: "all", label: "All" },
  { value: "Top-up", label: "Top-up" },
  { value: "Print Charge", label: "Print Charge" },
  { value: "Refund", label: "Refund" },
];

const amountDirectionFilterOptions: {
  value: AmountDirectionFilter;
  label: string;
}[] = [
  { value: "all", label: "All" },
  { value: "credit", label: "Credit" },
  { value: "debit", label: "Debit" },
];

const visibleTransactionActionOptions = transactionBulkActionOptions.filter(
  (option) => option.value !== "export-selected"
);

const formatMoney = (value: number) => {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${Math.abs(value).toFixed(2)}`;
};

const formatCurrency = (value: number) => `${value.toFixed(2)} SAR`;

const getAmountColor = (value: number) => {
  if (value > 0) {
    return "color-mix(in srgb, var(--color-support-700) 72%, var(--title))";
  }

  if (value < 0) {
    return "color-mix(in srgb, var(--color-brand-700) 78%, var(--title))";
  }

  return "var(--title)";
};

{
  /*function SecondaryButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn-secondary h-14 rounded-md px-6 text-base"
    >
      {children}
    </button>
  );
}*/
}

function TransactionTypeBadge({ type }: { type: TransactionType }) {
  const meta = transactionTypeMeta[type];

  const icon =
    type === "Top-up" ? (
      <CircleDollarSign className="h-4 w-4" strokeWidth={2.4} />
    ) : type === "Print Charge" ? (
      <CircleAlert className="h-4 w-4" strokeWidth={2.4} />
    ) : type === "Refund" ? (
      <RotateCcw className="h-4 w-4" strokeWidth={2.4} />
    ) : (
      <Check className="h-4 w-4" strokeWidth={2.4} />
    );

  return (
    <StatusBadge
      label={meta.label}
      tone={meta.tone}
      icon={icon}
      className="rounded-full !gap-2 px-3 py-1.5 text-xs [&>span:first-child]:h-auto [&>span:first-child]:w-auto"
    />
  );
}

function TransactionReviewBadge({
  status,
}: {
  status: TransactionReviewStatus;
}) {
  const meta = transactionReviewMeta[status];

  return (
    <StatusBadge
      label={meta.label}
      tone={meta.tone}
      className="rounded-full px-3 py-1.5 text-xs"
    />
  );
}

function AmountValue({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  return (
    <span
      className={cn("font-semibold", className)}
      style={{ color: getAmountColor(value) }}
    >
      {formatMoney(value)}
    </span>
  );
}

const TransactionsTable = () => {
  const [transactions, setTransactions] =
    useState<TransactionItem[]>(transactionsData);

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<TransactionSortKey>("time");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [transactionTypeFilter, setTransactionTypeFilter] =
    useState<TransactionTypeFilter>("all");
  const [amountDirectionFilter, setAmountDirectionFilter] =
    useState<AmountDirectionFilter>("all");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportMethod, setExportMethod] = useState<ExportMethod>("PDF");
  const [openTransactionModal, setOpenTransactionModal] =
    useState<TransactionItem | null>(null);

  const handleSort = (key: TransactionSortKey) => {
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

  const filteredTransactions = useMemo(() => {
    const term = search.trim().toLowerCase();

    return [...transactions]
      .filter((transaction) => {
        const matchesSearch =
          !term ||
          transaction.user.toLowerCase().includes(term) ||
          transaction.type.toLowerCase().includes(term) ||
          transaction.description.toLowerCase().includes(term) ||
          transaction.time.toLowerCase().includes(term) ||
          transaction.reviewStatus.toLowerCase().includes(term);

        if (!matchesSearch) return false;

        const matchesType =
          transactionTypeFilter === "all" ||
          transaction.type === transactionTypeFilter;
        const matchesAmountDirection =
          amountDirectionFilter === "all" ||
          (amountDirectionFilter === "credit" && transaction.amount > 0) ||
          (amountDirectionFilter === "debit" && transaction.amount < 0);

        return matchesType && matchesAmountDirection;
      })
      .sort((a, b) => {
        const getSortValue = (item: TransactionItem) => {
          switch (sortKey) {
            case "time":
              return item.time.toLowerCase();
            case "user":
              return item.user.toLowerCase();
            case "type":
              return transactionTypeSortOrder[item.type];
            case "description":
              return item.description.toLowerCase();
            case "amount":
              return item.amount;
            case "quotaAfter":
              return item.quotaAfter;
            case "reviewStatus":
              return transactionReviewSortOrder[item.reviewStatus];
            default:
              return item.time.toLowerCase();
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
    transactions,
    amountDirectionFilter,
    search,
    sortDir,
    sortKey,
    transactionTypeFilter,
  ]);

  const allVisibleIds = filteredTransactions.map(
    (transaction) => transaction.id
  );
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

  const handleBulkAction = (action: TransactionBulkAction) => {
    if (action === "export-selected") {
      setIsExportModalOpen(true);
      return;
    }

    if (selectedIds.length === 0) return;

    if (action === "mark-reviewed") {
      setTransactions((prev) =>
        prev.map((transaction) =>
          selectedIds.includes(transaction.id)
            ? { ...transaction, reviewStatus: "Reviewed" }
            : transaction
        )
      );

      setOpenTransactionModal((prev) =>
        prev && selectedIds.includes(prev.id)
          ? { ...prev, reviewStatus: "Reviewed" }
          : prev
      );
    }
  };

  const selectedTransactions = useMemo(
    () =>
      transactions.filter((transaction) =>
        selectedIds.includes(transaction.id)
      ),
    [selectedIds, transactions]
  );

  const removeSelectedTransactionFromExport = (id: string) => {
    setSelectedIds((current) => current.filter((item) => item !== id));
  };

  const activeFilterCount =
    (transactionTypeFilter === "all" ? 0 : 1) +
    (amountDirectionFilter === "all" ? 0 : 1);

  const transactionStats = useMemo(() => {
    const topUps = transactions.filter(
      (transaction) => transaction.type === "Top-up"
    );
    const charges = transactions.filter(
      (transaction) => transaction.type === "Print Charge"
    );
    const totalTopUps = topUps.reduce(
      (sum, transaction) => sum + Math.max(transaction.amount, 0),
      0
    );
    const totalCharges = charges.reduce(
      (sum, transaction) => sum + Math.abs(Math.min(transaction.amount, 0)),
      0
    );
    const netMovement = transactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    return {
      totalTransactions: transactions.length,
      topUpCount: topUps.length,
      chargeCount: charges.length,
      totalTopUps,
      totalCharges,
      netMovement,
    };
  }, [transactions]);

  const kpiCards = [
    {
      title: "Total Transactions",
      value: transactionStats.totalTransactions.toLocaleString(),
      helper: `${filteredTransactions.length.toLocaleString()} visible in current view`,
      icon: <ReceiptText className="h-5 w-5" />,
    },
    {
      title: "Total Top-ups",
      value: formatCurrency(transactionStats.totalTopUps),
      helper: `${transactionStats.topUpCount.toLocaleString()} top-up records`,
      icon: <CircleDollarSign className="h-5 w-5" />,
    },
    {
      title: "Total Charges",
      value: formatCurrency(transactionStats.totalCharges),
      helper: `${transactionStats.chargeCount.toLocaleString()} print charge records`,
      icon: <Printer className="h-5 w-5" />,
    },
    {
      title: "Net Movement",
      value: formatCurrency(transactionStats.netMovement),
      helper: "Quota movement across loaded records",
      icon: <RotateCcw className="h-5 w-5" />,
    },
  ];

  const refreshTransactions = () => {
    setTransactions([...transactionsData]);
    setSelectedIds([]);
    setOpenTransactionModal(null);
  };

  const exportTransactions = (format: TableExportFormat) => {
    if (selectedTransactions.length === 0) return;

    exportTableData({
      title: "Transaction History",
      filename: "alpha-queue-transactions",
      format,
      columns: [
        { label: "Time", value: (row: TransactionItem) => row.time },
        { label: "User", value: (row) => row.user },
        { label: "Type", value: (row) => row.type },
        { label: "Description", value: (row) => row.description },
        { label: "Amount", value: (row) => formatMoney(row.amount) },
        { label: "Quota After", value: (row) => row.quotaAfter.toFixed(2) },
        { label: "Review", value: (row) => row.reviewStatus },
      ],
      rows: selectedTransactions,
    });
  };

  const handleExportChange = (value: string) => {
    setExportMethod(value as ExportMethod);
    setIsExportModalOpen(true);
  };

  const handleExportConfirmed = () => {
    exportTransactions(exportMethod);
    setIsExportModalOpen(false);
  };

  return (
    <>
      <FullscreenTablePortal open={isTableExpanded}>
        {renderTransactionsTable(true)}
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

        {renderTransactionsTable()}
      </div>

      <Modal
        open={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      >
        <SelectedRowsExportModal
          title="Export selected transactions"
          description="Review the transactions to export, remove any row if needed, then choose the export format."
          rows={selectedTransactions}
          emptyText="No transactions selected."
          exportMethod={exportMethod}
          onExportMethodChange={setExportMethod}
          onRemove={removeSelectedTransactionFromExport}
          onCancel={() => setIsExportModalOpen(false)}
          onExport={handleExportConfirmed}
          getId={(transaction) => transaction.id}
          getTitle={(transaction) => transaction.user}
          getSubtitle={(transaction) =>
            `${transaction.type} • ${transaction.time}`
          }
          idPrefix="transactions"
        />
      </Modal>

      <Modal
        open={Boolean(openTransactionModal)}
        onClose={() => setOpenTransactionModal(null)}
      >
        <div className="space-y-5 pr-8">
          <div>
            <h3 className="title-md">{openTransactionModal?.id}</h3>
            <p className="paragraph mt-1">
              Review the selected transaction details.
            </p>
          </div>

          <div
            className="grid gap-4 rounded-2xl border p-4 sm:grid-cols-2"
            style={{
              borderColor: "var(--border)",
              background: "var(--surface-2)",
            }}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                User
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--title)]">
                {openTransactionModal?.user ?? "-"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Time
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--title)]">
                {openTransactionModal?.time ?? "-"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Type
              </p>
              <div className="mt-2">
                {openTransactionModal ? (
                  <TransactionTypeBadge type={openTransactionModal.type} />
                ) : null}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Review Status
              </p>
              <div className="mt-2">
                {openTransactionModal ? (
                  <TransactionReviewBadge
                    status={openTransactionModal.reviewStatus}
                  />
                ) : null}
              </div>
            </div>

            <div className="sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Description
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--title)]">
                {openTransactionModal?.description ?? "-"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Amount
              </p>
              {openTransactionModal ? (
                <AmountValue
                  value={openTransactionModal.amount}
                  className="mt-2 block text-sm"
                />
              ) : (
                <p className="mt-2 text-sm font-semibold text-[var(--title)]">
                  -
                </p>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Balance After
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--title)]">
                {openTransactionModal
                  ? openTransactionModal.quotaAfter.toFixed(2)
                  : "-"}
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            {/*{openTransactionModal?.reviewStatus === "Pending" ? (
              <MainButton
                label="Mark as Reviewed"
                onClick={() => {
                  if (!openTransactionModal) return;

                  setTransactions((prev) =>
                    prev.map((transaction) =>
                      transaction.id === openTransactionModal.id
                        ? { ...transaction, reviewStatus: "Reviewed" }
                        : transaction
                    )
                  );

                  setOpenTransactionModal((prev) =>
                    prev ? { ...prev, reviewStatus: "Reviewed" } : prev
                  );
                }}
              />
            ) : (
              <MainButton
                label="Close"
                onClick={() => setOpenTransactionModal(null)}
              />
            )}*/}

            {openTransactionModal?.reviewStatus === "Pending" ? (
              <Button
                variant="primary"
                onClick={() => {
                  if (!openTransactionModal) return;

                  setTransactions((prev) =>
                    prev.map((transaction) =>
                      transaction.id === openTransactionModal.id
                        ? { ...transaction, reviewStatus: "Reviewed" }
                        : transaction
                    )
                  );

                  setOpenTransactionModal((prev) =>
                    prev ? { ...prev, reviewStatus: "Reviewed" } : prev
                  );
                }}
              >
                Mark as Reviewed
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => setOpenTransactionModal(null)}
              >
                Close
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </>
  );

  function renderTransactionsTable(expanded = false) {
    return (
      <Table
        className={`flex min-h-[520px] flex-col ${
          expanded ? "h-dvh !rounded-none" : "max-h-[calc(100vh-20rem)]"
        }`}
      >
        <TableTop className={`shrink-0 ${expanded ? "bg-[var(--surface)]" : ""}`}>
          <TableTitleBlock title="Transaction History" />

          <TableControls>
            <TableSearch
              value={search}
              onChange={setSearch}
              label="Search transactions..."
              id={
                expanded
                  ? "transactions-search-expanded"
                  : "transactions-search"
              }
              wrapperClassName="w-full md:w-[320px]"
            />

            <RefreshButton
              className="h-14"
              onClick={refreshTransactions}
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

              <DropdownContent align="right" widthClassName="w-[340px]">
                <div className="space-y-4 p-2">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                      Transaction Type
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      {transactionTypeFilterOptions.map((option) => {
                        const isSelected =
                          transactionTypeFilter === option.value;

                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              setTransactionTypeFilter(option.value)
                            }
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
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                      Amount Direction
                    </p>

                    <div className="grid grid-cols-3 gap-2">
                      {amountDirectionFilterOptions.map((option) => {
                        const isSelected =
                          amountDirectionFilter === option.value;

                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              setAmountDirectionFilter(option.value)
                            }
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
                            {option.label}
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
                        setTransactionTypeFilter("all");
                        setAmountDirectionFilter("all");
                      }}
                    >
                      Reset Filters
                    </Button>
                  ) : null}
                </div>
              </DropdownContent>
            </Dropdown>

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
              onValueChange={(value) =>
                handleBulkAction(value as TransactionBulkAction)
              }
            >
              <DropdownTrigger className="h-14 min-w-[170px] rounded-md px-6 text-base">
                Actions
              </DropdownTrigger>

              <DropdownContent align="right" widthClassName="w-[240px]">
                {visibleTransactionActionOptions.map((option) => (
                  <DropdownItem
                    key={option.value}
                    value={option.value}
                    className="py-4 text-lg"
                  >
                    {option.label}
                  </DropdownItem>
                ))}
              </DropdownContent>
            </Dropdown>

            <button
              type="button"
              onClick={() => setIsTableExpanded(!expanded)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-transparent text-[var(--muted)] transition hover:text-[var(--color-brand-500)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(var(--brand-rgb),0.16)]"
              aria-label={
                expanded
                  ? "Collapse transactions table"
                  : "Expand transactions table"
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
          <TableGrid minWidthClassName="flex h-full min-w-[1710px] flex-col">
            <TableHeader columnsClassName={columnsClassName}>
              <TableCell className="justify-center">
                <TableCheckbox
                  checked={isAllSelected}
                  onToggle={toggleSelectAll}
                />
              </TableCell>

              {transactionTableColumns.map((column) => (
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

            <div className="min-h-0 flex-1 overflow-y-auto">
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableEmptyState text="No transactions found" />
                ) : (
                  filteredTransactions.map((transaction) => {
                    const isSelected = selectedIds.includes(transaction.id);

                    return (
                      <div
                        key={transaction.id}
                        onClick={() => setOpenTransactionModal(transaction)}
                        className={cn(
                          "grid w-full cursor-pointer border-b border-[var(--border)] px-6 py-5 transition last:border-b-0 hover:bg-brand-50/30",
                          columnsClassName
                        )}
                      >
                        <TableCell className="justify-center">
                          <TableCheckbox
                            checked={isSelected}
                            onToggle={() => toggleRowSelection(transaction.id)}
                          />
                        </TableCell>

                        <TableCell className="text-base font-medium text-[var(--paragraph)]">
                          {transaction.time}
                        </TableCell>

                        <TableCell className="text-base font-semibold text-[var(--title)]">
                          {transaction.user}
                        </TableCell>

                        <TableCell>
                          <TransactionTypeBadge type={transaction.type} />
                        </TableCell>

                        <TableCell className="paragraph">
                          {transaction.description}
                        </TableCell>

                        <TableCell>
                          <AmountValue
                            value={transaction.amount}
                            className="text-base"
                          />
                        </TableCell>

                        <TableCell className="text-base font-semibold text-[var(--title)]">
                          {transaction.quotaAfter.toFixed(2)}
                        </TableCell>

                        <TableCell>
                          <TransactionReviewBadge
                            status={transaction.reviewStatus}
                          />
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
};

export default TransactionsTable;
