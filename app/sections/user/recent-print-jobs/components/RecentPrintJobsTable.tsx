"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Check,
  Download,
  Eye,
  FileText,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Modal from "@/app/components/ui/modal/Modal";
import StatusBadge from "@/app/components/ui/badge/StatusBadge";
import Button from "@/app/components/ui/button/Button";
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
  recentPrintJobsData,
  recentPrintJobsFilterOptions,
  recentPrintJobsStatusMeta,
  recentPrintJobsTableColumns,
  type RecentPrintJobItem,
  type RecentPrintJobSortKey,
  type RecentPrintJobStatus,
} from "@/Data/User/recent-print-jobs";
import { apiGet } from "@/app/lib/api/client";

type SortDir = "asc" | "desc";
type FilterValue = "all" | RecentPrintJobStatus;

const columnsClassName =
  "[grid-template-columns:72px_160px_minmax(240px,1fr)_minmax(290px,1.5fr)_120px_120px_180px]";

function PrintJobStatusBadge({ status }: { status: RecentPrintJobStatus }) {
  const meta = recentPrintJobsStatusMeta[status];

  const icon =
    status === "Printed" ? (
      <Check className="h-4 w-4" strokeWidth={2.8} />
    ) : status === "Failed" ? (
      <X className="h-4 w-4" strokeWidth={2.8} />
    ) : (
      <RotateCcw className="h-4 w-4" strokeWidth={2.5} />
    );

  return (
    <StatusBadge
      label={meta.label}
      tone={meta.tone}
      icon={icon}
      className="px-4 py-2 text-sm"
    />
  );
}

