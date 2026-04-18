import React from "react";

import type { BaseProps } from "@types/common";
import { classNames } from "@utils/classNames";

const BaseComponent = React.forwardRef<HTMLElement, BaseProps>(function BaseComponent(
  {
    as: Component = "div",
    className,
    variant = "primary",
    size = "md",
    isDisabled,
    ...rest
  },
  ref,
) {
  return (
    <Component
      ref={ref}
      className={classNames(
        "ds-base-component",
        `ds-base-component--${variant}`,
        `ds-base-component--${size}`,
        { "is-disabled": Boolean(isDisabled) },
        className,
      )}
      aria-disabled={isDisabled || undefined}
      {...rest}
    />
  );
});

BaseComponent.displayName = "BaseComponent";

export default BaseComponent;