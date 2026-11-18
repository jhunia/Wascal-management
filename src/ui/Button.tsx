/* Button: primary (WASCAL blue), accent (ochre, the main action), secondary (outlined), ghost (text only), danger. */
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cx } from '@/lib/cx';
import s from './Button.module.css';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  icon?: ReactNode;
  block?: boolean; // full width
}

/** Same look as Button, but navigates to another page (a real link). */
export function ButtonLink({
  to,
  variant = 'secondary',
  size = 'md',
  icon,
  children,
  className,
}: { to: string; variant?: Props['variant']; size?: Props['size']; icon?: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <Link to={to} className={cx(s.btn, s.link, s[variant], s[size], !children && s.iconOnly, className)}>
      {icon}
      {children && <span>{children}</span>}
    </Link>
  );
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'secondary', size = 'md', icon, block, className, children, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx(s.btn, s[variant], s[size], block && s.block, !children && s.iconOnly, className)}
      {...rest}
    >
      {icon}
      {children && <span>{children}</span>}
    </button>
  );
});
