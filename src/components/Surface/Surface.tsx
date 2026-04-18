import React from "react";

import type { BaseProps } from "@types/common";
import { classNames } from "@utils/classNames";

import "../../../tokens/_tier2-surface.scss";

type CanonicalSurfaceVariant = "card" | "badge" | "tag" | "chip";
type SurfaceVariant = NonNullable<BaseProps["variant"]> | CanonicalSurfaceVariant;

const SURFACE_VARIANTS: ReadonlyArray<CanonicalSurfaceVariant> = ["card", "badge", "tag", "chip"];

const SURFACE_VARIANT_ALIASES: Record<string, CanonicalSurfaceVariant> = {
  primary: "card",
  secondary: "tag",
  tertiary: "chip",
  outline: "badge",
  ghost: "tag",
};

function normalizeVariant(value: SurfaceVariant | undefined): CanonicalSurfaceVariant {
  const raw = String(value ?? "card").trim().toLowerCase();
  const canonical = SURFACE_VARIANT_ALIASES[raw] ?? raw;

  return SURFACE_VARIANTS.includes(canonical as CanonicalSurfaceVariant)
    ? (canonical as CanonicalSurfaceVariant)
    : "card";
}

export interface SurfaceProps extends Omit<BaseProps, "variant" | "size"> {
  variant?: SurfaceVariant;
  elevated?: boolean;
  removable?: boolean;
  onRemove?: (value: string) => void;
}

const Surface = React.forwardRef<HTMLElement, SurfaceProps>(function Surface(
  {
    as,
    className,
    children,
    variant = "card",
    elevated = false,
    removable = false,
    onRemove,
    ...rest
  },
  ref,
) {
  const normalizedVariant = normalizeVariant(variant);
  const defaultTag = normalizedVariant === "card" ? "div" : "span";
  const Component: React.ElementType = as ?? defaultTag;

  const handleRemove = () => {
    onRemove?.(typeof children === "string" ? children.trim() : "");
  };

  return (
    <Component
      ref={ref}
      className={classNames(
        "ds-surface",
        `ds-surface--${normalizedVariant}`,
        { "ds-surface--elevated": elevated && normalizedVariant === "card" },
        className,
      )}
      {...rest}
    >
      {children}
      {normalizedVariant === "chip" && removable ? (
        <button className="ds-surface__remove" aria-label="Remove" type="button" onClick={handleRemove}>
          &times;
        </button>
      ) : null}
    </Component>
  );
});

Surface.displayName = "Surface";

export default Surface;