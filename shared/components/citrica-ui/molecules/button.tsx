'use client'
import React from "react";
import Text from "../atoms/text";
import {Button as ButtonHeroUI} from "@heroui/react";
import clsx from 'clsx';
import { get } from "http";

type ButtonProps = {
  onClick?: () => void;
  label?: string;
  children?: React.ReactNode;
  // variant?: "solid" | "bordered" | "light" | "flat" | "faded" | "shadow" | "ghost";
  variant?: "primary" | "secondary" | "flat" | "success" | "warning" | "danger";
  textVariant?: "label" | "body" | "title" | "display" | "headline" | "subtitle";
  // color?: "primary" | "secondary" | "default" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  // radius?: "none" | "sm" | "md" | "lg" | "full";
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  isLoading?: boolean;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  fullWidth?: boolean;
};




const getTextColorByVariant = (variant: string) => {
  switch (variant) {
    case "primary":
      return "color-on-primary";
    case "secondary":
      return "color-on-secondary";
    case "success":
      return "color-on-success";
    case "warning":
      return "color-on-warning";
    case "danger":
      return "color-on-danger";
    case "flat":
      return "color-black";
    default:
      return "color-on-primary";
  }
}

const getBtnClassByVariant = (variant: string) => {
  switch (variant) {
    case "primary":
      return "btn-primary";
    case "secondary":
      return "btn-secondary";
    case "success":
      return "btn-success";
    case "warning":
      return "btn-warning";
    case "danger":
      return "btn-danger";
    case "flat":
      return "btn-flat";
    default:
      return "btn-primary";
  }
}

const Button = ({ 
  onClick, 
  label,
  children,
  textVariant = "label", // Set default text variant
  variant = "primary", 
  size = "md",
  className = "",
  type = "button",
  disabled = false,
  isLoading = false,
  startContent,
  endContent,
  fullWidth = false
}: ButtonProps) => {
  const content = children || (label && (
    <Text 
      variant={textVariant} 
      textColor={getTextColorByVariant(variant)}
    >
      {label}
    </Text>
  ));

  return (
    <ButtonHeroUI 
      color="default" 
      onPress={onClick} 
      className={clsx(
        "btn-citrica-ui", 
        getBtnClassByVariant(variant), 
        className
      )} 
      // variant={variant}
      size={size}
      radius={"none"}
      type={type}
      isDisabled={disabled}
      isLoading={isLoading}
      startContent={startContent}
      endContent={endContent}
      fullWidth={fullWidth}
    >
      {content}
    </ButtonHeroUI>
  )
}

export default Button;