import React from "react";

import type { BaseProps } from "@types/common";
import { classNames } from "@utils/classNames";

import "../../../tokens/_tier2-accordion.scss";
import "./Accordion.scss";

export type AccordionVariant =
  | "default"
  | "bordered"
  | "separated"
  | "filled"
  | "shadow"
  | "left-icon"
  | "plus-minus"
  | "subtext"
  | "ghost"
  | "avatar"
  | "colored-indicator"
  | "minimal"
  | "rounded"
  | "arrow"
  | "outline"
  | "icon-right";

const ACCORDION_VARIANTS: ReadonlyArray<AccordionVariant> = [
  "default",
  "bordered",
  "separated",
  "filled",
  "shadow",
  "left-icon",
  "plus-minus",
  "subtext",
  "ghost",
  "avatar",
  "colored-indicator",
  "minimal",
  "rounded",
  "arrow",
  "outline",
  "icon-right",
];

const ACCORDION_VARIANT_ALIASES: Record<string, AccordionVariant> = {
  primary: "default",
  secondary: "bordered",
  tertiary: "minimal",
  outline: "outline",
  ghost: "ghost",
};

function normalizeVariant(value: AccordionVariant | undefined): AccordionVariant {
  const raw = String(value ?? "default").trim().toLowerCase();
  const canonical = ACCORDION_VARIANT_ALIASES[raw] ?? raw;

  return ACCORDION_VARIANTS.includes(canonical as AccordionVariant)
    ? (canonical as AccordionVariant)
    : "default";
}

export interface AccordionProps extends Omit<BaseProps, "variant" | "size" | "as" | "isDisabled"> {
  variant?: AccordionVariant;
  singleOpen?: boolean;
  defaultOpenItems?: string[];
  openItems?: string[];
  onOpenItemsChange?: (openItems: string[]) => void;
}

export interface AccordionItemProps extends Omit<BaseProps, "variant" | "size" | "as" | "isDisabled"> {
  value: string;
  isDisabled?: boolean;
}

export interface AccordionHeaderProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children" | "id"> {
  children: React.ReactNode;
  avatar?: React.ReactNode;
  icon?: React.ReactNode;
  subtext?: React.ReactNode;
}

export interface AccordionPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface AccordionContextValue {
  variant: AccordionVariant;
  isItemOpen: (value: string) => boolean;
  isItemDisabled: (value: string) => boolean;
  toggleItem: (value: string) => void;
  registerHeader: (value: string, node: HTMLButtonElement | null) => void;
  registerItemDisabled: (value: string, isDisabled: boolean) => void;
  focusByDirection: (currentValue: string, direction: "next" | "prev" | "first" | "last") => void;
}

interface AccordionItemContextValue {
  value: string;
  headerId: string;
  panelId: string;
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null);
const AccordionItemContext = React.createContext<AccordionItemContextValue | null>(null);

function useAccordionContext(): AccordionContextValue {
  const context = React.useContext(AccordionContext);
  if (!context) {
    throw new Error("Accordion compound components must be used inside <Accordion>.");
  }
  return context;
}

function useAccordionItemContext(): AccordionItemContextValue {
  const context = React.useContext(AccordionItemContext);
  if (!context) {
    throw new Error("Accordion.Header and Accordion.Panel must be used inside <Accordion.Item>.");
  }
  return context;
}

