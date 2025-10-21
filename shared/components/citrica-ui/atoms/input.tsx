"use client";
import React, { forwardRef } from "react";
import { Input as HeroInput } from "@heroui/react";
import clsx from "clsx";

import Icon, { IconName } from "./icon";

type ValidationRule = {
  test: (value: string) => boolean;
  message: string;
};

interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValueChange?: (value: string) => void;
  name?: string;
  type?:
    | "text"
    | "email"
    | "password"
    | "number"
    | "tel"
    | "url"
    | "search"
    | "date"
    | "datetime-local"
    | "time";
  variant?:
    | "primary"
    | "secondary"
    | "flat"
    | "bordered"
    | "faded"
    | "underlined";
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";
  size?: "sm" | "md" | "lg";
  radius?: "none" | "sm" | "md" | "lg" | "full";
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
  description?: string;
  className?: string;
  classNames?: {
    base?: string;
    mainWrapper?: string;
    input?: string;
    inputWrapper?: string;
    label?: string;
    description?: string;
    errorMessage?: string;
  };
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  startIcon?: IconName;
  endIcon?: IconName;
  iconSize?: number;
  iconColor?: string;
  fullWidth?: boolean;
  clearable?: boolean;
  autoFocus?: boolean;
  autoComplete?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  step?: string | number;
  min?: string | number;
  max?: string | number;
  // Validación automática
  autoValidate?: boolean;
  validationRules?: ValidationRule[];
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
  // Estados de carga
  loading?: boolean;
  // Callback de validación
  onValidationChange?: (isValid: boolean, errors: string[]) => void;
  // Soporte para react-hook-form
  register?: any;
  errors?: any;
  // Helpers de texto
  helperText?: string;
  showCharacterCount?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  placeholder,
  value,
  defaultValue,
  onChange,
  onValueChange,
  name,
  type = "text",
  variant = "primary",
  color = "default",
  size = "md",
  radius = "md",
  required = false,
  disabled = false,
  readOnly = false,
  isInvalid = false,
  errorMessage,
  description,
  className,
  classNames,
  startContent,
  endContent,
  startIcon,
  endIcon,
  iconSize = 20,
  iconColor,
  fullWidth = true,
  clearable = false,
  autoFocus = false,
  autoComplete,
  maxLength,
  minLength,
  pattern,
  step,
  min,
  max,
}, ref) => {
  // Create icon content if icons are provided
  const startIconContent = startIcon ? (
    <Icon color={iconColor} name={startIcon} size={iconSize} />
  ) : (
    startContent
  );

  const endIconContent = endIcon ? (
    <Icon color={iconColor} name={endIcon} size={iconSize} />
  ) : (
    endContent
  );

  const getInputClassByVariant = (variant: string) => {
    switch (variant) {
      case "primary":
        return "input-primary";
      case "secondary":
        return "input-secondary";
      case "flat":
      case "bordered":
      case "faded":
      case "underlined":
      default:
        return "";
    }
  };

  const shouldUseCustomVariant =
    variant === "primary" || variant === "secondary";
  const heroVariant = shouldUseCustomVariant ? "bordered" : variant;

  return (
    <HeroInput
      ref={ref}
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      className={clsx(
        "input-citrica-ui",
        getInputClassByVariant(variant),
        className,
      )}
      classNames={classNames}
      color={"default"}
      defaultValue={defaultValue}
      description={description}
      endContent={endIconContent}
      errorMessage={errorMessage}
      fullWidth={fullWidth}
      isClearable={clearable}
      isDisabled={disabled}
      isInvalid={isInvalid}
      isReadOnly={readOnly}
      isRequired={required}
      label={label}
      max={max}
      maxLength={maxLength}
      min={min}
      minLength={minLength}
      name={name}
      pattern={pattern}
      placeholder={placeholder}
      radius={radius}
      size={size}
      startContent={startIconContent}
      step={step}
      type={type}
      value={value}
      variant={heroVariant}
      onChange={onChange}
      onValueChange={onValueChange}
    />
  );
});

// Agregar displayName para debugging
Input.displayName = 'Input';

export default Input;
export type { InputProps };
