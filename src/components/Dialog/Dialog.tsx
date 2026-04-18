import React from "react";
import ReactDOM from "react-dom";

import type { BaseProps } from "@types/common";
import { classNames } from "@utils/classNames";

import "../../../tokens/_tier2-overlay.scss";
import "./Dialog.scss";

type DialogSize = "sm" | "md" | "lg" | "fullscreen";

const DIALOG_SIZES: ReadonlyArray<DialogSize> = ["sm", "md", "lg", "fullscreen"];

function normalizeSize(value: DialogSize | undefined): DialogSize {
  if (value && DIALOG_SIZES.includes(value)) {
    return value;
  }
  return "md";
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selectors = [
    "a[href]",
    "button:not([disabled])",
    "textarea:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ].join(",");

  return Array.from(container.querySelectorAll<HTMLElement>(selectors)).filter((element) => {
    return !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true";
  });
}

export interface DialogProps extends Omit<BaseProps, "as" | "size" | "variant" | "isDisabled"> {
  open: boolean;
  onClose: () => void;
  size?: DialogSize;
  label?: string;
  ariaLabel?: string;
  persistent?: boolean;
  showCloseButton?: boolean;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

const Dialog = React.forwardRef<HTMLElement, DialogProps>(function Dialog(
  {
    className,
    open,
    onClose,
    size = "md",
    label,
    ariaLabel,
    persistent = false,
    showCloseButton = true,
    footer,
    children,
    ...rest
  },
  ref,
) {
  const [mounted, setMounted] = React.useState(false);
  const dialogRef = React.useRef<HTMLElement | null>(null);
  const titleId = React.useId().replace(/[:]/g, "");
  const labeledById = label ? `ds-dialog-title-${titleId}` : undefined;
  const normalizedSize = normalizeSize(size);
  const previouslyFocusedElementRef = React.useRef<HTMLElement | null>(null);

  const setPanelRef = React.useCallback(
    (node: HTMLElement | null) => {
      dialogRef.current = node;
      if (!ref) {
        return;
      }

      if (typeof ref === "function") {
        ref(node);
      } else {
        ref.current = node;
      }
    },
    [ref],
  );

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted || !open) {
      return;
    }

    previouslyFocusedElementRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    const body = document.body;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    const dialogElement = dialogRef.current;
    if (dialogElement) {
      const focusables = getFocusableElements(dialogElement);
      const first = focusables[0] ?? dialogElement;
      first.focus();
    }

    return () => {
      body.style.overflow = previousOverflow;

      const previous = previouslyFocusedElementRef.current;
      if (previous && typeof previous.focus === "function") {
        previous.focus();
      }
    };
  }, [mounted, open]);

  React.useEffect(() => {
    if (!mounted || !open) {
      return;
    }

    const onDocumentKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape" && !persistent) {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", onDocumentKeyDown);
    return () => {
      document.removeEventListener("keydown", onDocumentKeyDown);
    };
  }, [mounted, onClose, open, persistent]);

  const handleBackdropClick = (): void => {
    if (!persistent) {
      onClose();
    }
  };

  const handlePanelKeyDown: React.KeyboardEventHandler<HTMLElement> = (event) => {
    if (event.key !== "Tab") {
      return;
    }

    const dialogElement = dialogRef.current;
    if (!dialogElement) {
      return;
    }

    const focusableElements = getFocusableElements(dialogElement);
    if (!focusableElements.length) {
      event.preventDefault();
      dialogElement.focus();
      return;
    }

    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  if (!mounted) {
    return null;
  }

  return ReactDOM.createPortal(
    <div
      className={classNames(
        "ds-dialog",
        {
          "ds-dialog--open": open,
          "ds-dialog--closed": !open,
        },
      )}
      aria-hidden={!open}
    >
      <div className="ds-dialog__backdrop" aria-hidden="true" onClick={handleBackdropClick} />

      <section
        {...rest}
        ref={setPanelRef}
        className={classNames("ds-dialog__panel", `ds-dialog__panel--${normalizedSize}`, className)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labeledById}
        aria-label={labeledById ? undefined : ariaLabel ?? label ?? "Dialog"}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handlePanelKeyDown}
      >
        <header className="ds-dialog__header">
          {label ? <h2 className="ds-dialog__title" id={labeledById}>{label}</h2> : null}
          {showCloseButton ? (
            <button className="ds-dialog__close" type="button" aria-label="Close dialog" onClick={onClose}>
              &times;
            </button>
          ) : null}
        </header>

        <div className="ds-dialog__body">{children}</div>

        {footer ? <footer className="ds-dialog__footer">{footer}</footer> : null}
      </section>
    </div>,
    document.body,
  );
});

Dialog.displayName = "Dialog";

export default Dialog;

export function DialogExample(): React.JSX.Element {
  const [open, setOpen] = React.useState(false);

  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>Open Dialog</button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        label="Delete product"
        size="md"
        footer={
          <>
            <button type="button" onClick={() => setOpen(false)}>Cancel</button>
            <button type="button" onClick={() => setOpen(false)}>Confirm</button>
          </>
        }
      >
        This action cannot be undone.
      </Dialog>
    </div>
  );
}