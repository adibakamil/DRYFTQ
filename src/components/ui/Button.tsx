import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/utils';

type Variant = 'primary' | 'outline' | 'white' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const VARIANT_CLASS: Record<Variant, string> = {
  primary: 'btn-primary',
  outline: 'btn-outline',
  white: 'btn-white',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
};

const SIZE_CLASS: Record<Size, string> = { sm: 'btn-sm', md: '', lg: 'btn-lg' };

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Icon rendered before the label. */
  icon?: ReactNode;
  /** Icon rendered after the label (arrow-style affordance). */
  trailing?: ReactNode;
  block?: boolean;
}

/**
 * The single button primitive — every variant maps onto the `.btn` design-system
 * classes so marketing and console buttons stay visually identical.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  trailing,
  block,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx('btn', VARIANT_CLASS[variant], SIZE_CLASS[size], block && 'w-full', className)}
      {...rest}
    >
      {icon}
      {children}
      {trailing}
    </button>
  );
}
