"use client";

import React, { useMemo, useState } from "react";
import {
  Check,
  Download,
  Eye,
  Filter,
  RotateCcw,
  Search,
  WalletCards,
  X,
} from "lucide-react";
import { RiFilter3Line } from "react-icons/ri";
import Modal from "@/app/components/ui/modal/Modal";
import StatusBadge from "@/app/components/ui/badge/StatusBadge";
import FloatingInput from "@/app/components/ui/input/FloatingInput";
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
  TableTitleBlock,
  TableTop,
} from "@/app/components/shared/table/Table";
import { cn } from "@/app/components/lib/cn";
import {
  userTransactionColumns,
  userTransactionData,
  userTransactionFilterOptions,
  userTransactionTypeMeta,
  type UserTransactionItem,
  type UserTransactionSortKey,
  type UserTransactionType,
} from "@/Data/User/history";
import Button from "@/app/components/ui/button/Button";

type SortDir = "asc" | "desc";
type FilterValue = "all" | UserTransactionType;

const columnsClassName =
  "[grid-template-columns:72px_170px_180px_170px_190px_minmax(320px,1.6fr)]";

const formatMoney = (value: number) => {
  const abs = Math.abs(value).toFixed(2);
  return value > 0 ? `+${abs}` : value < 0 ? `-${abs}` : `${abs}`;
};

function TransactionTypeBadge({ type }: { type: UserTransactionType }) {
  const config = userTransactionTypeMeta[type];

  const icon =
    type === "Refund" ? (
      <RotateCcw className="h-4 w-4" strokeWidth={2.6} />
    ) : type === "Credit" ? (
      <Check className="h-4 w-4" strokeWidth={2.8} />
    ) : type === "Deduction" ? (
      <X className="h-4 w-4" strokeWidth={2.8} />
    ) : (
      <WalletCards className="h-4 w-4" strokeWidth={2.4} />
    );

  return (
    <StatusBadge
      label={config.label}
      tone={config.tone}
      icon={icon}
      className="px-4 py-2 text-sm"
    />
  );
}

const UserTransactionHistoryTable = () => {
  const [transactions] = useState<UserTransactionItem[]>(userTransactionData);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<UserTransactionSortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filterValue, setFilterValue] = useState<FilterValue>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [openTransactionModal, setOpenTransactionModal] =
    useState<UserTransactionItem | null>(null);

  const handleSort = (key: UserTransactionSortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDir(key === "date" ? "desc" : "asc");
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
          transaction.date.toLowerCase().includes(term) ||
          transaction.type.toLowerCase().includes(term) ||
          transaction.comment.toLowerCase().includes(term) ||
          transaction.reference.toLowerCase().includes(term);

        if (!matchesSearch) return false;
        if (filterValue === "all") return true;

        return transaction.type === filterValue;
      })
      .sort((a, b) => {
        const getSortValue = (item: UserTransactionItem) => {
          switch (sortKey) {
            case "date":
              return item.date;
            case "type":
              return item.type.toLowerCase();
            case "amount":
              return item.amount;
            case "balanceAfter":
              return item.balanceAfter;
            case "comment":
              return item.comment.toLowerCase();
            default:
              return item.date;
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
  }, [transactions, search, filterValue, sortKey, sortDir]);

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

  return (
    <>
      <Table>
        <TableTop>
          <TableTitleBlock
            title="Transaction History"
            description={`${filteredTransactions.length} transactions`}
          />

          <TableControls>
            <TableSearch
              id="search-user-transactions"
              label="Search transactions..."
              value={search}
              onChange={setSearch}
            />

            <ExpandedButton
              id="filter-transactions"
              label="Filter"
              icon={RiFilter3Line}
              className="h-14 rounded-md px-2 hover:bg-brand-700"
              onClick={() => setIsFilterModalOpen(true)}
            />
          </TableControls>
        </TableTop>

        <TableMain>
          <TableGrid minWidthClassName="min-w-[1160px]">
            <TableHeader columnsClassName={columnsClassName}>
              <TableCell className="justify-center">
                <TableCheckbox
                  checked={isAllSelected}
                  onToggle={toggleSelectAll}
                />
              </TableCell>

              {userTransactionColumns.map((column) => (
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
                  const isPositive = transaction.amount > 0;

                  return (
                    <div
                      key={transaction.id}
                      onClick={() => setOpenTransactionModal(transaction)}
                      className={cn(
                        "grid w-full cursor-pointer items-center border-b border-[var(--border)] px-6 py-5 transition last:border-b-0 hover:bg-brand-50/30",
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
                        {transaction.date}
                      </TableCell>

                      <TableCell>
                        <TransactionTypeBadge type={transaction.type} />
                      </TableCell>

                      <TableCell
                        className={cn(
                          "text-base font-semibold",
                          isPositive ? "text-success-600" : "text-danger-500"
                        )}
                      >
                        {formatMoney(transaction.amount)}
                      </TableCell>

                      <TableCell className="text-base font-semibold text-[var(--title)]">
                        {transaction.balanceAfter.toFixed(2)}
                      </TableCell>

                      <TableCell className="min-w-0">
                        <span className="block truncate text-base text-[var(--paragraph)]">
                          {transaction.comment}
                        </span>
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
            <p className="paragraph mt-1">
              Narrow down your transaction history.
            </p>
          </div>

          <Dropdown
            value={filterValue}
            onValueChange={(value) => setFilterValue(value as FilterValue)}
          >
            <DropdownTrigger className="h-14 w-full px-4 text-left text-base">
              {
                userTransactionFilterOptions.find(
                  (option) => option.value === filterValue
                )?.label
              }
            </DropdownTrigger>

            <DropdownContent widthClassName="w-full">
              {userTransactionFilterOptions.map((option) => (
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
            <h3 className="title-md">{openTransactionModal?.reference}</h3>
            <p className="paragraph mt-1">
              View full transaction details and account activity.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-[var(--muted)]">Date</p>
              <p className="paragraph mt-1">
                {openTransactionModal?.timestamp}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--muted)]">Type</p>
              <div className="mt-2">
                {openTransactionModal?.type ? (
                  <TransactionTypeBadge type={openTransactionModal.type} />
                ) : null}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--muted)]">Amount</p>
              <p
                className={cn(
                  "mt-1 text-base font-semibold",
                  (openTransactionModal?.amount ?? 0) > 0
                    ? "text-success-600"
                    : "text-danger-500"
                )}
              >
                {openTransactionModal
                  ? formatMoney(openTransactionModal.amount)
                  : "-"}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--muted)]">
                Balance After
              </p>
              <p className="paragraph mt-1">
                {openTransactionModal?.balanceAfter.toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--muted)]">Method</p>
              <p className="paragraph mt-1">{openTransactionModal?.method}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--muted)]">
                Reference
              </p>
              <p className="paragraph mt-1">
                {openTransactionModal?.reference}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-[var(--muted)]">Comment</p>
            <p className="paragraph mt-2">{openTransactionModal?.comment}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              iconLeft={<Download className="h-4 w-4" />}
            >
              Export Receipt
            </Button>

            <Button variant="primary" iconLeft={<Eye className="h-4 w-4" />}>
              View Details
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default UserTransactionHistoryTable;
