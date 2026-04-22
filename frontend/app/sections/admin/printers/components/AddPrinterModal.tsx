"use client";

import React from "react";
import { Printer } from "lucide-react";
import Modal from "@/components/ui/modal/Modal";
import type { PrinterItem } from "@/lib/mock-data/Admin/printers";

type PrinterDetailsModalProps = {
  open: boolean;
  onClose: () => void;
  printer: PrinterItem | null;
};

const Row = ({ label, value }: { label: string; value?: React.ReactNode }) => {
  if (!value && value !== 0) return null;

  return (
    <div
      className="flex items-start justify-between gap-4 rounded-xl px-4 py-3"
      style={{ background: "var(--surface-2)" }}
    >
      <span className="text-sm font-medium text-[var(--muted)]">{label}</span>
      <span className="text-right text-sm font-semibold text-[var(--foreground)]">
        {value}
      </span>
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
      <div className="min-w-[320px] space-y-6 md:min-w-[760px]">
        <div className="flex items-start gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ background: "var(--surface-2)" }}
          >
            <Printer className="h-7 w-7 text-brand-500" />
          </div>

          <div>
            <h2 className="title-md">{printer.name}</h2>
            <p className="paragraph mt-1">{printer.location}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <span className="inline-flex rounded-full bg-[var(--surface-2)] px-4 py-2 text-sm font-semibold text-[var(--foreground)]">
            {printer.status}
          </span>

          {printer.capabilities.map((capability) => (
            <span
              key={capability}
              className="inline-flex rounded-full border px-4 py-2 text-sm font-medium"
              style={{
                borderColor: "var(--border)",
                color: "var(--paragraph)",
              }}
            >
              {capability}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Row label="Model" value={printer.model} />
          <Row label="Department" value={printer.department} />
          <Row label="Building" value={printer.building} />
          <Row label="Room" value={printer.room} />
          <Row label="Queue Name" value={printer.queueName} />
          <Row label="IP Address" value={printer.ipAddress} />
          <Row label="Serial Number" value={printer.serialNumber} />
          <Row label="Device Type" value={printer.deviceType} />
          <Row label="Pages Printed" value={printer.totalPagesPrinted} />
          <Row label="Jobs Submitted" value={printer.totalJobsSubmitted} />
          <Row
            label="Cost Per Page"
            value={`${printer.costPerPage.toFixed(2)} SAR`}
          />
          <Row label="Toner Level" value={`${printer.tonerLevel}%`} />
          <Row label="Paper Level" value={`${printer.paperLevel}%`} />
          <Row label="Last Used" value={printer.lastUsed} />
        </div>

        {printer.notes ? (
          <div
            className="rounded-2xl px-4 py-4"
            style={{ background: "var(--surface-2)" }}
          >
            <p className="text-sm font-medium text-[var(--muted)]">Notes</p>
            <p className="mt-1 text-sm text-[var(--foreground)]">
              {printer.notes}
            </p>
          </div>
        ) : null}
      </div>
    </Modal>
  );
};

export default PrinterDetailsModal;
