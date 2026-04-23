"use client";

import { cn } from "@/lib/cn";
import UsageProgress from "@/components/shared/features/UsageProgress";
import {
  Table,
  TableBody,
  TableCell,
  TableCheckbox,
  TableEmptyState,
  TableGrid,
  TableHeader,
  TableHeaderCell,
  TableMain,
  TableTop,
} from "@/components/shared/table/Table";
import Button from "@/components/ui/button/Button";
import Modal from "@/components/ui/modal/Modal";
import {
  pendingReleaseTableColumns,
  type PendingReleaseJob,
  type PendingReleaseSortKey,
} from "@/lib/mock-data/User/pending-jobs";
import { apiDelete, apiGet, apiPost } from "@/services/api";
import { FileText, Play, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FaMoneyCheck } from "react-icons/fa";

type SortDir = "asc" | "desc";

const columnsClassName =
  "[grid-template-columns:72px_minmax(300px,1.7fr)_minmax(220px,1fr)_110px_120px_minmax(180px,0.9fr)_160px]";

const JobsPendingReleaseTable = () => {
  const [jobs, setJobs] = useState<PendingReleaseJob[]>([]);
  const [quota, setQuota] = useState(0);
  const [sortKey, setSortKey] = useState<PendingReleaseSortKey>("documentName");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [openJobModal, setOpenJobModal] = useState<PendingReleaseJob | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const refreshJobs = async () => {
    const data = await apiGet<{ jobs: PendingReleaseJob[]; pendingReleaseQuota: number }>(
      "/user/jobs/pending-release",
      "user",
    );

    setJobs(data?.jobs || []);
    setQuota(typeof data?.pendingReleaseQuota === "number" ? data.pendingReleaseQuota : 0);
  };

  const handleSort = (key: PendingReleaseSortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDir("asc");
  };

  const toggleRowSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const filteredJobs = useMemo(() => {
    return [...jobs].sort((a, b) => {
      const getSortValue = (item: PendingReleaseJob) => {
        switch (sortKey) {
          case "documentName":
            return item.documentName.toLowerCase();
          case "printerName":
            return item.printerName.toLowerCase();
          case "pages":
            return item.pages;
          case "cost":
            return item.cost;
          case "submittedAt":
            return item.submittedMinutesAgo;
          case "readinessPercent":
            return item.readinessPercent;
          default:
            return item.documentName.toLowerCase();
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
  }, [jobs, sortDir, sortKey]);

  useEffect(() => {
    let mounted = true;

    refreshJobs()
      .then(() => {
        if (!mounted) return;
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  const selectedJobs = useMemo(() => {
    return filteredJobs.filter((job) => selectedIds.includes(job.id));
  }, [filteredJobs, selectedIds]);

  const selectedCost = useMemo(() => {
    return selectedJobs.reduce((sum, job) => sum + job.cost, 0);
  }, [selectedJobs]);

  const allVisibleIds = filteredJobs.map((job) => job.id);
  const isAllSelected =
    allVisibleIds.length > 0 &&
    allVisibleIds.every((id) => selectedIds.includes(id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !allVisibleIds.includes(id)),
      );
      return;
    }

    setSelectedIds((prev) => Array.from(new Set([...prev, ...allVisibleIds])));
  };

  const runAction = async (action: () => Promise<void>) => {
    setSubmitting(true);
    setError("");

    try {
      await action();
      await refreshJobs();
      setSelectedIds([]);
      setOpenJobModal(null);
    } catch (actionError) {
      setError(
        actionError instanceof Error ? actionError.message : "Unable to update pending jobs.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="space-y-5">
        {error ? (
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="paragraph">{filteredJobs.length} jobs waiting</p>
          </div>

          <div className="card inline-flex w-fit items-center gap-3 px-5 py-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-md bg-brand-500/10 text-brand-500">
              <span className="text-[30px] leading-none">
                <FaMoneyCheck />
              </span>
            </span>

            <div>
              <p className="paragraph text-sm">Quota</p>
              <p className="title-md leading-none">{quota.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <Table>
          <TableTop className="pb-0">
            <div />
          </TableTop>

          <TableMain>
            <TableGrid minWidthClassName="min-w-[1180px]">
              <TableHeader columnsClassName={columnsClassName}>
                <TableCell className="justify-center">
                  <TableCheckbox
                    checked={isAllSelected}
                    onToggle={toggleSelectAll}
                  />
                </TableCell>

                {pendingReleaseTableColumns.map((column) => (
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
                  <TableEmptyState text="No pending jobs found" />
                ) : (
                  filteredJobs.map((job) => {
                    const isSelected = selectedIds.includes(job.id);

                    return (
                      <div
                        key={job.id}
                        onClick={() => setOpenJobModal(job)}
                        className={cn(
                          "grid w-full cursor-pointer items-center border-b border-[var(--border)] px-6 py-5 transition last:border-b-0 hover:bg-brand-50/20",
                          columnsClassName,
                        )}
                      >
                        <TableCell className="justify-center">
                          <TableCheckbox
                            checked={isSelected}
                            onToggle={() => toggleRowSelection(job.id)}
                          />
                        </TableCell>

                        <TableCell className="min-w-0 gap-3">
                          <FileText className="h-4 w-4 shrink-0 text-[var(--muted)]" />
                          <span className="block truncate font-medium text-[var(--title)]">
                            {job.documentName}
                          </span>
                        </TableCell>

                        <TableCell className="paragraph min-w-0">
                          <span className="block truncate">
                            {job.printerName}
                          </span>
                        </TableCell>

                        <TableCell className="text-base font-medium text-[var(--title)]">
                          {job.pages}
                        </TableCell>

                        <TableCell className="text-base font-medium text-[var(--title)]">
                          {job.cost.toFixed(2)}
                        </TableCell>

                        <TableCell>
                          <UsageProgress value={job.readinessPercent} />
                        </TableCell>

                        <TableCell className="text-base text-[var(--muted)]">
                          {job.submittedAt}
                        </TableCell>
                      </div>
                    );
                  })
                )}
              </TableBody>
            </TableGrid>
          </TableMain>

          <div className="border-t border-[var(--border)] px-6 py-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <p className="text-lg" style={{ color: "var(--paragraph)" }}>
                {selectedIds.length} selected · Cost:{" "}
                <span className="font-semibold text-[var(--title)]">
                  {selectedCost.toFixed(2)}
                </span>
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  variant="outline"
                  size="lg"
                  iconLeft={<Trash2 className="h-5 w-5" />}
                  className="h-14 px-6 text-base"
                  disabled={selectedIds.length === 0 || submitting}
                  onClick={() =>
                    runAction(async () => {
                      await Promise.all(
                        selectedIds.map((jobId) =>
                          apiDelete(`/user/jobs/${jobId}`, "user"),
                        ),
                      );
                    })
                  }
                >
                  Cancel Selected
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  iconLeft={<Play className="h-5 w-5" />}
                  className="h-14 px-6 text-base"
                  disabled={selectedIds.length === 0 || submitting}
                  onClick={() =>
                    runAction(async () => {
                      await apiPost(
                        "/user/jobs/release-selected",
                        { jobIds: selectedIds },
                        "user",
                      );
                    })
                  }
                >
                  Release Selected
                </Button>

                <Button
                  variant="primary"
                  size="lg"
                  iconLeft={<Play className="h-5 w-5" />}
                  className="h-14 px-6 text-base"
                  disabled={submitting || jobs.length === 0}
                  onClick={() =>
                    runAction(async () => {
                      await apiPost("/user/jobs/release-all", {}, "user");
                    })
                  }
                >
                  Release All
                </Button>
              </div>
            </div>
          </div>
        </Table>
      </div>

      <Modal open={Boolean(openJobModal)} onClose={() => setOpenJobModal(null)}>
        <div className="space-y-5 pr-8">
          <div>
            <h3 className="title-md">{openJobModal?.documentName}</h3>
            <p className="paragraph mt-1">
              Review this pending print job and manage release actions.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                Submitted
              </p>
              <p className="paragraph mt-1">{openJobModal?.submittedAt}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--muted)]">
                Client Source
              </p>
              <p className="paragraph mt-1">{openJobModal?.clientSource}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--muted)]">
                File Type
              </p>
              <p className="paragraph mt-1">{openJobModal?.fileType}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--muted)]">
                Print Mode
              </p>
              <p className="paragraph mt-1">{openJobModal?.printMode}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--muted)]">
                Job Readiness
              </p>
              <div className="mt-2">
                <UsageProgress value={openJobModal?.readinessPercent ?? 0} />
              </div>
              <p className="mt-2 text-sm text-[var(--muted)]">
                {openJobModal?.estimatedReady}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              iconLeft={<Trash2 className="h-4 w-4" />}
              disabled={submitting || !openJobModal}
              onClick={() =>
                openJobModal
                  ? runAction(async () => {
                      await apiDelete(`/user/jobs/${openJobModal.id}`, "user");
                    })
                  : undefined
              }
            >
              Cancel Job
            </Button>

            <Button
              variant="primary"
              iconLeft={<Play className="h-4 w-4" />}
              disabled={submitting || !openJobModal}
              onClick={() =>
                openJobModal
                  ? runAction(async () => {
                      await apiPost(
                        `/user/jobs/${openJobModal.id}/release`,
                        {},
                        "user",
                      );
                    })
                  : undefined
              }
            >
              Release Job
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default JobsPendingReleaseTable;
