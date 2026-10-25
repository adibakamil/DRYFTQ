import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../lib/utils';
import { Icon } from '../Icon';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Accessible name for the dialog. Either this or `labelledBy` is required. */
  'aria-label'?: string;
  labelledBy?: string;
  /** Width preset for the panel. */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Dark console styling (notifications, command palette…). */
  tone?: 'light' | 'dark';
  panelClassName?: string;
  /** Hide the default corner close button (custom headers may render their own). */
  hideClose?: boolean;
}

const SIZE_CLASS = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
};

/**
 * Accessible dialog: focus trap, Escape to close, backdrop click, scroll lock
 * and focus restoration — the behaviours the legacy inline modal script provided.
 */
export function Modal({
  open,
  onClose,
  children,
  'aria-label': ariaLabel,
  labelledBy,
  size = 'md',
  tone = 'light',
  panelClassName,
  hideClose,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  const close = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    if (!open) return;
    lastFocused.current = document.activeElement as HTMLElement | null;

    const panel = panelRef.current;
    const focusTarget = panel?.querySelector<HTMLElement>('input, select, textarea, button:not(.modal-close)') ?? panel;
    focusTarget?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== 'Tab' || !panel) return;
      const nodes = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null,
      );
      if (!nodes.length) return;
      const first = nodes[0]!;
      const last = nodes[nodes.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      lastFocused.current?.focus?.();
    };
  }, [open, close]);

  if (!open) return null;

  return createPortal(
    <div
      className="modal animate-fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={cx(
          'modal-panel animate-scale-in',
          SIZE_CLASS[size],
          tone === 'dark' && '!bg-gray-950 !p-4',
          panelClassName,
        )}
      >
        {!hideClose && (
          <button
            type="button"
            className={cx('modal-close', tone === 'dark' && '!text-gray-300 hover:!bg-white/10 hover:!text-white')}
            aria-label="Close dialog"
            onClick={close}
          >
            <Icon name="close" />
          </button>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'default' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

/** Confirmation dialog used for destructive actions (remove member, reset data…). */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} size="sm" aria-label={title}>
      <h2 className="pr-8 text-lg font-bold text-brand-ink">{title}</h2>
      <div className="mt-2 text-sm leading-relaxed text-gray-600">{message}</div>
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button type="button" className="btn btn-outline btn-sm" onClick={onCancel}>
          {cancelLabel}
        </button>
        <button
          type="button"
          className={cx('btn btn-sm', tone === 'danger' ? 'btn-danger' : 'btn-primary')}
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
