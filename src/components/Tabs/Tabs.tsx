import React from "react";

import type { BaseProps } from "@types/common";
import { classNames } from "@utils/classNames";

import "../../../tokens/_tier2-tabs.scss";
import "./Tabs.scss";

export type TabsOrientation = "horizontal" | "vertical";
export type TabsListBg = "transparent" | "primary-alpha20" | "bg" | "sunken";
export type TabsActiveBg = "bg" | "primary" | "primary-alpha20" | "transparent";
export type TabsActiveColor = "foreground" | "primary-fg" | "primary-alpha60" | "primary";
export type TabsIconPosition = "start" | "end" | "top";
export type TabsShadow = "none" | "sm";
export type TabsBorder = "none" | "true";
export type TabsIndicator = "none" | "line" | "folder";
export type TabsRadius = "sm" | "full";

function normalizeToken(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

function sanitizeIdValue(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-");
}

function normalizeOrientation(value: string | undefined): TabsOrientation {
  return normalizeToken(value ?? "horizontal") === "vertical" ? "vertical" : "horizontal";
}

function normalizeListBg(value: string | undefined): TabsListBg {
  const token = normalizeToken(value ?? "transparent");
  if (token === "primary-alpha20" || token === "bg" || token === "sunken") {
    return token;
  }
  return "transparent";
}

function normalizeActiveBg(value: string | undefined): TabsActiveBg {
  const token = normalizeToken(value ?? "transparent");
  if (token === "bg" || token === "primary" || token === "primary-alpha20") {
    return token;
  }
  return "transparent";
}

function normalizeActiveColor(value: string | undefined): TabsActiveColor {
  const token = normalizeToken(value ?? "foreground");
  if (token === "primary-alpha-60") {
    return "primary-alpha60";
  }
  if (token === "foreground" || token === "primary-fg" || token === "primary-alpha60" || token === "primary") {
    return token;
  }
  return "foreground";
}

function normalizeIconPosition(value: string | undefined): TabsIconPosition {
  const token = normalizeToken(value ?? "start");
  if (token === "end" || token === "top") {
    return token;
  }
  return "start";
}

function normalizeShadow(value: string | undefined): TabsShadow {
  return normalizeToken(value ?? "none") === "sm" ? "sm" : "none";
}

function normalizeBorder(value: string | undefined): TabsBorder {
  return normalizeToken(value ?? "none") === "true" ? "true" : "none";
}

function normalizeIndicator(value: string | undefined): TabsIndicator {
  const token = normalizeToken(value ?? "none");
  if (token === "line" || token === "folder") {
    return token;
  }
  return "none";
}

function normalizeRadius(value: string | undefined): TabsRadius {
  return normalizeToken(value ?? "sm") === "full" ? "full" : "sm";
}

interface TabsContextValue {
  idBase: string;
  orientation: TabsOrientation;
  listBg: TabsListBg;
  bg: TabsActiveBg;
  color: TabsActiveColor;
  iconPos: TabsIconPosition;
  shadow: TabsShadow;
  border: TabsBorder;
  indicator: TabsIndicator;
  radius: TabsRadius;
  showLabel: boolean;
  selectedValue: string | undefined;
  isSelected: (value: string) => boolean;
  setSelectedValue: (value: string) => void;
  registerTrigger: (value: string, node: HTMLButtonElement | null, disabled: boolean) => void;
  unregisterTrigger: (value: string) => void;
  moveAndFocus: (
    currentValue: string,
    direction: "next" | "prev" | "first" | "last",
  ) => string | undefined;
  getTriggerId: (value: string) => string;
  getPanelId: (value: string) => string;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext(): TabsContextValue {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs compound components must be used inside <Tabs>.");
  }
  return context;
}

export interface TabsProps extends Omit<BaseProps, "size" | "variant" | "as" | "isDisabled"> {
  orientation?: TabsOrientation;
  bg?: TabsActiveBg;
  listBg?: TabsListBg;
  color?: TabsActiveColor;
  iconPos?: TabsIconPosition;
  shadow?: TabsShadow;
  border?: TabsBorder;
  indicator?: TabsIndicator;
  radius?: TabsRadius;
  label?: boolean;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export interface TabsListProps extends Omit<BaseProps, "size" | "variant" | "as" | "isDisabled"> {
  children: React.ReactNode;
}

export interface TabsTriggerProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value" | "children"> {
  value: string;
  icon?: React.ReactNode;
  iconPos?: TabsIconPosition;
  label?: boolean;
  abbr?: string;
  isDisabled?: boolean;
  children?: React.ReactNode;
}

export interface TabsPanelsProps extends Omit<BaseProps, "size" | "variant" | "as" | "isDisabled"> {
  children: React.ReactNode;
}

export interface TabsPanelProps extends Omit<BaseProps, "size" | "variant" | "as" | "isDisabled"> {
  value: string;
  children: React.ReactNode;
}

const TabsRoot = React.forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  {
    className,
    orientation = "horizontal",
    bg = "transparent",
    listBg = "transparent",
    color = "foreground",
    iconPos = "start",
    shadow = "none",
    border = "none",
    indicator = "none",
    radius = "sm",
    label = true,
    value,
    defaultValue,
    onValueChange,
    children,
    ...rest
  },
  ref,
) {
  const idBase = React.useId().replace(/[:]/g, "");

  const normalizedOrientation = normalizeOrientation(orientation);
  const normalizedBg = normalizeActiveBg(bg);
  const normalizedListBg = normalizeListBg(listBg);
  const normalizedColor = normalizeActiveColor(color);
  const normalizedIconPos = normalizeIconPosition(iconPos);
  const normalizedShadow = normalizeShadow(shadow);
  const normalizedBorder = normalizeBorder(border);
  const normalizedIndicator = normalizeIndicator(indicator);
  const normalizedRadius = normalizeRadius(radius);

  const [internalValue, setInternalValue] = React.useState<string | undefined>(defaultValue);

  const isControlled = value !== undefined;
  const selectedValue = isControlled ? value : internalValue;

  const triggerOrderRef = React.useRef<string[]>([]);
  const triggerNodesRef = React.useRef<Map<string, HTMLButtonElement>>(new Map());
  const triggerDisabledRef = React.useRef<Map<string, boolean>>(new Map());

  const setSelected = React.useCallback(
    (nextValue: string) => {
      if (!isControlled) {
        setInternalValue(nextValue);
      }
      onValueChange?.(nextValue);
    },
    [isControlled, onValueChange],
  );

  const isSelected = React.useCallback(
    (tabValue: string) => {
      return selectedValue === tabValue;
    },
    [selectedValue],
  );

  const registerTrigger = React.useCallback(
    (tabValue: string, node: HTMLButtonElement | null, disabled: boolean) => {
      if (!triggerOrderRef.current.includes(tabValue)) {
        triggerOrderRef.current.push(tabValue);
      }

      if (node) {
        triggerNodesRef.current.set(tabValue, node);
      }

      triggerDisabledRef.current.set(tabValue, disabled);

      if (!selectedValue && !disabled) {
        setSelected(tabValue);
      }
    },
    [selectedValue, setSelected],
  );

  const unregisterTrigger = React.useCallback((tabValue: string) => {
    triggerNodesRef.current.delete(tabValue);
    triggerDisabledRef.current.delete(tabValue);
    triggerOrderRef.current = triggerOrderRef.current.filter((valueItem) => valueItem !== tabValue);
  }, []);

  const moveAndFocus = React.useCallback(
    (currentValue: string, direction: "next" | "prev" | "first" | "last") => {
      const enabledValues = triggerOrderRef.current.filter((tabValue) => {
        return !(triggerDisabledRef.current.get(tabValue) ?? false);
      });

      if (!enabledValues.length) {
        return undefined;
      }

      const currentIndex = enabledValues.findIndex((tabValue) => tabValue === currentValue);
      if (currentIndex === -1) {
        const first = enabledValues[0];
        triggerNodesRef.current.get(first)?.focus();
        return first;
      }

      let nextIndex = currentIndex;
      if (direction === "next") {
        nextIndex = (currentIndex + 1) % enabledValues.length;
      } else if (direction === "prev") {
        nextIndex = (currentIndex - 1 + enabledValues.length) % enabledValues.length;
      } else if (direction === "first") {
        nextIndex = 0;
      } else {
        nextIndex = enabledValues.length - 1;
      }

      const nextValue = enabledValues[nextIndex];
      triggerNodesRef.current.get(nextValue)?.focus();
      return nextValue;
    },
    [],
  );

  const getTriggerId = React.useCallback(
    (tabValue: string) => `ds-tab-${idBase}-${sanitizeIdValue(tabValue)}`,
    [idBase],
  );

  const getPanelId = React.useCallback(
    (tabValue: string) => `ds-tab-panel-${idBase}-${sanitizeIdValue(tabValue)}`,
    [idBase],
  );

  const contextValue = React.useMemo<TabsContextValue>(
    () => ({
      idBase,
      orientation: normalizedOrientation,
      listBg: normalizedListBg,
      bg: normalizedBg,
      color: normalizedColor,
      iconPos: normalizedIconPos,
      shadow: normalizedShadow,
      border: normalizedBorder,
      indicator: normalizedIndicator,
      radius: normalizedRadius,
      showLabel: label,
      selectedValue,
      isSelected,
      setSelectedValue: setSelected,
      registerTrigger,
      unregisterTrigger,
      moveAndFocus,
      getTriggerId,
      getPanelId,
    }),
    [
      getPanelId,
      getTriggerId,
      idBase,
      indicator,
      isSelected,
      label,
      moveAndFocus,
      normalizedBg,
      normalizedBorder,
      normalizedColor,
      normalizedIconPos,
      normalizedIndicator,
      normalizedListBg,
      normalizedOrientation,
      normalizedRadius,
      normalizedShadow,
      registerTrigger,
      selectedValue,
      setSelected,
      unregisterTrigger,
    ],
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div
        ref={ref}
        className={classNames("ds-tabs", `ds-tabs--${normalizedOrientation}`, className)}
        {...rest}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
});

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(function TabsList(
  { className, children, ...rest },
  ref,
) {
  const { orientation, listBg, indicator, radius, border } = useTabsContext();

  return (
    <div
      ref={ref}
      role="tablist"
      aria-orientation={orientation}
      className={classNames(
        "ds-tab-list",
        `ds-tab-list--${orientation}`,
        `list-bg--${listBg}`,
        `indicator--${indicator}`,
        `radius--${radius}`,
        `border--${border}`,
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
});

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(function TabsTrigger(
  {
    className,
    value,
    icon,
    iconPos,
    label,
    abbr,
    isDisabled = false,
    children,
    onClick,
    onKeyDown,
    ...rest
  },
  ref,
) {
  const {
    orientation,
    bg,
    color,
    iconPos: contextIconPos,
    shadow,
    border,
    indicator,
    radius,
    showLabel,
    isSelected,
    setSelectedValue,
    registerTrigger,
    unregisterTrigger,
    moveAndFocus,
    getTriggerId,
    getPanelId,
  } = useTabsContext();

  const resolvedIconPos = normalizeIconPosition(iconPos ?? contextIconPos);
  const showText = label ?? showLabel;
  const selected = isSelected(value);
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);

  React.useImperativeHandle(ref, () => buttonRef.current as HTMLButtonElement, []);

  React.useEffect(() => {
    registerTrigger(value, buttonRef.current, isDisabled);
    return () => unregisterTrigger(value);
  }, [isDisabled, registerTrigger, unregisterTrigger, value]);

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    onClick?.(event);
    if (event.defaultPrevented || isDisabled) {
      return;
    }
    setSelectedValue(value);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (event) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || isDisabled) {
      return;
    }

    const isHorizontal = orientation === "horizontal";

    if ((isHorizontal && event.key === "ArrowRight") || (!isHorizontal && event.key === "ArrowDown")) {
      event.preventDefault();
      const nextValue = moveAndFocus(value, "next");
      if (nextValue) {
        setSelectedValue(nextValue);
      }
      return;
    }

    if ((isHorizontal && event.key === "ArrowLeft") || (!isHorizontal && event.key === "ArrowUp")) {
      event.preventDefault();
      const prevValue = moveAndFocus(value, "prev");
      if (prevValue) {
        setSelectedValue(prevValue);
      }
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      const firstValue = moveAndFocus(value, "first");
      if (firstValue) {
        setSelectedValue(firstValue);
      }
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      const lastValue = moveAndFocus(value, "last");
      if (lastValue) {
        setSelectedValue(lastValue);
      }
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setSelectedValue(value);
    }
  };

  return (
    <button
      {...rest}
      ref={buttonRef}
      id={getTriggerId(value)}
      type="button"
      role="tab"
      aria-selected={selected}
      aria-controls={getPanelId(value)}
      tabIndex={selected ? 0 : -1}
      disabled={isDisabled}
      className={classNames(
        "ds-tab",
        `ds-tab--${orientation}`,
        `active-bg--${bg}`,
        `active-color--${color}`,
        `shadow--${shadow}`,
        `border--${border}`,
        `indicator--${indicator}`,
        `radius--${radius}`,
        `icon-only--${(!showText && !abbr).toString()}`,
        className,
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      icon-pos={resolvedIconPos}
    >
      {resolvedIconPos !== "end" ? (icon ? <span className="icon-slot">{icon}</span> : null) : null}
      {showText ? <span className="label-slot">{children}</span> : abbr ? <span className="label-slot abbr-label">{abbr}</span> : null}
      {resolvedIconPos === "end" ? (icon ? <span className="icon-slot">{icon}</span> : null) : null}
    </button>
  );
});

const TabsPanels = React.forwardRef<HTMLDivElement, TabsPanelsProps>(function TabsPanels(
  { className, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={classNames("ds-tab-panels", className)} {...rest}>
      {children}
    </div>
  );
});

const TabsPanel = React.forwardRef<HTMLDivElement, TabsPanelProps>(function TabsPanel(
  { className, value, children, ...rest },
  ref,
) {
  const { isSelected, getTriggerId, getPanelId } = useTabsContext();
  const active = isSelected(value);

  return (
    <div
      ref={ref}
      id={getPanelId(value)}
      role="tabpanel"
      aria-labelledby={getTriggerId(value)}
      aria-hidden={!active}
      tabIndex={active ? 0 : -1}
      className={classNames(
        "ds-tab-panel",
        {
          "ds-tab-panel--active": active,
          "ds-tab-panel--inactive": !active,
        },
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
});

interface TabsComponent extends React.ForwardRefExoticComponent<TabsProps & React.RefAttributes<HTMLDivElement>> {
  List: React.ForwardRefExoticComponent<TabsListProps & React.RefAttributes<HTMLDivElement>>;
  Trigger: React.ForwardRefExoticComponent<TabsTriggerProps & React.RefAttributes<HTMLButtonElement>>;
  Panels: React.ForwardRefExoticComponent<TabsPanelsProps & React.RefAttributes<HTMLDivElement>>;
  Panel: React.ForwardRefExoticComponent<TabsPanelProps & React.RefAttributes<HTMLDivElement>>;
}

const Tabs = TabsRoot as TabsComponent;

Tabs.List = TabsList;
Tabs.Trigger = TabsTrigger;
Tabs.Panels = TabsPanels;
Tabs.Panel = TabsPanel;

export default Tabs;

export function TabsExample(): React.JSX.Element {
  return (
    <Tabs indicator="line" bg="transparent" color="primary" defaultValue="overview">
      <Tabs.List>
        <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
        <Tabs.Trigger value="details">Details</Tabs.Trigger>
        <Tabs.Trigger value="reviews">Reviews</Tabs.Trigger>
      </Tabs.List>

      <Tabs.Panels>
        <Tabs.Panel value="overview">Overview content</Tabs.Panel>
        <Tabs.Panel value="details">Details content</Tabs.Panel>
        <Tabs.Panel value="reviews">Reviews content</Tabs.Panel>
      </Tabs.Panels>
    </Tabs>
  );
}