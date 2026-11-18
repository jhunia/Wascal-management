/* ==========================================================================
   SHEET: a panel that slides in from the right on laptops and up from
   the bottom on phones. Used for "Post update". Closes on Esc or backdrop.
   ========================================================================== */
import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import s from './Sheet.module.css';

export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className={s.root}>
      <div className={s.backdrop} onClick={onClose} />
      <div className={s.panel} role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : undefined}>
        <div className={s.grip} aria-hidden />
        <header className={s.head}>
          <h2 className={s.title}>{title}</h2>
          <button className={s.close} onClick={onClose} aria-label={t('common.close')}>
            <X size={18} weight="bold" />
          </button>
        </header>
        <div className={s.body}>{children}</div>
        {footer && <footer className={s.foot}>{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}
