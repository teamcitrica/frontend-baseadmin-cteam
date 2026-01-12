'use client'
/**
 * Button component wrapper for citrica-ui-toolkit
 * Provides backward compatibility with onClick prop while using citrica-ui-toolkit
 */
import React from 'react';
import { Button as CitricaButton, ButtonProps as CitricaButtonProps } from 'citrica-ui-toolkit';

interface ButtonProps extends Omit<CitricaButtonProps, 'onPress'> {
  onClick?: () => void;
  onPress?: () => void;
  disabled?: boolean;
  isAdmin?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  onPress,
  disabled,
  isDisabled,
  isAdmin = false,
  ...props
}) => {
  const handlePress = onClick || onPress;

  return (
    <CitricaButton
      onPress={handlePress}
      isDisabled={disabled || isDisabled}
      isAdmin={isAdmin}
      {...props}
    />
  );
};

export default Button;
