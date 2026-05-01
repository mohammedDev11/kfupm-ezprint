"use client";

import { AlertTriangle } from "lucide-react";
import Button from "@/components/ui/button/Button";
import Modal from "@/components/ui/modal/Modal";
import type { ReactNode } from "react";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmText?: string;
  cancelText?: string;
  loadingText?: string;
  variant?: "default" | "danger";
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  onCancel?: () => void;
};

const dangerButtonStyle = {
  borderColor: "color-mix(in srgb, rgb(239, 68, 68) 26%, var(--border))",
  background: "color-mix(in srgb, rgb(239, 68, 68) 10%, var(--surface))",
  color: "color-mix(in srgb, rgb(185, 28, 28) 76%, var(--foreground))",
};

const ConfirmDialog = ({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  loadingText = "Working...",
  variant = "default",
  loading = false,
  onConfirm,
  onClose,
  onCancel,
}: ConfirmDialogProps) => {
  const handleClose = () => {
    if (loading) return;
    (onCancel ?? onClose)();
  };

  return (
    <Modal open={open} onClose={handleClose} className="max-w-[min(92vw,460px)]">
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border"
            style={{
              borderColor:
                variant === "danger"
                  ? "color-mix(in srgb, rgb(239, 68, 68) 24%, var(--border))"
                  : "var(--border)",
              background:
                variant === "danger"
                  ? "color-mix(in srgb, rgb(239, 68, 68) 9%, var(--surface-2))"
                  : "var(--surface-2)",
              color:
                variant === "danger"
                  ? "color-mix(in srgb, rgb(185, 28, 28) 76%, var(--foreground))"
                  : "var(--color-brand-500)",
            }}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>

          <div className="min-w-0 space-y-2">
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              {title}
            </h2>
            <div className="text-sm leading-6 text-[var(--paragraph)]">
              {description}
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            className="h-11 px-5 text-sm"
            disabled={loading}
            onClick={handleClose}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === "danger" ? "outline" : "primary"}
            className="h-11 px-5 text-sm"
            disabled={loading}
            style={variant === "danger" ? dangerButtonStyle : undefined}
            onClick={() => void onConfirm()}
          >
            {loading ? loadingText : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
