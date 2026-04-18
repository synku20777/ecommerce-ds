import React from "react";

import type { BaseProps } from "@types/common";
import { classNames } from "@utils/classNames";

import "../../../tokens/_tier2-badge.scss";

type CanonicalBadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost"
  | "link"
  | "dot"
  | "number-dot"
  | "text-dot";

type BadgeVariant = NonNullable<BaseProps["variant"]> | CanonicalBadgeVariant;

type CanonicalBadgeSize = "small" | "default" | "large";
type BadgeSize = NonNullable<BaseProps["size"]> | CanonicalBadgeSize | "s" | "m" | "l";

type IconPosition = "start" | "end";

const BADGE_VARIANTS: ReadonlyArray<CanonicalBadgeVariant> = [
  "default",
  "secondary",
  "destructive",
  "outline",
  "ghost",
  "link",
  "dot",
  "number-dot",
  "text-dot",
];

const BADGE_SIZES: ReadonlyArray<CanonicalBadgeSize> = ["small", "default", "large"];

const BADGE_VARIANT_ALIASES: Record<string, CanonicalBadgeVariant> = {
  primary: "default",
  tertiary: "outline",
};

const BADGE_SIZE_ALIASES: Record<string, CanonicalBadgeSize> = {
  sm: "small",
  md: "default",
  lg: "large",
  s: "small",
  m: "default",
  l: "large",
};

function normalizeVariant(value: BadgeVariant | undefined): CanonicalBadgeVariant {
  const raw = String(value ?? "default").trim().toLowerCase();
  const canonical = BADGE_VARIANT_ALIASES[raw] ?? raw;

  return BADGE_VARIANTS.includes(canonical as CanonicalBadgeVariant)
    ? (canonical as CanonicalBadgeVariant)
    : "default";
}

function normalizeSize(value: BadgeSize | undefined): CanonicalBadgeSize {
  const raw = String(value ?? "default").trim().toLowerCase();
  const canonical = BADGE_SIZE_ALIASES[raw] ?? raw;

  return BADGE_SIZES.includes(canonical as CanonicalBadgeSize)
    ? (canonical as CanonicalBadgeSize)
    : "default";
}

function getIconPosition(icon: IconPosition | undefined, variant: CanonicalBadgeVariant): IconPosition | undefined {
  if (variant === "link") {
    return "end";
  }

  return icon;
}

const LinkIcon = (
  <svg
    className="ds-badge__link-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

export interface BadgeProps extends Omit<BaseProps, "variant" | "size"> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: IconPosition;
  iconNode?: React.ReactNode;
  closable?: boolean;
  onRemove?: (value: string) => void;
}

const Badge = React.forwardRef<HTMLElement, BadgeProps>(function Badge(
  {
    as,
    className,
    children,
    variant = "default",
    size = "default",
    icon,
    iconNode,
    closable = false,
    onRemove,
    ...rest
  },
  ref,
) {
  const normalizedVariant = normalizeVariant(variant);
  const normalizedSize = normalizeSize(size);
  const iconPosition = getIconPosition(icon, normalizedVariant);

  const isDotOnly = normalizedVariant === "dot";
  const hasDot = normalizedVariant === "dot" || normalizedVariant === "text-dot";
  const shouldRenderAsButton = normalizedVariant === "link" && !closable;

  const Component: React.ElementType = as ?? (shouldRenderAsButton ? "button" : "span");

  const startIcon = iconPosition === "start";
  const endIcon = iconPosition === "end";
  const renderedIcon = iconNode ?? (normalizedVariant === "link" ? LinkIcon : null);

  const handleRemove = () => {
    onRemove?.(typeof children === "string" ? children.trim() : "");
  };

  return (
    <Component
      ref={ref}
      type={Component === "button" ? "button" : undefined}
      className={classNames(
        "ds-badge",
        `ds-badge--${normalizedVariant}`,
        `ds-badge--size-${normalizedSize}`,
        iconPosition ? `ds-badge--icon-${iconPosition}` : undefined,
        {
          "ds-badge--closable": closable,
          "ds-badge--dot-only": isDotOnly,
        },
        className,
      )}
      role={isDotOnly ? "status" : undefined}
      {...rest}
    >
      {hasDot ? <span className="ds-badge__dot" aria-hidden="true" /> : null}

      {startIcon ? <span className="ds-badge__icon ds-badge__icon--start">{renderedIcon}</span> : null}

      {!isDotOnly ? <span className="ds-badge__content">{children}</span> : null}

      {endIcon ? <span className="ds-badge__icon ds-badge__icon--end">{renderedIcon}</span> : null}

      {closable ? (
        <button className="ds-badge__close" type="button" aria-label="Remove" onClick={handleRemove}>
          <span aria-hidden="true">&times;</span>
        </button>
      ) : null}
    </Component>
  );
});

Badge.displayName = "Badge";

export default Badge;