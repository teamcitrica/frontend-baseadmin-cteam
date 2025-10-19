'use client';
import React from 'react';
import { Select as HeroSelect, SelectItem } from '@heroui/select';
import clsx from 'clsx';
import Icon, { IconName } from './icon';

interface SelectOption {
  value: string;
  label: string;
  description?: string;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  defaultSelectedKeys?: string[];
  selectedKeys?: string[];
  onSelectionChange?: (keys: any) => void;
  name?: string;
  variant?: 'primary' | 'secondary' | 'flat' | 'bordered' | 'faded' | 'underlined';
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  required?: boolean;
  disabled?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
  description?: string;
  className?: string;
  classNames?: {
    base?: string;
    trigger?: string;
    label?: string;
    value?: string;
    selectorIcon?: string;
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
  options: SelectOption[];
}

const Select = ({
  label,
  placeholder,
  defaultSelectedKeys,
  selectedKeys,
  onSelectionChange,
  name,
  variant = 'primary',
  color = 'default',
  size = 'md',
  radius = 'md',
  required = false,
  disabled = false,
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
  options = [],
}: SelectProps) => {
  // Create icon content if icons are provided
  const startIconContent = startIcon ? (
    <Icon name={startIcon} size={iconSize} color={iconColor} />
  ) : startContent;

  const endIconContent = endIcon ? (
    <Icon name={endIcon} size={iconSize} color={iconColor} />
  ) : endContent;

  const getSelectClassByVariant = (variant: string) => {
    switch (variant) {
      case "primary":
        return "select-primary";
      case "secondary":
        return "select-secondary";
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
    <HeroSelect
      label={label}
      placeholder={placeholder}
      selectedKeys={selectedKeys}
      defaultSelectedKeys={defaultSelectedKeys}
      onSelectionChange={onSelectionChange}
      name={name}
      variant={heroVariant}
      color={color}
      size={size}
      isRequired={required}
      isDisabled={disabled}
      isInvalid={isInvalid}
      errorMessage={errorMessage}
      description={description}
      className={clsx(
        "select-citrica-ui",
        getSelectClassByVariant(variant),
        className
      )}
      classNames={classNames}
      startContent={startIconContent}
      endContent={endIconContent}
      fullWidth={fullWidth}
    >
      {options.map((option) => (
        <SelectItem
          key={option.value}
          textValue={option.label}
          description={option.description}
          startContent={option.startContent}
          endContent={option.endContent}
          className='select-item-citrica-ui'
        >
          {option.label}
        </SelectItem>
      ))}
    </HeroSelect>
  );
};

export default Select;
export type { SelectProps, SelectOption };