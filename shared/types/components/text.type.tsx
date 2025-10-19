export interface TextProps {
  children: React.ReactNode;
  variant: 'display' | 'headline' | 'title' | 'subtitle' | 'body' | 'label' | 'headlinecustom';
  weight?: 'light' | 'normal' | 'bold';
  color?: string;
  textColor?: string;
  className?: string;
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div';
}