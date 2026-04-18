import React from "react";

import type { BaseProps } from "@types/common";
import { classNames } from "@utils/classNames";

import "../../../tokens/_tier2-button.scss";

type CanonicalButtonVariant = "default" | "outline" | "ghost" | "destructive" | "secondary" | "link";
type ButtonVariant = NonNullable<BaseProps["variant"]> | CanonicalButtonVariant;

type CanonicalButtonSize = "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg";
type ButtonSize = NonNullable<BaseProps["size"]> | CanonicalButtonSize | "s" | "m" | "l";

const BUTTON_VARIANTS: ReadonlyArray<CanonicalButtonVariant> = [
  "default",
  "outline",
  "ghost",
  "destructive",
  "secondary",
  "link",
];

const BUTTON_SIZES: ReadonlyArray<CanonicalButtonSize> = [
  "default",
  "xs",
  "sm",
  "lg",
  "icon",
  "icon-xs",
  "icon-sm",
  "icon-lg",
];

const BUTTON_VARIANT_ALIASES: Record<string, CanonicalButtonVariant> = {
  primary: "default",
  tertiary: "ghost",
};

const BUTTON_SIZE_ALIASES: Record<string, CanonicalButtonSize> = {
  s: "sm",
  m: "default",
  md: "default",
  l: "lg",
};

const BUTTON_ICON_SIZE_BY_SIZE: Record<string, CanonicalButtonSize> = {
  xs: "icon-xs",
  sm: "icon-sm",
  default: "icon",
  lg: "icon-lg",
};

function normalizeVariant(value: ButtonVariant | undefined): CanonicalButtonVariant {
  const raw = String(value ?? "default").toLowerCase();
  const canonical = BUTTON_VARIANT_ALIASES[raw] ?? raw;

  return BUTTON_VARIANTS.includes(canonical as CanonicalButtonVariant)
    ? (canonical as CanonicalButtonVariant)
    : "default";
}

function normalizeSize(value: ButtonSize | undefined): CanonicalButtonSize {
  const raw = String(value ?? "default").toLowerCase();
  const canonical = BUTTON_SIZE_ALIASES[raw] ?? raw;

  return BUTTON_SIZES.includes(canonical as CanonicalButtonSize)
    ? (canonical as CanonicalButtonSize)
    : "default";
}

function toIconSize(size: CanonicalButtonSize): CanonicalButtonSize {
  if (size.startsWith("icon")) {
    return size;
  }

  return BUTTON_ICON_SIZE_BY_SIZE[size] ?? "icon";
}

export interface ButtonProps extends Omit<BaseProps, "variant" | "size"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconOnly?: boolean;
  isDisabled?: boolean;
}

const Button = React.forwardRef<HTMLElement, ButtonProps>(function Button(
  {
    as: Component = "button",
    className,
    children,
    variant = "default",
    size = "default",
    iconOnly = false,
    isDisabled = false,
    ...rest
  },
  ref,
) {
  const normalizedVariant = normalizeVariant(variant);
  const normalizedSize = normalizeSize(size);
  const computedSize = iconOnly ? toIconSize(normalizedSize) : normalizedSize;
  const computedIconOnly = iconOnly || computedSize.startsWith("icon");

  const isNativeButton = Component === "button";

  return (
    <Component
      ref={ref}
      className={classNames(
        "ds-button",
        `ds-button--${normalizedVariant}`,
        `ds-button--size-${computedSize}`,
        { "ds-button--icon-only": computedIconOnly },
        className,
      )}
      disabled={isNativeButton ? isDisabled : undefined}
      aria-disabled={!isNativeButton && isDisabled ? true : undefined}
      {...rest}
    >
      {children}
    </Component>
  );
});

Button.displayName = "Button";

export default Button;