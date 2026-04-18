import React from "react";

import type { BaseProps } from "@types/common";
import { classNames } from "@utils/classNames";

import "../../../tokens/_tier2-toggle.scss";
import "./Toggle.scss";

export type ToggleType = "checkbox" | "radio" | "switch";
export type ToggleGroupType = "checkbox" | "radio";

export interface ToggleChangeMeta {
  checked: boolean;
  value?: string;
  name?: string;
  type: ToggleType;
}

export interface ToggleGroupProps extends Omit<BaseProps, "size" | "variant" | "as" | "isDisabled"> {
  type?: ToggleGroupType;
  name?: string;
  value?: string | string[];
  defaultValue?: string | string[];
  isDisabled?: boolean;
  onValueChange?: (value: string | string[]) => void;
  children: React.ReactNode;
}

export interface ToggleItemProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size" | "disabled" | "children">,
    Omit<BaseProps, "size" | "variant" | "as" | "isDisabled"> {
  type?: ToggleType;
  label?: React.ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  isDisabled?: boolean;
  onCheckedChange?: (checked: boolean, meta: ToggleChangeMeta) => void;
}

interface ToggleGroupContextValue {
  type: ToggleGroupType;
  name?: string;
  isDisabled: boolean;
  isChecked: (value: string | undefined) => boolean;
  setChecked: (value: string | undefined, checked: boolean) => void;
  registerRadio: (value: string | undefined, node: HTMLInputElement | null, disabled: boolean) => void;
  unregisterRadio: (value: string | undefined) => void;
  focusRadioByDirection: (
    currentValue: string | undefined,
    direction: "next" | "prev" | "first" | "last",
  ) => string | undefined;
}

const ToggleGroupContext = React.createContext<ToggleGroupContextValue | null>(null);

function useToggleGroupContext(): ToggleGroupContextValue | null {
  return React.useContext(ToggleGroupContext);
}

