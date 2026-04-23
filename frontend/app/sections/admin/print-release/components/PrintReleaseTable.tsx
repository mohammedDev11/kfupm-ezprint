"use client";

import { Play, RefreshCw, Trash2 } from "lucide-react";
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
import Modal from "@/components/ui/modal/Modal";
import { exportTableData, TableExportFormat } from "@/lib/export";
import { apiDelete, apiGet, apiPost } from "@/services/api";

type SortDir = "asc" | "desc";
type JobSortKey =
  | "jobId"
  | "userName"
  | "documentName"
  | "printerName"
  | "pages"
  | "cost"
  | "submittedAt";

type PendingReleaseJob = {
  id: string;
  jobId: string;
  userName: string;
  userEmail: string;
  documentName: string;
  printerName: string;
  pages: number;
  options: string[];
  status: string;
  submittedAt: string;
  queueName: string;
  cost: number;
};

type PendingReleaseResponse = {
  summary: {
    total: number;
    totalPages: number;
    totalCost: number;
  };
  jobs: PendingReleaseJob[];
};

const columnsClassName =
  "[grid-template-columns:72px_minmax(140px,0.8fr)_minmax(210px,1fr)_minmax(260px,1.2fr)_minmax(200px,1fr)_minmax(90px,0.5fr)_minmax(130px,0.7fr)_minmax(190px,0.9fr)]";

function SummaryCard({
  title,
  value,
  helper,
}: {
  title: string;
  value: string | number;
  helper: string;
}) {
  return (
    <div
      className="rounded-2xl border p-5"
      style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
        {title}
      </p>
      <p className="mt-3 text-2xl font-semibold text-[var(--title)]">{value}</p>
      <p className="mt-2 text-sm text-[var(--muted)]">{helper}</p>
    </div>
  );
}

const formatMoney = (value: number) => `${value.toFixed(2)} SAR`;

const parseSortableDate = (value: string) => {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? value : timestamp;
};

const compareValues = (a: string | number, b: string | number, direction: SortDir) => {
  if (typeof a === "number" && typeof b === "number") {
    return direction === "asc" ? a - b : b - a;
  }

  return direction === "asc"
    ? String(a).localeCompare(String(b))
    : String(b).localeCompare(String(a));
};