const RecentPrintJobsTable = () => {
  const [jobs, setJobs] = useState<RecentPrintJobItem[]>(recentPrintJobsData);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<RecentPrintJobSortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filterValue, setFilterValue] = useState<FilterValue>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [openJobModal, setOpenJobModal] = useState<RecentPrintJobItem | null>(
    null
  );

  const handleSort = (key: RecentPrintJobSortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDir(key === "date" ? "desc" : "asc");
  };

  useEffect(() => {
    let mounted = true;

    apiGet<{ jobs: RecentPrintJobItem[] }>("/user/jobs/recent", "user")
      .then((data) => {
        if (!mounted || !data?.jobs?.length) return;
        setJobs(data.jobs);
      })
      .catch(() => {
        // Keep local fallback if API fails.
      });

    return () => {
      mounted = false;
    };
  }, []);

  const toggleRowSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredJobs = useMemo(() => {
    const term = search.trim().toLowerCase();

    return [...jobs]
      .filter((job) => {
        const matchesSearch =
          !term ||
          job.date.toLowerCase().includes(term) ||
          job.printerName.toLowerCase().includes(term) ||
          job.documentName.toLowerCase().includes(term) ||
          job.status.toLowerCase().includes(term);

        if (!matchesSearch) return false;
        if (filterValue === "all") return true;

        return job.status === filterValue;
      })
      .sort((a, b) => {
        const getSortValue = (item: RecentPrintJobItem) => {
          switch (sortKey) {
            case "date":
              return item.dateOrder;
            case "printerName":
              return item.printerName.toLowerCase();
            case "documentName":
              return item.documentName.toLowerCase();
            case "pages":
              return item.pages;
            case "cost":
              return item.cost;
            case "status":
              return item.status.toLowerCase();
            default:
              return item.dateOrder;
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
  }, [jobs, search, filterValue, sortKey, sortDir]);

  const allVisibleIds = filteredJobs.map((job) => job.id);
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
            title="Recent Print Jobs"
            description={`${filteredJobs.length} jobs total`}
          />

          <TableControls>
            <TableSearch
              id="search-recent-print-jobs"
              label="Search printer, document, status..."
              value={search}
              onChange={setSearch}
              wrapperClassName="w-full md:w-[360px]"
            />

            <Dropdown
              value={filterValue}
              onValueChange={(value) => setFilterValue(value as FilterValue)}
            >
              <DropdownTrigger className="h-14 min-w-[180px] px-5 text-base">
                {
                  recentPrintJobsFilterOptions.find(
                    (option) => option.value === filterValue
                  )?.label
                }
              </DropdownTrigger>

              <DropdownContent align="right" widthClassName="w-[220px]">
                {recentPrintJobsFilterOptions.map((option) => (
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

            <Button
              variant="outline"
              iconLeft={<SlidersHorizontal className="h-4 w-4" />}
              className="h-14 px-6 text-base"
              onClick={() => setIsFilterModalOpen(true)}
            >
              Filter
            </Button>
          </TableControls>
        </TableTop>

        <TableMain>
          <TableGrid minWidthClassName="min-w-[1260px]">
            <TableHeader columnsClassName={columnsClassName}>
              <TableCell className="justify-center">
                <TableCheckbox
                  checked={isAllSelected}
                  onToggle={toggleSelectAll}
                />
              </TableCell>

              {recentPrintJobsTableColumns.map((column) => (
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
              {filteredJobs.length === 0 ? (
                <TableEmptyState text="No print jobs found" />
              ) : (
                filteredJobs.map((job) => {
                  const isSelected = selectedIds.includes(job.id);

                  return (
                    <div
                      key={job.id}
                      onClick={() => setOpenJobModal(job)}
                      className={cn(
                        "grid w-full cursor-pointer items-center border-b border-[var(--border)] px-6 py-5 transition last:border-b-0 hover:bg-brand-50/30",
                        columnsClassName
                      )}
                    >
                      <TableCell className="justify-center">
                        <TableCheckbox
                          checked={isSelected}
                          onToggle={() => toggleRowSelection(job.id)}
                        />
                      </TableCell>

                      <TableCell className="text-base font-medium text-[var(--paragraph)]">
                        {job.date}
                      </TableCell>

                      <TableCell className="min-w-0">
                        <span className="block truncate text-base text-[var(--paragraph)]">
                          {job.printerName}
                        </span>
                      </TableCell>

                      <TableCell className="min-w-0 gap-3">
                        <FileText className="h-4 w-4 shrink-0 text-[var(--muted)]" />
                        <span className="block truncate text-base font-medium text-[var(--title)]">
                          {job.documentName}
                        </span>
                      </TableCell>

                      <TableCell className="text-base font-medium text-[var(--title)]">
                        {job.pages}
                      </TableCell>

                      <TableCell className="text-base font-medium text-[var(--title)]">
                        {job.cost.toFixed(2)}
                      </TableCell>

                      <TableCell>
                        <PrintJobStatusBadge status={job.status} />
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
            <h3 className="title-md">Filter Recent Print Jobs</h3>
            <p className="paragraph mt-1">
              Narrow down your print history by result type.
            </p>
          </div>

          <Dropdown
            value={filterValue}
            onValueChange={(value) => setFilterValue(value as FilterValue)}
          >
            <DropdownTrigger className="h-14 w-full px-4 text-left text-base">
              {
                recentPrintJobsFilterOptions.find(
                  (option) => option.value === filterValue
                )?.label
              }
            </DropdownTrigger>

            <DropdownContent widthClassName="w-full">
              {recentPrintJobsFilterOptions.map((option) => (
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

      <Modal open={Boolean(openJobModal)} onClose={() => setOpenJobModal(null)}>
        <div className="space-y-5 pr-8">
          <div>
            <h3 className="title-md">{openJobModal?.documentName}</h3>
            <p className="paragraph mt-1">
              View full details for this print job.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-[var(--muted)]">Date</p>
              <p className="paragraph mt-1">{openJobModal?.printedAt}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--muted)]">Status</p>
              <div className="mt-2">
                {openJobModal?.status ? (
                  <PrintJobStatusBadge status={openJobModal.status} />
                ) : null}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--muted)]">Printer</p>
              <p className="paragraph mt-1">{openJobModal?.printerName}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--muted)]">Pages</p>
              <p className="paragraph mt-1">{openJobModal?.pages}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--muted)]">Cost</p>
              <p className="paragraph mt-1">{openJobModal?.cost.toFixed(2)}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--muted)]">
                Submitted From
              </p>
              <p className="paragraph mt-1">{openJobModal?.submittedFrom}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-[var(--muted)]">
              Print Attributes
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {openJobModal?.attributes.map((attribute) => (
                <span
                  key={attribute}
                  className="inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-medium"
                  style={{
                    background: "var(--surface-2)",
                    color: "var(--paragraph)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {attribute}
                </span>
              ))}
            </div>
          </div>

          {openJobModal?.note ? (
            <div>
              <p className="text-sm font-medium text-[var(--muted)]">Note</p>
              <p className="paragraph mt-2">{openJobModal.note}</p>
            </div>
          ) : null}

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

export default RecentPrintJobsTable;
