"use client";

import {
  useEffect,
  useId,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type ModalSize = "sm" | "md" | "lg";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  size?: ModalSize;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
}

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;
let openModalCount = 0;
let previousBodyOverflow = "";

export function Modal({ open, ...props }: ModalProps) {
  const mounted = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  if (!open || !mounted) return null;

  return createPortal(<ModalDialog {...props} />, document.body);
}

function ModalDialog({
  onClose,
  title,
  description,
  children,
  size = "md",
  closeOnBackdrop = true,
  closeOnEscape = true,
}: Omit<ModalProps, "open">) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;

    const previous = document.activeElement;
    if (!element.open) element.showModal();

    return () => {
      if (element.open) element.close();
      if (previous instanceof HTMLElement && previous.isConnected) {
        previous.focus();
      }
    };
  }, []);

  useEffect(() => {
    if (openModalCount === 0) {
      previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    openModalCount += 1;
    return () => {
      openModalCount -= 1;
      if (openModalCount === 0) {
        document.body.style.overflow = previousBodyOverflow;
      }
    };
  }, []);

  return (
    <dialog
      ref={dialog}
      className={`modal modal-${size}`}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (closeOnEscape) onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && closeOnBackdrop) {
          onClose();
        }
      }}
    >
      <div className="modal-panel">
        <header className="modal-header">
          <h2 id={titleId}>{title}</h2>
          {description && <p id={descriptionId}>{description}</p>}
        </header>
        <div className="modal-body">{children}</div>
        <button
          className="modal-close"
          type="button"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>
    </dialog>
  );
}
