import React from "react";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  icon?: string;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  icon = "warning",
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-charcoal/40 backdrop-blur-sm">
      <div className="bg-paper-base border-[2px] border-ink-charcoal rounded-2xl p-6 md:p-8 shadow-[8px_8px_0px_#171717] max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-sticker-pink/30 border-[1.5px] border-ink-charcoal rounded-full flex items-center justify-center shadow-[2px_2px_0px_#171717] -rotate-3 mb-2">
            <span className="material-symbols-outlined text-[32px] text-ink-charcoal">{icon}</span>
          </div>
          <h3 className="font-headline text-xl font-bold text-ink-charcoal">
            {title}
          </h3>
          <p className="font-mono-tag text-sm text-ink-charcoal/80 leading-relaxed">
            {description}
          </p>
          <div className="flex w-full gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-paper-warm hover:bg-paper-warm/80 text-ink-charcoal border-[1.5px] border-ink-charcoal shadow-[2px_2px_0px_#171717] rounded-full px-4 py-2.5 font-mono-tag text-xs font-semibold hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 bg-sticker-pink hover:bg-sticker-pink/80 text-ink-charcoal border-[1.5px] border-ink-charcoal shadow-[2px_2px_0px_#171717] rounded-full px-4 py-2.5 font-mono-tag text-xs font-bold hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