export default function PrintReleaseTable() {
  const [jobs, setJobs] = useState<PendingReleaseJob[]>([]);
  const [summary, setSummary] = useState<PendingReleaseResponse["summary"]>({
    total: 0,
    totalPages: 0,
    totalCost: 0,
  });
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<JobSortKey>("submittedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [detailsJob, setDetailsJob] = useState<PendingReleaseJob | null>(null);

  const loadJobs = async (showSpinner = false) => {
    if (showSpinner) {
      setLoading(true);
    }

    try {
      const data = await apiGet<PendingReleaseResponse>(
        "/admin/jobs/pending-release",
        "admin",
      );
      const nextJobs = Array.isArray(data?.jobs) ? data.jobs : [];
      setJobs(nextJobs);
      setSummary(
        data.summary || {
          total: 0,
          totalPages: 0,
          totalCost: 0,
        },
      );
      setSelectedIds((current) =>
        current.filter((id) => nextJobs.some((job) => job.id === id)),
      );
      setError("");
    } catch (requestError) {
      setJobs([]);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load pending release jobs.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadJobs(true);
  }, []);

  const handleSort = (key: JobSortKey) => {
    if (sortKey === key) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDir(key === "jobId" || key === "userName" || key === "documentName" ? "asc" : "desc");
  };

  const filteredJobs = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return [...jobs]
      .filter((job) => {
        if (!searchTerm) {
          return true;
        }

        return [
          job.jobId,
          job.userName,
          job.userEmail,
          job.documentName,
          job.printerName,
          job.queueName,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(searchTerm);
      })
      .sort((a, b) => {
        switch (sortKey) {
          case "pages":
            return compareValues(a.pages, b.pages, sortDir);
          case "cost":
            return compareValues(a.cost, b.cost, sortDir);
          case "submittedAt":
            return compareValues(
              parseSortableDate(a.submittedAt),
              parseSortableDate(b.submittedAt),
              sortDir,
            );
          case "jobId":
          case "userName":
          case "documentName":
          case "printerName":
          default:
            return compareValues(a[sortKey], b[sortKey], sortDir);
        }
      });
  }, [jobs, search, sortDir, sortKey]);

  const visibleIds = filteredJobs.map((job) => job.id);
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
      await loadJobs(false);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Queue action failed.",
      );
    } finally {
      setBusy(false);
    }
  };

  const exportJobs = (format: TableExportFormat) => {
    const rows =
      selectedIds.length > 0
        ? filteredJobs.filter((job) => selectedIds.includes(job.id))
        : filteredJobs;

    exportTableData({
      title: "Pending Release Jobs",
      filename: "alpha-queue-pending-release-jobs",
      format,
      columns: [
        { label: "Job ID", value: (row: PendingReleaseJob) => row.jobId },
        { label: "User", value: (row) => row.userName },
        { label: "Email", value: (row) => row.userEmail },
        { label: "Document", value: (row) => row.documentName },
        { label: "Printer", value: (row) => row.printerName },
        { label: "Queue", value: (row) => row.queueName },
        { label: "Pages", value: (row) => row.pages },
        { label: "Cost", value: (row) => formatMoney(row.cost) },
        { label: "Submitted", value: (row) => row.submittedAt },
        { label: "Status", value: (row) => row.status },
      ],
      rows,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          title="Pending Jobs"
          value={summary.total}
          helper="Jobs currently waiting for release"
        />
        <SummaryCard
          title="Pages"
          value={summary.totalPages}
          helper="Total pages across the pending queue"
        />
        <SummaryCard
          title="Estimated Cost"
          value={formatMoney(summary.totalCost)}
          helper="Current pending cost exposure"
        />
      </div>

      <Table>
        <TableTop>
          <TableTitleBlock
            title="Print Release Queue"
            description={`Showing ${filteredJobs.length} pending release job${filteredJobs.length === 1 ? "" : "s"} from the live backend queue.`}
          />

          <TableControls>
            <TableSearch
              id="search-release-jobs"
              label="Search pending jobs"
              value={search}
              onChange={setSearch}
            />

            <Button
              variant="secondary"
              iconLeft={<RefreshCw className="h-4 w-4" />}
              className="h-14 px-6 text-base"
              disabled={busy}
              onClick={() => loadJobs(false)}
            >
              Refresh Queue
            </Button>

            <TableExportDropdown
              disabled={filteredJobs.length === 0}
              onExport={exportJobs}
            />

            <Button
              variant="outline"
              iconLeft={<Play className="h-4 w-4" />}
              className="h-14 px-6 text-base"
              disabled={busy || jobs.length === 0}
              onClick={() =>
                runAction(async () => {
                  await apiPost("/admin/jobs/release-all", {}, "admin");
                  setSelectedIds([]);
                })
              }
            >
              Release All
            </Button>

            <Button
              variant="outline"
              iconLeft={<Play className="h-4 w-4" />}
              className="h-14 px-6 text-base"
              disabled={busy || selectedIds.length === 0}
              onClick={() =>
                runAction(async () => {
                  await apiPost(
                    "/admin/jobs/release-selected",
                    { jobIds: selectedIds },
                    "admin",
                  );
                  setSelectedIds([]);
                })
              }
            >
              Release Selected
            </Button>

            <Button
              variant="outline"
              iconLeft={<Trash2 className="h-4 w-4" />}
              className="h-14 px-6 text-base"
              disabled={busy || selectedIds.length === 0}
              onClick={() =>
                runAction(async () => {
                  await Promise.all(
                    selectedIds.map((id) => apiDelete(`/admin/jobs/${id}`, "admin")),
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
          <TableGrid minWidthClassName="min-w-[1320px]">
            <TableHeader columnsClassName={columnsClassName}>
              <TableCell className="justify-center">
                <TableCheckbox
                  checked={allVisibleSelected}
                  onToggle={toggleSelectAllVisible}
                />
              </TableCell>
              <TableHeaderCell
                label="Job"
                sortable
                active={sortKey === "jobId"}
                direction={sortDir}
                onClick={() => handleSort("jobId")}
              />
              <TableHeaderCell
                label="User"
                sortable
                active={sortKey === "userName"}
                direction={sortDir}
                onClick={() => handleSort("userName")}
              />
              <TableHeaderCell
                label="Document"
                sortable
                active={sortKey === "documentName"}
                direction={sortDir}
                onClick={() => handleSort("documentName")}
              />
              <TableHeaderCell
                label="Printer"
                sortable
                active={sortKey === "printerName"}
                direction={sortDir}
                onClick={() => handleSort("printerName")}
              />
              <TableHeaderCell
                label="Pages"
                sortable
                active={sortKey === "pages"}
                direction={sortDir}
                onClick={() => handleSort("pages")}
              />
              <TableHeaderCell
                label="Cost"
                sortable
                active={sortKey === "cost"}
                direction={sortDir}
                onClick={() => handleSort("cost")}
              />
              <TableHeaderCell label="Actions" />
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableEmptyState text="Loading pending jobs..." />
              ) : filteredJobs.length === 0 ? (
                <TableEmptyState text="No pending release jobs were found." />
              ) : (
                filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => setDetailsJob(job)}
                    className={`grid w-full cursor-pointer border-b border-[var(--border)] px-6 py-5 transition last:border-b-0 hover:bg-brand-50/30 ${columnsClassName}`}
                  >
                    <TableCell className="justify-center">
                      <TableCheckbox
                        checked={selectedIds.includes(job.id)}
                        onToggle={() => toggleSelectedId(job.id)}
                      />
                    </TableCell>

                    <TableCell className="font-semibold text-[var(--title)]">
                      {job.jobId}
                    </TableCell>

                    <TableCell className="flex-col items-start">
                      <p className="font-semibold text-[var(--title)]">{job.userName}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">{job.userEmail}</p>
                    </TableCell>

                    <TableCell className="flex-col items-start">
                      <p className="font-semibold text-[var(--title)]">
                        {job.documentName}
                      </p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {job.submittedAt}
                      </p>
                    </TableCell>

                    <TableCell className="flex-col items-start">
                      <p className="font-semibold text-[var(--title)]">
                        {job.printerName}
                      </p>
                      <p className="mt-1 text-sm text-[var(--muted)]">{job.queueName}</p>
                    </TableCell>

                    <TableCell className="text-[var(--title)]">{job.pages}</TableCell>

                    <TableCell className="text-[var(--title)]">
                      {formatMoney(job.cost)}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={busy}
                          onClick={(event) => {
                            event.stopPropagation();
                            void runAction(async () => {
                              await apiPost(`/admin/jobs/${job.id}/release`, {}, "admin");
                            });
                          }}
                        >
                          Release
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={busy}
                          onClick={(event) => {
                            event.stopPropagation();
                            void runAction(async () => {
                              await apiDelete(`/admin/jobs/${job.id}`, "admin");
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

      <Modal open={Boolean(detailsJob)} onClose={() => setDetailsJob(null)}>
        <div className="space-y-4 pr-8">
          <div>
            <h3 className="title-md">{detailsJob?.jobId}</h3>
            <p className="paragraph mt-1">
              Review the pending job before releasing it to the printer.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {[
              ["User", detailsJob?.userName || "—"],
              ["Email", detailsJob?.userEmail || "—"],
              ["Document", detailsJob?.documentName || "—"],
              ["Printer", detailsJob?.printerName || "—"],
              ["Queue", detailsJob?.queueName || "—"],
              ["Submitted", detailsJob?.submittedAt || "—"],
              ["Pages", detailsJob?.pages ?? "—"],
              ["Cost", detailsJob ? formatMoney(detailsJob.cost) : "—"],
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
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div
            className="rounded-2xl border p-4"
            style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
          >
            <p className="text-sm font-semibold text-[var(--title)]">Print Options</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {detailsJob?.options?.length ? (
                detailsJob.options.map((option) => (
                  <span
                    key={option}
                    className="inline-flex rounded-full border px-3 py-1 text-xs font-semibold text-[var(--title)]"
                    style={{ borderColor: "var(--border)" }}
                  >
                    {option}
                  </span>
                ))
              ) : (
                <span className="text-sm text-[var(--muted)]">No special options.</span>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
