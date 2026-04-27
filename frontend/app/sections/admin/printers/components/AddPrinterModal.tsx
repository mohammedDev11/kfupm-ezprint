"use client";

import React from "react";
import {
  Activity,
  FileText,
  Info,
  MapPin,
  Printer,
  Settings2,
} from "lucide-react";
import Modal from "@/components/ui/modal/Modal";
import type { PrinterItem, PrinterStatus } from "@/lib/mock-data/Admin/printers";

type PrinterDetailsModalProps = {
  open: boolean;
  onClose: () => void;
  printer: PrinterItem | null;
};

const statusToneStyles: Record<PrinterStatus, React.CSSProperties> = {
  Online: {
    borderColor: "color-mix(in srgb, var(--color-support-500) 24%, transparent)",
    background: "color-mix(in srgb, var(--color-support-500) 12%, var(--surface))",
    color: "color-mix(in srgb, var(--color-support-700) 76%, var(--title))",
  },
  Offline: {
    borderColor: "var(--border)",
    background: "color-mix(in srgb, var(--surface-3) 44%, var(--surface))",
    color: "var(--muted)",
  },
  "Low Toner": {
    borderColor: "color-mix(in srgb, var(--color-warning-500) 24%, transparent)",
    background: "color-mix(in srgb, var(--color-warning-500) 12%, var(--surface))",
    color: "color-mix(in srgb, var(--color-warning-600) 78%, var(--title))",
  },
  "Paper Jam": {
    borderColor: "color-mix(in srgb, var(--color-brand-600) 24%, transparent)",
    background: "color-mix(in srgb, var(--color-brand-500) 13%, var(--surface))",
    color: "color-mix(in srgb, var(--color-brand-700) 82%, var(--title))",
  },
};

const Chip = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) => (
  <span
    className="inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-semibold"
    style={{
      borderColor: "var(--border)",
      color: "var(--paragraph)",
      ...style,
    }}
  >
    {children}
  </span>
);

const SectionCard = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <section
    className="rounded-2xl border p-5"
    style={{
      background: "var(--surface-2)",
      borderColor: "var(--border)",
    }}
  >
    <div className="mb-4 flex items-center gap-2">
      <span className="text-[var(--color-brand-500)]">{icon}</span>
      <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
        {title}
      </h3>
    </div>
    {children}
  </section>
);

const Field = ({ label, value }: { label: string; value?: React.ReactNode }) => {
  if (!value && value !== 0) return null;

  return (
    <div className="min-w-0 rounded-xl bg-[var(--surface)] px-4 py-3">
      <span className="text-sm font-medium text-[var(--muted)]">{label}</span>
      <p className="mt-1 break-words text-sm font-semibold text-[var(--foreground)]">
        {value}
      </p>
    </div>
  );
};

const PrinterDetailsModal = ({
  open,
  onClose,
  printer,
}: PrinterDetailsModalProps) => {
  if (!printer) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="min-w-[320px] max-w-full space-y-6 md:min-w-[760px]">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
              style={{ background: "var(--surface-2)" }}
            >
              <Printer className="h-7 w-7 text-brand-500" />
            </div>

            <div className="min-w-0">
              <h2 className="break-words title-md">{printer.name}</h2>
              <p className="paragraph mt-1 flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="break-words">{printer.location}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Chip style={statusToneStyles[printer.status]}>{printer.status}</Chip>

          {printer.capabilities.map((capability) => (
            <Chip key={capability}>{capability}</Chip>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SectionCard
            title="Basic Info"
            icon={<Info className="h-4 w-4" />}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Model" value={printer.model} />
              <Field label="Department" value={printer.department} />
              <Field label="Building" value={printer.building} />
              <Field label="Room" value={printer.room} />
              <Field label="Device Type" value={printer.deviceType} />
              <Field label="Queue Name" value={printer.queueName} />
            </div>
          </SectionCard>

          <SectionCard
            title="Usage"
            icon={<Activity className="h-4 w-4" />}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Pages Printed" value={printer.totalPagesPrinted} />
              <Field label="Jobs Submitted" value={printer.totalJobsSubmitted} />
              <Field
                label="Cost Per Page"
                value={`${printer.costPerPage.toFixed(2)} SAR`}
              />
              <Field label="IP Address" value={printer.ipAddress} />
            </div>
          </SectionCard>

          <SectionCard
            title="Device Status"
            icon={<Settings2 className="h-4 w-4" />}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Toner Level" value={`${printer.tonerLevel}%`} />
              <Field label="Paper Level" value={`${printer.paperLevel}%`} />
              <Field label="Last Used" value={printer.lastUsed} />
              <Field label="Serial Number" value={printer.serialNumber} />
            </div>
          </SectionCard>

          <div
            className="rounded-2xl border p-5"
            style={{
              background: "var(--surface-2)",
              borderColor: "var(--border)",
            }}
          >
            <div className="mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-[var(--color-brand-500)]" />
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                Notes
              </h3>
            </div>
            <p className="text-sm leading-6 text-[var(--foreground)]">
              {printer.notes || "No notes recorded."}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PrinterDetailsModal;
