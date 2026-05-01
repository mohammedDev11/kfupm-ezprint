"use client";

import PageIntro from "@/components/shared/page/Text/PageIntro";
import Button from "@/components/ui/button/Button";
import { FileUpload } from "@/components/ui/button/file-upload";
import Input from "@/components/ui/input/Input";
import ListBox from "@/components/ui/listbox/ListBox";
import { apiGet, apiUpload } from "@/services/api";
import { KeyRound, MonitorUp } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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
  };
  dispatch?: {
    method: string;
    destinationName: string;
    bytesSent: number;
    destinationCount?: number;
    failureCount?: number;
  };
};

const COLOR_OPTIONS = ["Black & White", "Color"];
const DUPLEX_OPTIONS = [
  { value: "Simplex", label: "Single-sided" },
  { value: "Duplex", label: "Double-sided" },
];

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

const Page = () => {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [jobName, setJobName] = useState("");
  const [queues, setQueues] = useState<PrintQueueOption[]>([]);
  const [selectedQueueId, setSelectedQueueId] = useState("");
  const [copies, setCopies] = useState(1);
  const [colorMode, setColorMode] = useState("Black & White");
  const [printMode, setPrintMode] = useState("Simplex");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [queuedJob, setQueuedJob] = useState<UploadedJobResponse["job"] | null>(null);
  const [dispatchSummary, setDispatchSummary] =
    useState<UploadedJobResponse["dispatch"] | null>(null);

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
    setFiles(nextFiles);

    if (nextFiles.length && !jobName) {
      setJobName(nextFiles[0].name.replace(/\.[^.]+$/, ""));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setQueuedJob(null);
    setDispatchSummary(null);

    const file = files[0];

    if (!file) {
      setError("Please choose a PDF file before printing.");
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

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Tomorrow's real print demo supports PDF uploads only.");
      return;
    }

    setSubmitting(true);

    try {
      const data = await apiUpload<UploadedJobResponse>({
        path: "/user/jobs/upload-print",
        scope: "user",
        file,
        metadata: {
          queueId: selectedQueueId,
          documentName: jobName || file.name.replace(/\.[^.]+$/, ""),
          copies,
          colorMode,
          mode: printMode,
          paperSize: "A4",
          quality: "Normal",
          clientType: "Web Print",
        },
      });

      setSuccess(
        `Print job ${data.job.jobId} was queued in ${data.job.queueName || selectedQueue?.name || "the selected queue"}.`,
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
    <div className="space-y-6">
      <PageIntro
        title="Web Print"
        description="Upload a real PDF, choose a queue, and store the job for secure release without manually selecting a printer."
      />

      <form className="space-y-6" onSubmit={handleSubmit}>
        <FileUpload
          value={files}
          onChange={handleFilesChange}
          multiple={false}
          maxFiles={1}
          accept={{ "application/pdf": [".pdf"] }}
          title="Upload a PDF"
          description="For tomorrow's lab demo, PDF uploads are stored in the database first and routed to the queue's assigned printer at release time."
        />

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

              <div className="space-y-2 md:col-span-2">
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
    </div>
  );
};

export default Page;
