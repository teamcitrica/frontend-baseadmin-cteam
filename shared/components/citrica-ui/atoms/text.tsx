import React from 'react';
import { TextProps } from '@/shared/types/components/text.type';
import clsx from 'clsx';

const Text: React.FC<TextProps> = ({ 
  children, 
  variant, 
  color, 
  weight = 'normal', 
  textColor = 'color-black',
  className,
  as: Component = 'span'
}) => {
  const colorStyle = color ? { color } : { color: `var(--${textColor})` };

  const weightClass = weight !== 'normal' ? `text-${variant}-${weight}` : '';

  const classes = clsx(
    `text-${variant}`,
    'text-component',
    weightClass,
    className
  );

  return (
    <Component 
      className={classes}
      style={colorStyle}
    >
      {children}
    </Component>
  );
};

export default Text;