'use client';
import React from 'react';
import { Input as HeroInput } from '@heroui/react';
import clsx from 'clsx';
import Icon, { IconName } from './icon';

interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValueChange?: (value: string) => void;
  name?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  variant?: 'primary' | 'secondary' | 'flat' | 'bordered' | 'faded' | 'underlined';
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
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
}

const Input = ({
  label,
  placeholder,
  value,
  defaultValue,
  onChange,
  onValueChange,
  name,
  type = 'text',
  variant = 'primary',
  color = 'default',
  size = 'md',
  radius = 'md',
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
}: InputProps) => {
  // Create icon content if icons are provided
  const startIconContent = startIcon ? (
    <Icon name={startIcon} size={iconSize} color={iconColor} />
  ) : startContent;

  const endIconContent = endIcon ? (
    <Icon name={endIcon} size={iconSize} color={iconColor} />
  ) : endContent;

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

  const shouldUseCustomVariant = variant === 'primary' || variant === 'secondary';
  const heroVariant = shouldUseCustomVariant ? 'bordered' : variant;

  return (
    <HeroInput
      label={label}
      placeholder={placeholder}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      onValueChange={onValueChange}
      name={name}
      type={type}
      variant={heroVariant}
      color={'default'}
      size={size}
      radius={radius}
      isRequired={required}
      isDisabled={disabled}
      isReadOnly={readOnly}
      isInvalid={isInvalid}
      errorMessage={errorMessage}
      description={description}
      className={clsx(
        "input-citrica-ui",
        getInputClassByVariant(variant),
        className
      )}
      classNames={classNames}
      startContent={startIconContent}
      endContent={endIconContent}
      fullWidth={fullWidth}
      isClearable={clearable}
      autoFocus={autoFocus}
      autoComplete={autoComplete}
      maxLength={maxLength}
      minLength={minLength}
      pattern={pattern}
      step={step}
      min={min}
      max={max}
    />
  );
};

export default Input;
export type { InputProps };