function normalizeGroupValue(
  type: ToggleGroupType,
  value: string | string[] | undefined,
): string | string[] {
  if (type === "radio") {
    if (Array.isArray(value)) {
      return value[0] ?? "";
    }
    return value ?? "";
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (!value) {
    return [];
  }

  return [value];
}

const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(function ToggleGroup(
  {
    className,
    type = "checkbox",
    name,
    value,
    defaultValue,
    isDisabled = false,
    onValueChange,
    children,
    ...rest
  },
  ref,
) {
  const [internalValue, setInternalValue] = React.useState<string | string[]>(() =>
    normalizeGroupValue(type, defaultValue),
  );

  const isControlled = value !== undefined;
  const resolvedValue = isControlled ? normalizeGroupValue(type, value) : internalValue;

  const radioOrderRef = React.useRef<string[]>([]);
  const radioNodesRef = React.useRef<Map<string, HTMLInputElement>>(new Map());
  const radioDisabledRef = React.useRef<Map<string, boolean>>(new Map());

  const setValue = React.useCallback(
    (nextValue: string | string[]) => {
      if (!isControlled) {
        setInternalValue(nextValue);
      }
      onValueChange?.(nextValue);
    },
    [isControlled, onValueChange],
  );

  const isChecked = React.useCallback(
    (itemValue: string | undefined) => {
      const safeValue = itemValue ?? "on";
      if (type === "radio") {
        return resolvedValue === safeValue;
      }
      return (resolvedValue as string[]).includes(safeValue);
    },
    [resolvedValue, type],
  );

  const setChecked = React.useCallback(
    (itemValue: string | undefined, checked: boolean) => {
      const safeValue = itemValue ?? "on";

      if (type === "radio") {
        if (checked) {
          setValue(safeValue);
        }
        return;
      }

      const current = resolvedValue as string[];
      if (checked) {
        if (!current.includes(safeValue)) {
          setValue([...current, safeValue]);
        }
      } else {
        setValue(current.filter((entry) => entry !== safeValue));
      }
    },
    [resolvedValue, setValue, type],
  );

  const registerRadio = React.useCallback(
    (itemValue: string | undefined, node: HTMLInputElement | null, disabled: boolean) => {
      const safeValue = itemValue ?? "on";
      if (!radioOrderRef.current.includes(safeValue)) {
        radioOrderRef.current.push(safeValue);
      }

      if (node) {
        radioNodesRef.current.set(safeValue, node);
      }

      radioDisabledRef.current.set(safeValue, disabled);
    },
    [],
  );

  const unregisterRadio = React.useCallback((itemValue: string | undefined) => {
    const safeValue = itemValue ?? "on";
    radioNodesRef.current.delete(safeValue);
    radioDisabledRef.current.delete(safeValue);
    radioOrderRef.current = radioOrderRef.current.filter((entry) => entry !== safeValue);
  }, []);

  const focusRadioByDirection = React.useCallback(
    (currentValue: string | undefined, direction: "next" | "prev" | "first" | "last") => {
      const enabled = radioOrderRef.current.filter((entry) => !(radioDisabledRef.current.get(entry) ?? false));
      if (!enabled.length) {
        return undefined;
      }

      const safeCurrent = currentValue ?? "on";
      const currentIndex = enabled.findIndex((entry) => entry === safeCurrent);
      if (currentIndex === -1) {
        const first = enabled[0];
        radioNodesRef.current.get(first)?.focus();
        return first;
      }

      let nextIndex = currentIndex;
      if (direction === "next") {
        nextIndex = (currentIndex + 1) % enabled.length;
      } else if (direction === "prev") {
        nextIndex = (currentIndex - 1 + enabled.length) % enabled.length;
      } else if (direction === "first") {
        nextIndex = 0;
      } else {
        nextIndex = enabled.length - 1;
      }

      const nextValue = enabled[nextIndex];
      radioNodesRef.current.get(nextValue)?.focus();
      return nextValue;
    },
    [],
  );

  const contextValue = React.useMemo<ToggleGroupContextValue>(
    () => ({
      type,
      name,
      isDisabled,
      isChecked,
      setChecked,
      registerRadio,
      unregisterRadio,
      focusRadioByDirection,
    }),
    [focusRadioByDirection, isChecked, isDisabled, name, registerRadio, setChecked, type, unregisterRadio],
  );

  return (
    <ToggleGroupContext.Provider value={contextValue}>
      <div
        ref={ref}
        role={type === "radio" ? "radiogroup" : "group"}
        className={classNames("ds-toggle-group", `ds-toggle-group--${type}`, className)}
        {...rest}
      >
        {children}
      </div>
    </ToggleGroupContext.Provider>
  );
});

const ToggleItem = React.forwardRef<HTMLInputElement, ToggleItemProps>(function ToggleItem(
  {
    className,
    type = "checkbox",
    label,
    checked,
    defaultChecked,
    isDisabled = false,
    name,
    value,
    id,
    onChange,
    onCheckedChange,
    onKeyDown,
    ...rest
  },
  ref,
) {
  const group = useToggleGroupContext();
  const generatedId = React.useId().replace(/[:]/g, "");
  const inputId = id ?? `ds-toggle-${generatedId}`;

  const inGroup = Boolean(group);
  const resolvedType: ToggleType = group ? (group.type === "radio" ? "radio" : type) : type;
  const nativeType = resolvedType === "switch" ? "checkbox" : resolvedType;

  const [internalChecked, setInternalChecked] = React.useState<boolean>(defaultChecked ?? false);

  const isControlled = checked !== undefined;

  const groupChecked = group?.isChecked(value);
  const resolvedChecked = group
    ? groupChecked
    : isControlled
      ? checked
      : internalChecked;

  const resolvedDisabled = isDisabled || Boolean(group?.isDisabled);
  const resolvedName = group?.name ?? name;

  const inputRef = React.useRef<HTMLInputElement | null>(null);
  React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);

  React.useEffect(() => {
    if (group?.type !== "radio") {
      return;
    }

    group.registerRadio(value, inputRef.current, resolvedDisabled);
    return () => {
      group.unregisterRadio(value);
    };
  }, [group, resolvedDisabled, value]);

  const emitChange = React.useCallback(
    (nextChecked: boolean) => {
      onCheckedChange?.(nextChecked, {
        checked: nextChecked,
        value,
        name: resolvedName,
        type: resolvedType,
      });
    },
    [onCheckedChange, resolvedName, resolvedType, value],
  );

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    onChange?.(event);
    const nextChecked = event.currentTarget.checked;

    if (group) {
      group.setChecked(value, nextChecked);
      emitChange(nextChecked);
      return;
    }

    if (!isControlled) {
      setInternalChecked(nextChecked);
    }

    emitChange(nextChecked);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || !group || group.type !== "radio") {
      return;
    }

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      const nextValue = group.focusRadioByDirection(value, "next");
      if (nextValue !== undefined) {
        group.setChecked(nextValue, true);
      }
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      const prevValue = group.focusRadioByDirection(value, "prev");
      if (prevValue !== undefined) {
        group.setChecked(prevValue, true);
      }
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      const firstValue = group.focusRadioByDirection(value, "first");
      if (firstValue !== undefined) {
        group.setChecked(firstValue, true);
      }
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      const lastValue = group.focusRadioByDirection(value, "last");
      if (lastValue !== undefined) {
        group.setChecked(lastValue, true);
      }
    }
  };

  return (
    <label
      className={classNames(
        "ds-toggle",
        `ds-toggle--${resolvedType}`,
        {
          "ds-toggle--checked": resolvedChecked,
          "ds-toggle--disabled": resolvedDisabled,
        },
        className,
      )}
      htmlFor={inputId}
    >
      <input
        {...rest}
        ref={inputRef}
        id={inputId}
        className="ds-toggle__input"
        type={nativeType}
        role={resolvedType === "switch" ? "switch" : undefined}
        name={resolvedName}
        value={value}
        checked={Boolean(resolvedChecked)}
        disabled={resolvedDisabled}
        aria-checked={resolvedType === "switch" ? Boolean(resolvedChecked) : undefined}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />

      {resolvedType === "switch" ? (
        <span className="ds-toggle__track" aria-hidden="true">
          <span className="ds-toggle__thumb" />
        </span>
      ) : (
        <span className="ds-toggle__box" aria-hidden="true">
          {resolvedType === "checkbox" ? (
            <svg className="ds-toggle__checkmark" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M2.5 6L5 8.5L9.5 3.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <span className="ds-toggle__dot" />
          )}
        </span>
      )}

      {label ? <span className="ds-toggle__label">{label}</span> : null}
    </label>
  );
});

interface ToggleComponent extends React.ForwardRefExoticComponent<ToggleItemProps & React.RefAttributes<HTMLInputElement>> {
  Group: React.ForwardRefExoticComponent<ToggleGroupProps & React.RefAttributes<HTMLDivElement>>;
  Item: React.ForwardRefExoticComponent<ToggleItemProps & React.RefAttributes<HTMLInputElement>>;
}

const Toggle = ToggleItem as ToggleComponent;

Toggle.Group = ToggleGroup;
Toggle.Item = ToggleItem;

export default Toggle;

export function ToggleExample(): React.JSX.Element {
  return (
    <div style={{ display: "grid", gap: "0.75rem" }}>
      <Toggle type="switch" label="Notifications" defaultChecked />

      <Toggle.Group type="radio" name="size" defaultValue="m">
        <Toggle.Item type="radio" value="s" label="Small" />
        <Toggle.Item type="radio" value="m" label="Medium" />
        <Toggle.Item type="radio" value="l" label="Large" />
      </Toggle.Group>
    </div>
  );
}