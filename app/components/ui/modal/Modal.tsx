"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

const Modal = ({ open, onClose, children }: ModalProps) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurred Background */}
      <div
        onClick={onClose}
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: "rgba(0,0,0,0.25)" }}
      />

      {/* Modal Box */}
      <div
        className="relative max-h-[90vh] w-fit max-w-[min(96vw,1100px)] overflow-y-auto rounded-2xl p-6 shadow-xl"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg transition"
          style={{ background: "var(--surface-2)" }}
        >
          <X size={18} />
        </button>

        {/* Content */}
        <div className="pr-12">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
