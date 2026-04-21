"use client";

import Modal from "@/app/components/ui/modal/Modal";
import {
  Check,
  CircleAlert,
  CircleDollarSign,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import { useMemo, useState } from "react";
//import MainButton from "@/app/Mohammed/components/MainButton";
import {
  TransactionBulkAction,
  TransactionFilterValue,
  TransactionItem,
  TransactionReviewStatus,
  TransactionSortKey,
  TransactionType,
  transactionBulkActionOptions,
  transactionFilterOptions,
  transactionReviewMeta,
  transactionReviewSortOrder,
  transactionTableColumns,
  transactionTypeMeta,
  transactionTypeSortOrder,
  transactionsData,
} from "@/Data/Admin/accounts";
import { cn } from "@/app/components/lib/cn";
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
import StatusBadge from "@/app/components/ui/badge/StatusBadge";
import Button from "@/app/components/ui/button/Button";
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from "@/app/components/ui/dropdown/Dropdown";

type SortDir = "asc" | "desc";

const columnsClassName =
  "[grid-template-columns:72px_minmax(190px,1fr)_minmax(160px,0.8fr)_minmax(180px,0.8fr)_minmax(320px,1.5fr)_minmax(150px,0.8fr)_minmax(170px,0.9fr)_minmax(160px,0.8fr)]";

const formatMoney = (value: number) => {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${Math.abs(value).toFixed(2)}`;
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

  return <StatusBadge label={meta.label} tone={meta.tone} icon={icon} />;
}

function TransactionReviewBadge({
  status,
}: {
  status: TransactionReviewStatus;
}) {
  const meta = transactionReviewMeta[status];

  return <StatusBadge label={meta.label} tone={meta.tone} />;
}

const TransactionsTable = () => {
  const [transactions, setTransactions] =
    useState<TransactionItem[]>(transactionsData);

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<TransactionSortKey>("time");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [filterValue, setFilterValue] = useState<TransactionFilterValue>("all");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
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

        switch (filterValue) {
          case "top-up":
            return transaction.type === "Top-up";
          case "print-charge":
            return transaction.type === "Print Charge";
          case "refund":
            return transaction.type === "Refund";
          case "adjustment":
            return transaction.type === "Adjustment";
          case "reviewed":
            return transaction.reviewStatus === "Reviewed";
          case "pending":
            return transaction.reviewStatus === "Pending";
          case "positive":
            return transaction.amount > 0;
          case "negative":
            return transaction.amount < 0;
          default:
            return true;
        }
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
  }, [transactions, filterValue, search, sortDir, sortKey]);

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

  const activeFilterLabel =
    transactionFilterOptions.find((option) => option.value === filterValue)
      ?.label ?? "All Types";

  return (
    <>
      <Table>
        <TableTop>
          <TableTitleBlock
            title="Transaction History"
            description={`${filteredTransactions.length} records`}
          />

          <TableControls>
            <TableSearch
              value={search}
              onChange={setSearch}
              label="Search transactions..."
              id="transactions-search"
              wrapperClassName="w-full md:w-[320px]"
            />

            {/*<SecondaryButton onClick={() => setIsFilterModalOpen(true)}>
              <SlidersHorizontal className="mr-2 h-5 w-5" />
              Filter
            </SecondaryButton>*/}

            <Button
              variant="outline"
              iconLeft={<SlidersHorizontal className="h-4 w-4" />}
              className="h-14 px-6 text-base"
              onClick={() => setIsFilterModalOpen(true)}
            >
              Filter
            </Button>

            <Dropdown
              onValueChange={(value) =>
                handleBulkAction(value as TransactionBulkAction)
              }
            >
              <DropdownTrigger className="h-14 min-w-[170px] rounded-md px-6 text-base">
                Actions
              </DropdownTrigger>

              <DropdownContent align="right" widthClassName="w-[240px]">
                {transactionBulkActionOptions.map((option) => (
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
          </TableControls>
        </TableTop>

        <TableMain>
          <TableGrid minWidthClassName="min-w-[1710px]">
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

                      <TableCell
                        className={cn(
                          "text-base font-semibold",
                          transaction.amount > 0
                            ? "text-success-600"
                            : transaction.amount < 0
                            ? "text-danger-500"
                            : "text-[var(--title)]"
                        )}
                      >
                        {formatMoney(transaction.amount)}
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
          </TableGrid>
        </TableMain>
      </Table>

      <Modal
        open={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
      >
        <div className="space-y-4 pr-8">
          <div>
            <h3 className="title-md">Filter Transactions</h3>
            <p className="paragraph mt-1">Narrow down the transaction list.</p>
          </div>

          <Dropdown
            value={filterValue}
            onValueChange={(value) =>
              setFilterValue(value as TransactionFilterValue)
            }
          >
            <DropdownTrigger className="h-14 w-full rounded-md px-4 text-left text-base">
              {activeFilterLabel}
            </DropdownTrigger>

            <DropdownContent widthClassName="w-full">
              {transactionFilterOptions.map((option) => (
                <DropdownItem
                  key={option.value}
                  value={option.value}
                  className="py-3 text-base"
                >
                  {option.label}
                </DropdownItem>
              ))}
            </DropdownContent>
          </Dropdown>
        </div>
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
              <p
                className={cn(
                  "mt-2 text-sm font-semibold",
                  (openTransactionModal?.amount ?? 0) > 0
                    ? "text-success-600"
                    : (openTransactionModal?.amount ?? 0) < 0
                    ? "text-danger-500"
                    : "text-[var(--title)]"
                )}
              >
                {openTransactionModal
                  ? formatMoney(openTransactionModal.amount)
                  : "-"}
              </p>
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
};

export default TransactionsTable;
