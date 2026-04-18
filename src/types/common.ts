import type React from "react";

export interface BaseProps extends React.HTMLAttributes<HTMLElement> {
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "tertiary" | "outline" | "ghost";
  isDisabled?: boolean;
  as?: React.ElementType;
}