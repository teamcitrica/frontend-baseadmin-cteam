import React, { ReactNode } from 'react';
import {Card as CardHeroUI, CardBody as CardBodyHeroUI, CardHeader as CardHeaderHeroUI, CardFooter as CardFooterHeroUI} from "@heroui/card";
import clsx from 'clsx';

interface CardProps {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  radius?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'shadow' | 'bordered' | 'light' | 'flat';
  isPressable?: boolean;
  onPress?: () => void;
}

const Card = ({
  children,
  header,
  footer,
  className,
  shadow = 'sm',
  radius = 'md',
  isPressable = false,
  onPress
}: CardProps) => {
  return (
    <CardHeroUI
      className={clsx(className)}
      shadow={shadow}
      radius={radius}
      // variant={variant}
      isPressable={isPressable}
      onPress={onPress}
    >
      {header && (
        <CardHeaderHeroUI>
          {header}
        </CardHeaderHeroUI>
      )}
      <CardBodyHeroUI>
        {children}
      </CardBodyHeroUI>
      {footer && (
        <CardFooterHeroUI>
          {footer}
        </CardFooterHeroUI>
      )}
    </CardHeroUI>
  );
}

export default Card;