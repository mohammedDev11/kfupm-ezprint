"use client";

import PageIntro from "@/components/shared/page/Text/PageIntro";
import Button from "@/components/ui/button/Button";
import { FileUpload } from "@/components/ui/button/file-upload";
import Input from "@/components/ui/input/Input";
import ListBox from "@/components/ui/listbox/ListBox";
import {
  apiDelete,
  apiDownload,
  apiGet,
  apiUpload,
  apiUploadBatch,
} from "@/services/api";
import {
  Archive,
  Clock3,
  FileText,
  KeyRound,
  MonitorUp,
  PanelRightOpen,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type PrintQueueOption = {
  id: string;
  name: string;
  description: string;
  type: string;
  secureRelease: boolean;
  printerId: string;
  printerName: string;
  assignedPrinters?: PrintQueuePrinterTarget[];
  targetPrinterCount?: number;
};

type PrintQueuePrinterTarget = {
  id: string;
  name: string;
  status: string;
  online?: boolean;
  isActive?: boolean;
  ipAddress?: string;
};

type PrintOptionsResponse = {
  queues: PrintQueueOption[];
  defaultQueueId: string;
  acceptedMimeTypes: string[];
  maxFiles: number;
};

type UploadedJobResponse = {
  job: {
    id: string;
    jobId: string;
    documentName: string;
    printerName: string;
    queueName: string;
    status: string;
    releaseCode: string;
    releaseCodeExpiry: string | null;
    fileCount?: number;
  };
  dispatch?: {
    method: string;
    destinationName: string;
    bytesSent: number;
    destinationCount?: number;
    documentsDispatched?: number;
    failureCount?: number;
  };
};

type PrintDraftItem = {
  id: string;
  name: string;
  documentName: string;
  fileCount: number;
  lastSavedAt: string;
  settings: {
    queueId: string;
    queueName: string;
    documentName: string;
    copies: number;
    colorMode: string;
    mode: string;
    paperSize: string;
    quality: string;
  };
  files: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    pages: number;
  }>;
};

type PrintDraftListResponse = {
  drafts: PrintDraftItem[];
};

type PrintDraftSaveResponse = {
  draft: PrintDraftItem;
};

const COLOR_OPTIONS = ["Black & White", "Color"];
const DUPLEX_OPTIONS = [
  { value: "Simplex", label: "Single-sided" },
  { value: "Duplex", label: "Double-sided" },
];
const PAPER_SIZE_OPTIONS = ["A4", "A3", "Letter"];
const PDF_ACCEPT = { "application/pdf": [".pdf"] };
const DEFAULT_MAX_FILES = 10;

const isSecureReleaseQueue = (queue: PrintQueueOption) =>
  queue.secureRelease ||
  queue.type === "Secure Release Queue" ||
  /secure release/i.test(queue.name);

const getQueuePrinterTargets = (
  queue: PrintQueueOption | null,
): PrintQueuePrinterTarget[] => {
  if (!queue) {
    return [];
  }

  if (queue.assignedPrinters?.length) {
    return queue.assignedPrinters;
  }

  if (queue.printerName || queue.printerId) {
    return [
      {
        id: queue.printerId,
        name: queue.printerName || "Assigned printer",
        status: "",
      },
    ];
  }

  return [];
};

const getPrinterTargetMeta = (printer: PrintQueuePrinterTarget) =>
  [printer.status || (printer.online ? "Online" : ""), printer.ipAddress]
    .filter(Boolean)
    .join(" - ");

const isPdfFile = (file: File) =>
  file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

const getFileBaseName = (file: File) => file.name.replace(/\.[^.]+$/, "");

const getDefaultJobName = (nextFiles: File[]) =>
  nextFiles.length > 1 ? "Multiple documents" : getFileBaseName(nextFiles[0]);

const formatFileSize = (size: number) => {
  if (!size) {
    return "0 MB";
  }

  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
};

const formatDraftDate = (value: string) => {
  if (!value) {
    return "Not saved yet";
  }

  return new Date(value).toLocaleString();
};