const AccordionRoot = React.forwardRef<HTMLDivElement, AccordionProps>(function Accordion(
  {
    className,
    variant = "default",
    singleOpen = false,
    defaultOpenItems,
    openItems,
    onOpenItemsChange,
    children,
    ...rest
  },
  ref,
) {
  const normalizedVariant = normalizeVariant(variant);
  const [internalOpenItems, setInternalOpenItems] = React.useState<string[]>(
    defaultOpenItems ?? [],
  );

  const isControlled = openItems !== undefined;
  const resolvedOpenItems = isControlled ? openItems : internalOpenItems;

  const disabledItemsRef = React.useRef<Map<string, boolean>>(new Map());
  const headersRef = React.useRef<Map<string, HTMLButtonElement>>(new Map());

  const setOpenItems = React.useCallback(
    (nextItems: string[]) => {
      if (!isControlled) {
        setInternalOpenItems(nextItems);
      }
      onOpenItemsChange?.(nextItems);
    },
    [isControlled, onOpenItemsChange],
  );

  const isItemOpen = React.useCallback(
    (value: string) => resolvedOpenItems.includes(value),
    [resolvedOpenItems],
  );

  const isItemDisabled = React.useCallback((value: string) => {
    return disabledItemsRef.current.get(value) ?? false;
  }, []);

  const registerItemDisabled = React.useCallback((value: string, isDisabled: boolean) => {
    disabledItemsRef.current.set(value, isDisabled);
  }, []);

  const toggleItem = React.useCallback(
    (value: string) => {
      if (isItemDisabled(value)) {
        return;
      }

      const isOpen = resolvedOpenItems.includes(value);

      if (singleOpen) {
        setOpenItems(isOpen ? [] : [value]);
        return;
      }

      if (isOpen) {
        setOpenItems(resolvedOpenItems.filter((item) => item !== value));
      } else {
        setOpenItems([...resolvedOpenItems, value]);
      }
    },
    [isItemDisabled, resolvedOpenItems, setOpenItems, singleOpen],
  );

  const registerHeader = React.useCallback((value: string, node: HTMLButtonElement | null) => {
    if (node) {
      headersRef.current.set(value, node);
    } else {
      headersRef.current.delete(value);
    }
  }, []);

  const focusByDirection = React.useCallback(
    (currentValue: string, direction: "next" | "prev" | "first" | "last") => {
      const entries = Array.from(headersRef.current.entries());
      if (!entries.length) {
        return;
      }

      const available = entries.filter(([value]) => !isItemDisabled(value));
      if (!available.length) {
        return;
      }

      const currentAvailableIndex = available.findIndex(([value]) => value === currentValue);
      if (currentAvailableIndex === -1) {
        available[0][1].focus();
        return;
      }

      let nextIndex = currentAvailableIndex;
      if (direction === "next") {
        nextIndex = (currentAvailableIndex + 1) % available.length;
      } else if (direction === "prev") {
        nextIndex = (currentAvailableIndex - 1 + available.length) % available.length;
      } else if (direction === "first") {
        nextIndex = 0;
      } else if (direction === "last") {
        nextIndex = available.length - 1;
      }

      available[nextIndex][1].focus();
    },
    [isItemDisabled],
  );

  const contextValue = React.useMemo<AccordionContextValue>(
    () => ({
      variant: normalizedVariant,
      isItemOpen,
      isItemDisabled,
      toggleItem,
      registerHeader,
      registerItemDisabled,
      focusByDirection,
    }),
    [
      focusByDirection,
      isItemDisabled,
      isItemOpen,
      normalizedVariant,
      registerHeader,
      registerItemDisabled,
      toggleItem,
    ],
  );

  return (
    <AccordionContext.Provider value={contextValue}>
      <div
        ref={ref}
        className={classNames("ds-accordion", `ds-accordion--${normalizedVariant}`, className)}
        {...rest}
      >
        {children}
      </div>
    </AccordionContext.Provider>
  );
});

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(function AccordionItem(
  { className, value, isDisabled = false, children, ...rest },
  ref,
) {
  const { variant, isItemOpen, registerItemDisabled } = useAccordionContext();
  const reactId = React.useId().replace(/[:]/g, "");
  const safeValue = value.replace(/[^a-zA-Z0-9_-]/g, "-");
  const headerId = `ds-accordion-header-${reactId}-${safeValue}`;
  const panelId = `ds-accordion-panel-${reactId}-${safeValue}`;
  const open = isItemOpen(value);

  React.useEffect(() => {
    registerItemDisabled(value, isDisabled);
    return () => {
      registerItemDisabled(value, false);
    };
  }, [isDisabled, registerItemDisabled, value]);

  const itemContext = React.useMemo<AccordionItemContextValue>(
    () => ({ value, headerId, panelId }),
    [headerId, panelId, value],
  );

  return (
    <AccordionItemContext.Provider value={itemContext}>
      <div
        ref={ref}
        data-variant={variant}
        className={classNames(
          "ds-accordion__item",
          {
            "ds-accordion__item--open": open,
            "ds-accordion__item--expanded": open,
            "ds-accordion__item--disabled": isDisabled,
          },
          className,
        )}
        {...rest}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
});

const AccordionHeader = React.forwardRef<HTMLButtonElement, AccordionHeaderProps>(function AccordionHeader(
  { className, children, avatar, icon, subtext, onClick, onKeyDown, ...rest },
  ref,
) {
  const { value, headerId, panelId } = useAccordionItemContext();
  const { isItemOpen, isItemDisabled, toggleItem, focusByDirection, registerHeader } = useAccordionContext();
  const open = isItemOpen(value);
  const disabled = isItemDisabled(value);

  const localRef = React.useRef<HTMLButtonElement | null>(null);

  React.useImperativeHandle(ref, () => localRef.current as HTMLButtonElement, []);

  React.useEffect(() => {
    registerHeader(value, localRef.current);
    return () => registerHeader(value, null);
  }, [registerHeader, value]);

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    onClick?.(event);
    if (event.defaultPrevented || disabled) {
      return;
    }
    toggleItem(value);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (event) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!disabled) {
        toggleItem(value);
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusByDirection(value, "next");
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      focusByDirection(value, "prev");
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      focusByDirection(value, "first");
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      focusByDirection(value, "last");
    }
  };

  return (
    <button
      {...rest}
      ref={localRef}
      id={headerId}
      type="button"
      className={classNames("ds-accordion__trigger", className)}
      aria-expanded={open}
      aria-controls={panelId}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {avatar ? <span className="ds-accordion__avatar-slot">{avatar}</span> : null}
      {icon ? <span className="ds-accordion__icon-slot">{icon}</span> : null}

      <span className="ds-accordion__trigger-content">
        <span className="ds-accordion__title">{children}</span>
        {subtext ? <span className="ds-accordion__subtext-slot">{subtext}</span> : null}
      </span>

      <span className="ds-accordion__chevron" aria-hidden="true">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </span>
    </button>
  );
});

