import React from "react";

import type { BaseProps } from "@types/common";
import { classNames } from "@utils/classNames";

import "../../../tokens/_tier2-input.scss";

type InputType = "text" | "password" | "email" | "number" | "tel" | "url" | "search" | "select" | "textarea";

const INPUT_TYPES: ReadonlyArray<InputType> = [
  "text",
  "password",
  "email",
  "number",
  "tel",
  "url",
  "search",
  "select",
  "textarea",
];

type InputSize = NonNullable<BaseProps["size"]> | "default";

const INPUT_SIZE_ALIASES: Record<string, "small" | "default" | "large"> = {
  sm: "small",
  s: "small",
  md: "default",
  m: "default",
  default: "default",
  lg: "large",
  l: "large",
};

function normalizeType(value: InputType | undefined): InputType {
  const raw = String(value ?? "text").trim().toLowerCase();

  return INPUT_TYPES.includes(raw as InputType) ? (raw as InputType) : "text";
}

function normalizeSize(value: InputSize | undefined): "small" | "default" | "large" {
  const raw = String(value ?? "default").trim().toLowerCase();
  return INPUT_SIZE_ALIASES[raw] ?? "default";
}

export interface InputProps extends Omit<BaseProps, "variant" | "as"> {
  type?: InputType;
  label?: string;
  helper?: string;
  error?: string;
  name?: string;
  placeholder?: string;
  value?: string | number;
  defaultValue?: string | number;
  required?: boolean;
  isDisabled?: boolean;
  size?: InputSize;
  onValueInput?: (value: string, name?: string) => void;
  onValueChange?: (value: string, name?: string) => void;
}

const Input = React.forwardRef<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, InputProps>(
  function Input(
    {
      className,
      id,
      type = "text",
      label,
      helper,
      error,
      name,
      placeholder,
      value,
      defaultValue,
      required = false,
      isDisabled = false,
      size = "default",
      children,
      onInput,
      onChange,
      onValueInput,
      onValueChange,
      ...rest
    },
    ref,
  ) {
    const normalizedType = normalizeType(type);
    const normalizedSize = normalizeSize(size);
    const hasError = Boolean(error);
    const generatedId = React.useId();
    const fieldId = id ?? `ds-input-${generatedId.replace(/[:]/g, "")}`;

    const handleInput: React.FormEventHandler<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> = (event) => {
      onInput?.(event);
      onValueInput?.(event.currentTarget.value, name);
    };

    const handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> = (event) => {
      onChange?.(event);
      onValueChange?.(event.currentTarget.value, name);
    };

    const fieldClassName =
      normalizedType === "select"
        ? "ds-input__select"
        : normalizedType === "textarea"
          ? "ds-input__textarea"
          : "ds-input__field";

    return (
      <div
        className={classNames(
          "ds-input",
          `ds-input--size-${normalizedSize}`,
          { "ds-input--error": hasError },
          className,
        )}
      >
        {label ? (
          <label className="ds-input__label" htmlFor={fieldId}>
            {label}
            {required ? <span className="ds-input__required">*</span> : null}
          </label>
        ) : null}

        {normalizedType === "select" ? (
          <select
            id={fieldId}
            ref={ref as React.Ref<HTMLSelectElement>}
            className={fieldClassName}
            name={name}
            disabled={isDisabled}
            required={required}
            value={value as string | number | readonly string[] | undefined}
            defaultValue={defaultValue as string | number | readonly string[] | undefined}
            onInput={handleInput as React.FormEventHandler<HTMLSelectElement>}
            onChange={handleChange as React.ChangeEventHandler<HTMLSelectElement>}
            {...rest}
          >
            {children}
          </select>
        ) : normalizedType === "textarea" ? (
          <textarea
            id={fieldId}
            ref={ref as React.Ref<HTMLTextAreaElement>}
            className={fieldClassName}
            name={name}
            placeholder={placeholder}
            disabled={isDisabled}
            required={required}
            value={value as string | number | readonly string[] | undefined}
            defaultValue={defaultValue as string | number | readonly string[] | undefined}
            onInput={handleInput as React.FormEventHandler<HTMLTextAreaElement>}
            onChange={handleChange as React.ChangeEventHandler<HTMLTextAreaElement>}
            {...rest}
          />
        ) : (
          <input
            id={fieldId}
            ref={ref as React.Ref<HTMLInputElement>}
            className={fieldClassName}
            type={normalizedType}
            name={name}
            placeholder={placeholder}
            disabled={isDisabled}
            required={required}
            value={value as string | number | readonly string[] | undefined}
            defaultValue={defaultValue as string | number | readonly string[] | undefined}
            onInput={handleInput as React.FormEventHandler<HTMLInputElement>}
            onChange={handleChange as React.ChangeEventHandler<HTMLInputElement>}
            {...rest}
          />
        )}

        {hasError ? <span className="ds-input__error">{error}</span> : null}
        {helper && !hasError ? <span className="ds-input__helper">{helper}</span> : null}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;