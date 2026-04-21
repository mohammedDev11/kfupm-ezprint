"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableTop,
  TableTitleBlock,
  TableControls,
  TableSearch,
  TableMain,
  TableGrid,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableCell,
  TableCheckbox,
  TableEmptyState,
} from "@/app/components/shared/table/Table";

import StatusBadge from "@/app/components/ui/badge/StatusBadge";
import Modal from "@/app/components/ui/modal/Modal";
import Button from "@/app/components/ui/button/Button";

import { walletTransactions, WalletTransaction } from "@/Data/User/wallet";
import { apiGet } from "@/app/lib/api/client";

import { cn } from "@/app/components/lib/cn";

/* ================= TYPES ================= */

type SortKey = "date" | "amount" | "type" | "status";
type SortDir = "asc" | "desc";

/* ================= UI ================= */

const columnsClass = "[grid-template-columns:70px_1fr_140px_140px_140px_140px]";

const WalletTransactionsTable = () => {
  const [transactions, setTransactions] =
    useState<WalletTransaction[]>(walletTransactions);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [openModal, setOpenModal] = useState<WalletTransaction | null>(null);

  /* ================= LOGIC ================= */

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const filtered = useMemo(() => {
    const term = search.toLowerCase();

    return [...transactions]
      .filter((item) => {
        return (
          item.description.toLowerCase().includes(term) ||
          item.type.toLowerCase().includes(term) ||
          item.status.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => {
        let valA: any;
        let valB: any;

        switch (sortKey) {
          case "date":
            valA = a.dateOrder;
            valB = b.dateOrder;
            break;
          case "amount":
            valA = a.amount;
            valB = b.amount;
            break;
          case "type":
            valA = a.type;
            valB = b.type;
            break;
          case "status":
            valA = a.status;
            valB = b.status;
            break;
        }

        if (typeof valA === "number") {
          return sortDir === "asc" ? valA - valB : valB - valA;
        }

        return sortDir === "asc"
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
  }, [transactions, search, sortKey, sortDir]);

  useEffect(() => {
    let mounted = true;

    apiGet<{ transactions: WalletTransaction[] }>(
      "/user/quota/transactions",
      "user"
    )
      .then((data) => {
        if (!mounted || !data?.transactions?.length) return;
        setTransactions(data.transactions);
      })
      .catch(() => {
        // Keep local fallback if API fails.
      });

    return () => {
      mounted = false;
    };
  }, []);

  const allIds = filtered.map((i) => i.id);

  const isAllSelected =
    allIds.length > 0 && allIds.every((id) => selectedIds.includes(id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allIds);
    }
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((p) => (p === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  /* ================= RENDER ================= */

  return (
    <>
      <Table>
        <TableTop>
          <TableTitleBlock
            title="Recent Wallet Activity"
            description={`${filtered.length} records`}
          />

          <TableControls>
            <TableSearch
              value={search}
              onChange={setSearch}
              label="Search transactions..."
            />
          </TableControls>
        </TableTop>

        <TableMain>
          <TableGrid>
            <TableHeader columnsClassName={columnsClass}>
              <TableCell className="justify-center">
                <TableCheckbox
                  checked={isAllSelected}
                  onToggle={toggleSelectAll}
                />
              </TableCell>

              <TableHeaderCell
                label="Transaction"
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
                label="Date"
                sortable
                active={sortKey === "date"}
                direction={sortDir}
                onClick={() => handleSort("date")}
              />

              <TableHeaderCell
                label="Status"
                sortable
                active={sortKey === "status"}
                direction={sortDir}
                onClick={() => handleSort("status")}
              />

              <TableHeaderCell label="Type" />
            </TableHeader>

            <TableBody>
              {filtered.length === 0 ? (
                <TableEmptyState />
              ) : (
                filtered.map((item) => {
                  const selected = selectedIds.includes(item.id);
                  const positive = item.direction === "in";

                  return (
                    <div
                      key={item.id}
                      onClick={() => setOpenModal(item)}
                      className={cn(
                        "grid cursor-pointer items-center border-b px-6 py-5 hover:bg-brand-50/30",
                        columnsClass
                      )}
                    >
                      <TableCell className="justify-center">
                        <TableCheckbox
                          checked={selected}
                          onToggle={() => toggleSelect(item.id)}
                        />
                      </TableCell>

                      <TableCell>
                        <div>
                          <p className="font-medium text-[var(--title)]">
                            {item.description}
                          </p>
                          <p className="text-sm text-[var(--muted)]">
                            #{item.id}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <span
                          className={cn(
                            "font-semibold",
                            positive ? "text-success-600" : "text-danger-500"
                          )}
                        >
                          {positive ? "+" : "-"}
                          {item.amount} SAR
                        </span>
                      </TableCell>

                      <TableCell>{item.date}</TableCell>

                      <TableCell>
                        <StatusBadge
                          label={item.status}
                          tone={
                            item.status === "Completed"
                              ? "success"
                              : item.status === "Pending"
                              ? "warning"
                              : "danger"
                          }
                        />
                      </TableCell>

                      <TableCell>{item.type}</TableCell>
                    </div>
                  );
                })
              )}
            </TableBody>
          </TableGrid>
        </TableMain>
      </Table>

      {/* ================= MODAL ================= */}

      <Modal open={!!openModal} onClose={() => setOpenModal(null)}>
        {openModal && (
          <div className="space-y-5">
            <h3 className="title-md">{openModal.description}</h3>

            <div className="grid grid-cols-2 gap-4">
              <Info label="Amount" value={`${openModal.amount} SAR`} />
              <Info label="Status" value={openModal.status} />
              <Info label="Date" value={openModal.date} />
              <Info label="Method" value={openModal.method} />
              <Info
                label="Balance After"
                value={`${openModal.balanceAfter} SAR`}
              />
            </div>

            {openModal.note && (
              <div>
                <p className="text-sm text-[var(--muted)]">Note</p>
                <p className="text-[var(--paragraph)] mt-1">{openModal.note}</p>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="outline">Close</Button>
              <Button>Export</Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

const Info = ({ label, value }: any) => (
  <div>
    <p className="text-sm text-[var(--muted)]">{label}</p>
    <p className="font-medium text-[var(--title)]">{value}</p>
  </div>
);

export default WalletTransactionsTable;