const Page = () => {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [maxFiles, setMaxFiles] = useState(DEFAULT_MAX_FILES);
  const [jobName, setJobName] = useState("");
  const [queues, setQueues] = useState<PrintQueueOption[]>([]);
  const [selectedQueueId, setSelectedQueueId] = useState("");
  const [copies, setCopies] = useState(1);
  const [colorMode, setColorMode] = useState("Black & White");
  const [printMode, setPrintMode] = useState("Simplex");
  const [paperSize, setPaperSize] = useState("A4");
  const [drafts, setDrafts] = useState<PrintDraftItem[]>([]);
  const [draftPanelOpen, setDraftPanelOpen] = useState(false);
  const [draftsLoading, setDraftsLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [draftActionId, setDraftActionId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [queuedJob, setQueuedJob] = useState<UploadedJobResponse["job"] | null>(null);
  const [dispatchSummary, setDispatchSummary] =
    useState<UploadedJobResponse["dispatch"] | null>(null);

  const loadDrafts = useCallback(async () => {
    setDraftsLoading(true);

    try {
      const data = await apiGet<PrintDraftListResponse>("/user/jobs/drafts", "user");
      setDrafts(data.drafts || []);
    } catch (draftError) {
      setError(
        draftError instanceof Error
          ? draftError.message
          : "Unable to load print drafts.",
      );
    } finally {
      setDraftsLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    apiGet<PrintOptionsResponse>("/user/jobs/options", "user")
      .then((data) => {
        if (!mounted) {
          return;
        }

        const secureReleaseQueues = (data.queues || []).filter(isSecureReleaseQueue);
        const defaultSecureQueue =
          secureReleaseQueues.find((queue) => queue.id === data.defaultQueueId) ||
          (secureReleaseQueues.length === 1 ? secureReleaseQueues[0] : null);

        setQueues(secureReleaseQueues);
        setSelectedQueueId(defaultSecureQueue?.id || "");
        setMaxFiles(Math.max(1, data.maxFiles || DEFAULT_MAX_FILES));

        if (secureReleaseQueues.length === 0) {
          setError(
            "No active Secure Release queue is available. Confirm MongoDB is connected and the demo queue is provisioned.",
          );
        }
      })
      .catch((requestError) => {
        if (!mounted) {
          return;
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load queue options.",
        );
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadDrafts();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadDrafts]);

  const selectedQueue = useMemo(
    () => queues.find((queue) => queue.id === selectedQueueId) || null,
    [queues, selectedQueueId],
  );
  const selectedQueuePrinterTargets = useMemo(
    () => getQueuePrinterTargets(selectedQueue),
    [selectedQueue],
  );
  const selectedQueuePrinterNames = selectedQueuePrinterTargets
    .map((printer) => printer.name)
    .filter(Boolean);
  const queueOptions = useMemo(
    () =>
      queues.map((queue) => ({
        value: queue.id,
        label: queue.name,
      })),
    [queues],
  );

  const handleFilesChange = (nextFiles: File[]) => {
    const pdfFiles = nextFiles.filter(isPdfFile).slice(0, maxFiles);

    if (pdfFiles.length !== nextFiles.length) {
      setError("Only PDF files can be uploaded. Unsupported files were removed.");
    }

    setFiles(pdfFiles);

    if (pdfFiles.length) {
      const previousDefaultName = files.length ? getDefaultJobName(files) : "";
      if (!jobName || jobName === previousDefaultName) {
        setJobName(getDefaultJobName(pdfFiles));
      }
    } else if (files.length && jobName === getDefaultJobName(files)) {
      setJobName("");
    }
  };

  const handleSaveDraft = async () => {
    setError("");
    setSuccess("");

    if (files.length === 0) {
      setError("Choose a PDF file before saving a draft.");
      return;
    }

    if (files.some((file) => !isPdfFile(file))) {
      setError(
        "Only PDF drafts can be saved right now. Convert DOCX, PPTX, XLSX, or images to PDF first.",
      );
      return;
    }

    setSavingDraft(true);

    try {
      const metadata = {
        queueId: selectedQueueId,
        documentName: jobName || getDefaultJobName(files),
        copies,
        colorMode,
        mode: printMode,
        paperSize,
        quality: "Normal",
        clientType: "Web Print Draft",
      };
      const data =
        files.length === 1
          ? await apiUpload<PrintDraftSaveResponse>({
              path: "/user/jobs/drafts",
              scope: "user",
              file: files[0],
              metadata,
            })
          : await apiUploadBatch<PrintDraftSaveResponse>({
              path: "/user/jobs/drafts/batch",
              scope: "user",
              files,
              metadata,
            });

      setSuccess(`Draft "${data.draft.name}" was saved.`);
      setDraftPanelOpen(true);
      await loadDrafts();
    } catch (draftError) {
      setError(
        draftError instanceof Error
          ? draftError.message
          : "Unable to save the print draft.",
      );
    } finally {
      setSavingDraft(false);
    }
  };

  const handleRestoreDraft = async (draft: PrintDraftItem) => {
    setError("");
    setSuccess("");
    setDraftActionId(draft.id);

    try {
      if (draft.files.length === 0) {
        throw new Error("This draft does not include a stored file.");
      }

      const lastSavedAt = draft.lastSavedAt ? new Date(draft.lastSavedAt).getTime() : 0;
      const restoredFiles = await Promise.all(
        draft.files.map(async (draftFile) => {
          const blob = await apiDownload(
            `/user/jobs/drafts/${draft.id}/files/${draftFile.id}`,
            "user",
          );

          return new File([blob], draftFile.name, {
            type: draftFile.type || blob.type || "application/pdf",
            lastModified: Number.isFinite(lastSavedAt) ? lastSavedAt : 0,
          });
        }),
      );

      setFiles(restoredFiles);
      setJobName(draft.settings.documentName || draft.documentName || draft.name);
      setCopies(Math.max(1, Number(draft.settings.copies || 1)));
      setColorMode(draft.settings.colorMode || "Black & White");
      setPrintMode(draft.settings.mode || "Simplex");
      setPaperSize(draft.settings.paperSize || "A4");

      if (
        draft.settings.queueId &&
        queues.some((queue) => queue.id === draft.settings.queueId)
      ) {
        setSelectedQueueId(draft.settings.queueId);
      }

      setSuccess(`Draft "${draft.name}" was restored. Review it, then upload and queue when ready.`);
      setDraftPanelOpen(false);
    } catch (draftError) {
      setError(
        draftError instanceof Error
          ? draftError.message
          : "Unable to restore this print draft.",
      );
    } finally {
      setDraftActionId("");
    }
  };

  const handleDeleteDraft = async (draft: PrintDraftItem) => {
    setError("");
    setSuccess("");
    setDraftActionId(draft.id);

    try {
      await apiDelete(`/user/jobs/drafts/${draft.id}`, "user");
      setDrafts((currentDrafts) =>
        currentDrafts.filter((currentDraft) => currentDraft.id !== draft.id),
      );
      setSuccess(`Draft "${draft.name}" was deleted.`);
    } catch (draftError) {
      setError(
        draftError instanceof Error
          ? draftError.message
          : "Unable to delete this print draft.",
      );
    } finally {
      setDraftActionId("");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setQueuedJob(null);
    setDispatchSummary(null);

    if (files.length === 0) {
      setError("Please choose at least one PDF file before printing.");
      return;
    }

    if (!selectedQueueId) {
      setError("Please choose the Secure Release queue before submitting the job.");
      return;
    }

    if (!selectedQueue || !isSecureReleaseQueue(selectedQueue)) {
      setError("Please choose a valid Secure Release queue before submitting the job.");
      return;
    }

    if (files.some((file) => !isPdfFile(file))) {
      setError(
        "Only PDF files can be printed right now. Convert DOCX, PPTX, XLSX, or images to PDF before upload.",
      );
      return;
    }

    setSubmitting(true);

    try {
      const metadata = {
        queueId: selectedQueueId,
        documentName: jobName || getDefaultJobName(files),
        copies,
        colorMode,
        mode: printMode,
        paperSize,
        quality: "Normal",
        clientType: "Web Print",
      };
      const data =
        files.length === 1
          ? await apiUpload<UploadedJobResponse>({
              path: "/user/jobs/upload-print",
              scope: "user",
              file: files[0],
              metadata,
            })
          : await apiUploadBatch<UploadedJobResponse>({
              path: "/user/jobs/upload-print-batch",
              scope: "user",
              files,
              metadata,
            });

      setSuccess(
        `Print job ${data.job.jobId} was queued in ${data.job.queueName || selectedQueue?.name || "the selected queue"} with ${data.job.fileCount || files.length} file${(data.job.fileCount || files.length) === 1 ? "" : "s"}.`,
      );
      setQueuedJob(data.job);
      setDispatchSummary(data.dispatch || null);
      setFiles([]);
      setJobName("");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit the print job.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative space-y-6">
      <PageIntro
        title="Upload a Document"
        description="Upload your document, choose a print queue, configure print settings, and submit it for secure release."
      />

      <form className="space-y-6" onSubmit={handleSubmit}>
        <FileUpload
          value={files}
          onChange={handleFilesChange}
          onReject={(message) => setError(message)}
          multiple
          maxFiles={maxFiles}
          accept={PDF_ACCEPT}
          title="Upload a Document"
          description="Upload one or more PDF documents. They are stored securely until release. Office and image files need server-side PDF conversion before they can be queued."
          emptyHelperText={`Upload up to ${maxFiles} PDF files. Convert DOCX, PPTX, XLSX, or images to PDF before upload.`}
          showDraftActions={false}
        />

        <section
          className="rounded-2xl border px-5 py-4"
          style={{
            borderColor: "var(--border)",
            background: "var(--surface)",
          }}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[var(--title)]">
                <Archive className="h-5 w-5 text-[var(--color-brand-500)]" />
                <h2 className="text-base font-semibold">Drafts</h2>
              </div>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Save the current file and settings, restore them later, or remove drafts you no longer need.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={files.length === 0 || savingDraft}
                onClick={handleSaveDraft}
                iconLeft={<Archive className="h-4 w-4" />}
              >
                {savingDraft ? "Saving..." : "Save draft"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDraftPanelOpen(true)}
                iconLeft={<PanelRightOpen className="h-4 w-4" />}
              >
                Drafts ({drafts.length})
              </Button>
            </div>
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-2">
          <section className="card rounded-2xl p-6">
            <h2 className="title-md">Job Details</h2>
            <div className="mt-5 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--muted)]">
                  Job name
                </label>
                <Input
                  value={jobName}
                  onChange={(event) => setJobName(event.target.value)}
                  placeholder="Document name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--muted)]">
                  Queue
                </label>
                <ListBox
                  value={selectedQueueId}
                  onValueChange={(value) => setSelectedQueueId(value)}
                  options={queueOptions}
                  placeholder={selectedQueue?.name || "Select queue"}
                  triggerClassName="h-12 w-full"
                  contentClassName="w-full"
                  ariaLabel="Select queue"
                  emptyText="No Secure Release queues available"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--muted)]">
                  Assigned printers
                </label>
                <div
                  className="rounded-xl border px-4 py-3 text-sm"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--surface-2)",
                    color: "var(--title)",
                  }}
                >
                  {selectedQueuePrinterTargets.length > 0 ? (
                    <ul className="space-y-2">
                      {selectedQueuePrinterTargets.map((printer) => (
                        <li
                          key={printer.id || printer.name}
                          className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <span className="font-medium">
                            {printer.name || "Assigned printer"}
                          </span>
                          <span className="text-xs text-[var(--muted)]">
                            {getPrinterTargetMeta(printer)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="font-medium">
                      Assigned automatically from the queue
                    </p>
                  )}
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    The dropdown selects a queue. The backend targets every active, online printer assigned to it.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="card rounded-2xl p-6">
            <h2 className="title-md">Print Settings</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--muted)]">
                  Copies
                </label>
                <Input
                  type="number"
                  min={1}
                  value={copies}
                  onChange={(event) =>
                    setCopies(Math.max(1, Number(event.target.value || 1)))
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--muted)]">
                  Color
                </label>
                <ListBox
                  value={colorMode}
                  onValueChange={(value) => setColorMode(value)}
                  options={COLOR_OPTIONS}
                  triggerClassName="h-12 w-full"
                  contentClassName="w-full"
                  ariaLabel="Select color mode"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--muted)]">
                  Sides
                </label>
                <ListBox
                  value={printMode}
                  onValueChange={(value) => setPrintMode(value)}
                  options={DUPLEX_OPTIONS}
                  placeholder="Select mode"
                  triggerClassName="h-12 w-full"
                  contentClassName="w-full"
                  ariaLabel="Select print sides"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--muted)]">
                  Paper Size
                </label>
                <ListBox
                  value={paperSize}
                  onValueChange={(value) => setPaperSize(value)}
                  options={PAPER_SIZE_OPTIONS}
                  placeholder="Select paper size"
                  triggerClassName="h-12 w-full"
                  contentClassName="w-full"
                  ariaLabel="Select paper size"
                />
              </div>
            </div>

            <div
              className="mt-6 rounded-2xl border px-4 py-4 text-sm"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface-2)",
              }}
            >
              <p className="font-semibold text-[var(--title)]">
                Selected destination
              </p>
              <p className="mt-2 text-[var(--paragraph)]">
                {selectedQueuePrinterNames.length > 0 && selectedQueue
                  ? `${selectedQueuePrinterNames.join(", ")} via ${selectedQueue.name}`
                  : "The queue will resolve the assigned printer automatically."}
              </p>
              <p className="mt-1 text-[var(--muted)]">
                {selectedQueue?.description ||
                  "The backend stores this job first, then dispatches it when the queue is released."}
              </p>
            </div>
          </section>
        </div>

        {loading ? (
          <p className="text-sm text-[var(--muted)]">Loading queue options...</p>
        ) : null}

        {error ? (
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        ) : null}

        {success ? (
          <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-green-800">
            <p className="text-sm font-semibold">{success}</p>
            {queuedJob ? (
              <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-md bg-white text-green-700">
                    <KeyRound className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-green-700">
                      Printer release code
                    </p>
                    <p className="font-mono text-3xl font-semibold tracking-[0.22em]">
                      {queuedJob.releaseCode || "------"}
                    </p>
                    {dispatchSummary ? (
                      <p className="mt-2 text-sm font-medium text-green-700">
                        Sent to {dispatchSummary.destinationCount || 1} configured{" "}
                        printer{(dispatchSummary.destinationCount || 1) === 1 ? "" : "s"}
                        {dispatchSummary.failureCount
                          ? `, ${dispatchSummary.failureCount} additional dispatch warning${dispatchSummary.failureCount === 1 ? "" : "s"} logged`
                          : ""}
                        .
                      </p>
                    ) : null}
                  </div>
                </div>

                <Link href="/sections/printer">
                  <Button
                    variant="primary"
                    iconLeft={<MonitorUp className="h-5 w-5" />}
                    className="w-full lg:w-auto"
                  >
                    Open Printer Screen
                  </Button>
                </Link>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="flex justify-end">
          <Button
            type="submit"
            size="lg"
            className="w-full lg:w-auto"
            disabled={
              loading ||
              submitting ||
              files.length === 0 ||
              !selectedQueue ||
              !isSecureReleaseQueue(selectedQueue)
            }
          >
            {submitting ? "Queuing job..." : "Upload and Queue"}
          </Button>
        </div>
      </form>

      {draftPanelOpen ? (
        <aside
          className="absolute right-0 top-0 z-30 flex h-[calc(100dvh-8rem)] max-h-[calc(100dvh-8rem)] w-full max-w-md flex-col rounded-2xl border shadow-2xl"
          style={{
            borderColor: "var(--border)",
            background: "var(--surface)",
            color: "var(--foreground)",
          }}
          aria-label="Print drafts panel"
        >
          <div
            className="flex items-start justify-between gap-4 border-b px-5 py-5"
            style={{ borderColor: "var(--border)" }}
          >
            <div>
              <p className="flex items-center gap-2 text-lg font-semibold text-[var(--title)]">
                <Archive className="h-5 w-5 text-[var(--color-brand-500)]" />
                Print drafts
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Restore saved files and settings into this print form.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setDraftPanelOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-md border transition hover:bg-[var(--surface-2)]"
              style={{ borderColor: "var(--border)" }}
              aria-label="Close drafts panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 px-5 py-4">
            <p className="text-sm text-[var(--muted)]">
              {drafts.length} saved draft{drafts.length === 1 ? "" : "s"}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={loadDrafts}
              disabled={draftsLoading}
              iconLeft={<RotateCcw className="h-4 w-4" />}
            >
              Refresh
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-5">
            {draftsLoading ? (
              <p className="rounded-xl border px-4 py-3 text-sm text-[var(--muted)]" style={{ borderColor: "var(--border)" }}>
                Loading drafts...
              </p>
            ) : null}

            {!draftsLoading && drafts.length === 0 ? (
              <div
                className="rounded-2xl border px-5 py-6 text-center"
                style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
              >
                <FileText className="mx-auto h-8 w-8 text-[var(--muted)]" />
                <p className="mt-3 font-semibold text-[var(--title)]">
                  No drafts yet
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Upload a PDF, choose settings, then save it as a draft.
                </p>
              </div>
            ) : null}

            <div className="space-y-3">
              {drafts.map((draft) => {
                const firstFile = draft.files[0];
                const actionInProgress = draftActionId === draft.id;

                return (
                  <article
                    key={draft.id}
                    className="rounded-2xl border p-4"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--surface-2)",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border"
                        style={{
                          borderColor: "var(--border)",
                          background: "var(--surface)",
                          color: "var(--color-brand-500)",
                        }}
                      >
                        <FileText className="h-5 w-5" />
                      </span>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold text-[var(--title)]">
                          {draft.name}
                        </h3>
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          {draft.fileCount} file{draft.fileCount === 1 ? "" : "s"}
                          {firstFile ? ` - ${formatFileSize(firstFile.size)}` : ""}
                        </p>
                        <p className="mt-2 flex items-center gap-1 text-xs text-[var(--muted)]">
                          <Clock3 className="h-3.5 w-3.5" />
                          {formatDraftDate(draft.lastSavedAt)}
                        </p>
                      </div>
                    </div>

                    <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg bg-[var(--surface)] px-3 py-2">
                        <dt className="text-[var(--muted)]">Queue</dt>
                        <dd className="mt-1 truncate font-medium text-[var(--title)]">
                          {draft.settings.queueName || "Not selected"}
                        </dd>
                      </div>
                      <div className="rounded-lg bg-[var(--surface)] px-3 py-2">
                        <dt className="text-[var(--muted)]">Settings</dt>
                        <dd className="mt-1 truncate font-medium text-[var(--title)]">
                          {draft.settings.copies || 1}x, {draft.settings.colorMode}, {draft.settings.mode}, {draft.settings.paperSize || "A4"}
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        disabled={actionInProgress}
                        onClick={() => handleRestoreDraft(draft)}
                      >
                        {actionInProgress ? "Restoring..." : "Restore"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={actionInProgress}
                        onClick={() => handleDeleteDraft(draft)}
                        iconLeft={<Trash2 className="h-4 w-4" />}
                      >
                        Delete
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </aside>
      ) : null}
    </div>
  );
};

export default Page;
