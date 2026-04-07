"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="w-full max-w-lg rounded-2xl border border-violet-100 bg-white p-0 shadow-2xl backdrop:bg-black/20 backdrop:backdrop-blur-[2px]"
    >
      <div className="flex items-center justify-between border-b border-violet-50 px-6 py-5">
        <h2 className="text-base font-bold text-violet-950">{title}</h2>
        <button
          onClick={onClose}
          className="rounded-full p-1.5 text-violet-400 transition-colors hover:bg-violet-50 hover:text-violet-700"
          aria-label="Tutup"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-8 py-6">{children}</div>
    </dialog>
  );
}
