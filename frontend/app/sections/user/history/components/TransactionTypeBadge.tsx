"use client";

import { RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
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
import { apiGet } from "@/services/api";

type SortDir = "asc" | "desc";
type TransactionSortKey =
  | "date"
  | "description"
  | "type"
  | "amount"
  | "balanceAfter"
  | "status";

type TransactionItem = {
  id: string;
  description: string;
  type: string;
  amount: number;
  date: string;
  dateOrder: number;
  status: string;
  direction: "in" | "out";
  balanceAfter: number;
  method: string;
  note: string;
};

type TransactionsResponse = {
  transactions: TransactionItem[];
};

const columnsClassName =
  "[grid-template-columns:minmax(160px,0.9fr)_minmax(260px,1.4fr)_minmax(170px,0.8fr)_minmax(150px,0.8fr)_minmax(170px,0.8fr)_minmax(150px,0.8fr)]";

const toneByDirection = {
  in: "text-emerald-700",
  out: "text-red-700",
};

const compareValues = (a: string | number, b: string | number, direction: SortDir) => {
  if (typeof a === "number" && typeof b === "number") {
    return direction === "asc" ? a - b : b - a;
  }

  return direction === "asc"
    ? String(a).localeCompare(String(b))
    : String(b).localeCompare(String(a));
};

const formatMoney = (value: number) => `${value.toFixed(2)} SAR`;

export default function UserTransactionHistoryTable() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<TransactionSortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionItem | null>(null);

  const loadTransactions = async (showSpinner = false) => {
    if (showSpinner) {
      setLoading(true);
    }

    try {
      const data = await apiGet<TransactionsResponse>(
        "/user/quota/transactions",
        "user",
      );
      setTransactions(Array.isArray(data?.transactions) ? data.transactions : []);
      setError("");
    } catch (requestError) {
      setTransactions([]);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load transaction history.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTransactions(true);
  }, []);

  const handleSort = (key: TransactionSortKey) => {
    if (sortKey === key) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDir(key === "date" ? "desc" : "asc");
  };

  const filteredTransactions = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return [...transactions]
      .filter((item) => {
        if (!searchTerm) {
          return true;
        }

        return [
          item.description,
          item.type,
          item.status,
          item.method,
          item.note,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(searchTerm);
      })
      .sort((a, b) => {
        switch (sortKey) {
          case "amount":
            return compareValues(a.amount, b.amount, sortDir);
          case "balanceAfter":
            return compareValues(a.balanceAfter, b.balanceAfter, sortDir);
          case "date":
            return compareValues(a.dateOrder, b.dateOrder, sortDir);
          default:
            return compareValues(a[sortKey], b[sortKey], sortDir);
        }
      });
  }, [transactions, search, sortDir, sortKey]);

  const exportTransactions = (format: TableExportFormat) => {
    exportTableData({
      title: "User Transaction History",
      filename: "alpha-queue-transaction-history",
      format,
      columns: [
        { label: "Date", value: (row: TransactionItem) => row.date },
        { label: "Description", value: (row) => row.description },
        { label: "Type", value: (row) => row.type },
        {
          label: "Amount",
          value: (row) =>
            `${row.direction === "in" ? "+" : "-"}${formatMoney(row.amount)}`,
        },
        { label: "Balance After", value: (row) => formatMoney(row.balanceAfter) },
        { label: "Status", value: (row) => row.status },
        { label: "Method", value: (row) => row.method },
        { label: "Reference", value: (row) => row.note },
      ],
      rows: filteredTransactions,
    });
  };

  return (
    <div className="space-y-5">
      <Table>
        <TableTop>
          <TableTitleBlock
            title="Transaction History"
            description={`Showing ${filteredTransactions.length} transaction${filteredTransactions.length === 1 ? "" : "s"} from the live quota ledger.`}
          />

          <TableControls>
            <TableSearch
              id="search-transactions"
              label="Search transactions"
              value={search}
              onChange={setSearch}
            />

            <Button
              variant="secondary"
              iconLeft={<RefreshCw className="h-4 w-4" />}
              className="h-14 px-6 text-base"
              onClick={() => loadTransactions(false)}
            >
              Refresh
            </Button>

            <TableExportDropdown
              disabled={filteredTransactions.length === 0}
              onExport={exportTransactions}
            />
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
          <TableGrid minWidthClassName="min-w-[1060px]">
            <TableHeader columnsClassName={columnsClassName}>
              <TableHeaderCell
                label="Date"
                sortable
                active={sortKey === "date"}
                direction={sortDir}
                onClick={() => handleSort("date")}
              />
              <TableHeaderCell
                label="Description"
                sortable
                active={sortKey === "description"}
                direction={sortDir}
                onClick={() => handleSort("description")}
              />
              <TableHeaderCell
                label="Type"
                sortable
                active={sortKey === "type"}
                direction={sortDir}
                onClick={() => handleSort("type")}
              />
              <TableHeaderCell
                label="Amount"
                sortable
                active={sortKey === "amount"}
                direction={sortDir}
                onClick={() => handleSort("amount")}
              />
              <TableHeaderCell
                label="Balance After"
                sortable
                active={sortKey === "balanceAfter"}
                direction={sortDir}
                onClick={() => handleSort("balanceAfter")}
              />
              <TableHeaderCell
                label="Status"
                sortable
                active={sortKey === "status"}
                direction={sortDir}
                onClick={() => handleSort("status")}
              />
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableEmptyState text="Loading transactions..." />
              ) : filteredTransactions.length === 0 ? (
                <TableEmptyState text="No transactions matched the current search." />
              ) : (
                filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    onClick={() => setSelectedTransaction(transaction)}
                    className={`grid w-full cursor-pointer border-b border-[var(--border)] px-6 py-5 transition last:border-b-0 hover:bg-brand-50/30 ${columnsClassName}`}
                  >
                    <TableCell className="text-[var(--title)]">{transaction.date}</TableCell>

                    <TableCell className="flex-col items-start">
                      <p className="font-semibold text-[var(--title)]">
                        {transaction.description}
                      </p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {transaction.method}
                      </p>
                    </TableCell>

                    <TableCell className="text-[var(--title)]">{transaction.type}</TableCell>

                    <TableCell>
                      <span
                        className={`text-sm font-semibold ${toneByDirection[transaction.direction]}`}
                      >
                        {transaction.direction === "in" ? "+" : "-"}
                        {formatMoney(transaction.amount)}
                      </span>
                    </TableCell>

                    <TableCell className="text-[var(--title)]">
                      {formatMoney(transaction.balanceAfter)}
                    </TableCell>

                    <TableCell className="text-[var(--title)]">
                      {transaction.status}
                    </TableCell>
                  </div>
                ))
              )}
            </TableBody>
          </TableGrid>
        </TableMain>
      </Table>

      <Modal
        open={Boolean(selectedTransaction)}
        onClose={() => setSelectedTransaction(null)}
      >
        <div className="space-y-4 pr-8">
          <div>
            <h3 className="title-md">{selectedTransaction?.description}</h3>
            <p className="paragraph mt-1">{selectedTransaction?.date}</p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {[
              ["Type", selectedTransaction?.type || "—"],
              [
                "Amount",
                selectedTransaction ? formatMoney(selectedTransaction.amount) : "—",
              ],
              ["Direction", selectedTransaction?.direction || "—"],
              [
                "Balance After",
                selectedTransaction
                  ? formatMoney(selectedTransaction.balanceAfter)
                  : "—",
              ],
              ["Status", selectedTransaction?.status || "—"],
              ["Method", selectedTransaction?.method || "—"],
              ["Reference", selectedTransaction?.note || "—"],
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
        </div>
      </Modal>
    </div>
  );
}
