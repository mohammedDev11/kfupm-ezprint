"use client";

import PageIntro from "@/components/shared/page/Text/PageIntro";
import Button from "@/components/ui/button/Button";
import { FileUpload } from "@/components/ui/button/file-upload";
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from "@/components/ui/dropdown/Dropdown";
import Input from "@/components/ui/input/Input";
import { apiGet, apiUpload } from "@/services/api";
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
  };
  dispatch?: {
    method: string;
    destinationName: string;
    bytesSent: number;
  };
};

const COLOR_OPTIONS = ["Black & White", "Color"];
const DUPLEX_OPTIONS = [
  { value: "Simplex", label: "Single-sided" },
  { value: "Duplex", label: "Double-sided" },
];

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

  useEffect(() => {
    let mounted = true;

    apiGet<PrintOptionsResponse>("/user/jobs/options", "user")
      .then((data) => {
        if (!mounted) {
          return;
        }

        setQueues(data.queues || []);
        setSelectedQueueId(data.defaultQueueId || data.queues?.[0]?.id || "");
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
    if (!files.length) {
      return;
    }

    if (!jobName) {
      setJobName(files[0].name.replace(/\.[^.]+$/, ""));
    }
  }, [files, jobName]);

  const selectedQueue = useMemo(
    () => queues.find((queue) => queue.id === selectedQueueId) || null,
    [queues, selectedQueueId],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const file = files[0];

    if (!file) {
      setError("Please choose a PDF file before printing.");
      return;
    }

    if (!selectedQueueId) {
      setError("Please choose a queue before submitting the job.");
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
        `Print job ${data.job.jobId} was queued in ${data.job.queueName || selectedQueue?.name || "the selected queue"} for release on ${data.job.printerName || selectedQueue?.printerName || "the assigned printer"}.`,
      );
      setFiles([]);
      setJobName("");
      router.refresh();

      setTimeout(() => {
        router.push("/sections/user/pending-jobs");
      }, 1200);
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
          onChange={setFiles}
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
                <Dropdown
                  value={selectedQueueId}
                  onValueChange={(value) => setSelectedQueueId(value)}
                  fullWidth
                >
                  <DropdownTrigger className="h-12 w-full">
                    {selectedQueue?.name || "Select queue"}
                  </DropdownTrigger>
                  <DropdownContent widthClassName="w-full">
                    {queues.map((queue) => (
                      <DropdownItem key={queue.id} value={queue.id}>
                        {queue.name}
                      </DropdownItem>
                    ))}
                  </DropdownContent>
                </Dropdown>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--muted)]">
                  Resolved printer
                </label>
                <div
                  className="rounded-xl border px-4 py-3 text-sm"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--surface-2)",
                    color: "var(--title)",
                  }}
                >
                  <p className="font-medium">
                    {selectedQueue?.printerName || "Assigned automatically from the queue"}
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    The backend resolves the physical printer from the selected queue.
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
                <Dropdown
                  value={colorMode}
                  onValueChange={(value) => setColorMode(value)}
                  fullWidth
                >
                  <DropdownTrigger className="h-12 w-full">
                    {colorMode}
                  </DropdownTrigger>
                  <DropdownContent widthClassName="w-full">
                    {COLOR_OPTIONS.map((option) => (
                      <DropdownItem key={option} value={option}>
                        {option}
                      </DropdownItem>
                    ))}
                  </DropdownContent>
                </Dropdown>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-[var(--muted)]">
                  Sides
                </label>
                <Dropdown
                  value={printMode}
                  onValueChange={(value) => setPrintMode(value)}
                  fullWidth
                >
                  <DropdownTrigger className="h-12 w-full">
                    {DUPLEX_OPTIONS.find((option) => option.value === printMode)?.label ||
                      "Select mode"}
                  </DropdownTrigger>
                  <DropdownContent widthClassName="w-full">
                    {DUPLEX_OPTIONS.map((option) => (
                      <DropdownItem key={option.value} value={option.value}>
                        {option.label}
                      </DropdownItem>
                    ))}
                  </DropdownContent>
                </Dropdown>
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
                {selectedQueue?.printerName
                  ? `${selectedQueue.printerName} via ${selectedQueue.name}`
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
          <p className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </p>
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
              !selectedQueueId
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
