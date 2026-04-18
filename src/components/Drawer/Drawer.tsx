import React from "react";
import ReactDOM from "react-dom";

import type { BaseProps } from "@types/common";
import { classNames } from "@utils/classNames";

import "../../../tokens/_tier2-overlay.scss";
import "./Drawer.scss";

type DrawerPlacement = "left" | "right" | "top" | "bottom";
type DrawerSize = "sm" | "md" | "lg";

type DrawerRenderState = "open" | "closing" | null;

const DRAWER_CLOSE_DELAY = 250;
const DRAWER_PLACEMENTS: ReadonlyArray<DrawerPlacement> = ["left", "right", "top", "bottom"];
const DRAWER_SIZES: ReadonlyArray<DrawerSize> = ["sm", "md", "lg"];

function normalizePlacement(value: DrawerPlacement | undefined): DrawerPlacement {
  if (value && DRAWER_PLACEMENTS.includes(value)) {
    return value;
  }
  return "right";
}

function normalizeSize(value: DrawerSize | undefined): DrawerSize {
  if (value && DRAWER_SIZES.includes(value)) {
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

export interface DrawerProps extends Omit<BaseProps, "as" | "size" | "variant" | "isDisabled"> {
  open: boolean;
  onClose: () => void;
  placement?: DrawerPlacement;
  size?: DrawerSize;
  label?: string;
  ariaLabel?: string;
  persistent?: boolean;
  showCloseButton?: boolean;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

const Drawer = React.forwardRef<HTMLElement, DrawerProps>(function Drawer(
  {
    className,
    open,
    onClose,
    placement = "right",
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
  const [renderState, setRenderState] = React.useState<DrawerRenderState>(open ? "open" : null);
  const drawerRef = React.useRef<HTMLElement | null>(null);
  const closeTimerRef = React.useRef<number | null>(null);
  const previousFocusedElementRef = React.useRef<HTMLElement | null>(null);
  const titleId = React.useId().replace(/[:]/g, "");

  const normalizedPlacement = normalizePlacement(placement);
  const normalizedSize = normalizeSize(size);

  const setPanelRef = React.useCallback(
    (node: HTMLElement | null) => {
      drawerRef.current = node;
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
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    if (!mounted) {
      return;
    }

    if (open) {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }

      previousFocusedElementRef.current = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

      setRenderState("open");
      return;
    }

    if (renderState === "open") {
      setRenderState("closing");
      closeTimerRef.current = window.setTimeout(() => {
        setRenderState(null);
        closeTimerRef.current = null;
      }, DRAWER_CLOSE_DELAY);
    }
  }, [mounted, open, renderState]);

  React.useEffect(() => {
    if (!mounted || renderState === null) {
      return;
    }

    const body = document.body;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    if (renderState === "open") {
      const panel = drawerRef.current;
      if (panel) {
        const focusables = getFocusableElements(panel);
        const first = focusables[0] ?? panel;
        first.focus();
      }
    }

    return () => {
      body.style.overflow = previousOverflow;

      if (renderState === "closing") {
        const previous = previousFocusedElementRef.current;
        if (previous && typeof previous.focus === "function") {
          previous.focus();
        }
      }
    };
  }, [mounted, renderState]);

  React.useEffect(() => {
    if (!mounted || renderState !== "open") {
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
  }, [mounted, onClose, persistent, renderState]);

  const handleBackdropClick = (): void => {
    if (!persistent) {
      onClose();
    }
  };

  const handlePanelKeyDown: React.KeyboardEventHandler<HTMLElement> = (event) => {
    if (event.key !== "Tab") {
      return;
    }

    const panel = drawerRef.current;
    if (!panel) {
      return;
    }

    const focusables = getFocusableElements(panel);
    if (!focusables.length) {
      event.preventDefault();
      panel.focus();
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
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

  if (!mounted || renderState === null) {
    return null;
  }

  const labeledById = label ? `ds-drawer-title-${titleId}` : undefined;

  return ReactDOM.createPortal(
    <div
      className={classNames("ds-drawer", `ds-drawer--${normalizedPlacement}`)}
      data-state={renderState}
      aria-hidden={renderState !== "open"}
    >
      <div className="ds-drawer__backdrop" aria-hidden="true" onClick={handleBackdropClick} />

      <section
        {...rest}
        ref={setPanelRef}
        className={classNames(
          "ds-drawer__panel",
          `ds-drawer__panel--${normalizedPlacement}`,
          `ds-drawer__panel--${normalizedSize}`,
          className,
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labeledById}
        aria-label={labeledById ? undefined : ariaLabel ?? label ?? "Drawer"}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handlePanelKeyDown}
      >
        <header className="ds-drawer__header">
          {label ? <h2 className="ds-drawer__title" id={labeledById}>{label}</h2> : null}

          {showCloseButton ? (
            <button className="ds-drawer__close" type="button" aria-label="Close drawer" onClick={onClose}>
              &times;
            </button>
          ) : null}
        </header>

        <div className="ds-drawer__body">{children}</div>

        {footer ? <footer className="ds-drawer__footer">{footer}</footer> : null}
      </section>
    </div>,
    document.body,
  );
});

Drawer.displayName = "Drawer";

export default Drawer;

export function DrawerExample(): React.JSX.Element {
  const [open, setOpen] = React.useState(false);

  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>Open Drawer</button>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        placement="right"
        size="md"
        label="Cart"
        footer={
          <>
            <button type="button" onClick={() => setOpen(false)}>Continue Shopping</button>
            <button type="button" onClick={() => setOpen(false)}>Checkout</button>
          </>
        }
      >
        Your selected items appear here.
      </Drawer>
    </div>
  );
}