const AccordionPanel = React.forwardRef<HTMLDivElement, AccordionPanelProps>(function AccordionPanel(
  { className, children, ...rest },
  ref,
) {
  const { value, headerId, panelId } = useAccordionItemContext();
  const { isItemOpen } = useAccordionContext();
  const open = isItemOpen(value);

  return (
    <div
      ref={ref}
      id={panelId}
      role="region"
      aria-labelledby={headerId}
      aria-hidden={!open}
      className={classNames("ds-accordion__body", className)}
      {...rest}
    >
      <div className="ds-accordion__content">{children}</div>
    </div>
  );
});

interface AccordionComponent
  extends React.ForwardRefExoticComponent<AccordionProps & React.RefAttributes<HTMLDivElement>> {
  Item: React.ForwardRefExoticComponent<AccordionItemProps & React.RefAttributes<HTMLDivElement>>;
  Header: React.ForwardRefExoticComponent<AccordionHeaderProps & React.RefAttributes<HTMLButtonElement>>;
  Panel: React.ForwardRefExoticComponent<AccordionPanelProps & React.RefAttributes<HTMLDivElement>>;
}

const Accordion = AccordionRoot as AccordionComponent;

Accordion.Item = AccordionItem;
Accordion.Header = AccordionHeader;
Accordion.Panel = AccordionPanel;

export default Accordion;

export function AccordionExample(): React.JSX.Element {
  return (
    <Accordion variant="bordered" singleOpen defaultOpenItems={["shipping"]}>
      <Accordion.Item value="shipping">
        <Accordion.Header subtext="Delivery and pickup options">Shipping</Accordion.Header>
        <Accordion.Panel>
          Standard shipping takes 2-5 business days. Express shipping is available at checkout.
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item value="returns">
        <Accordion.Header subtext="Refund windows and conditions">Returns</Accordion.Header>
        <Accordion.Panel>
          You can return items within 30 days in original condition.
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item value="support" isDisabled>
        <Accordion.Header>Support</Accordion.Header>
        <Accordion.Panel>Support temporarily unavailable.</Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}