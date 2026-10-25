import { cx } from '../../lib/utils';
import { useToasts } from '../../store/context';
import { Icon, type IconName } from '../Icon';
import type { ToastType } from '../../lib/types';

const ICON: Record<ToastType, IconName> = {
  success: 'check',
  error: 'warn',
  warning: 'warn',
  info: 'info',
};

const TONE: Record<ToastType, string> = {
  success: 'border-emerald-500/40 bg-emerald-950 text-emerald-100',
  error: 'border-red-500/40 bg-red-950 text-red-100',
  warning: 'border-amber-500/40 bg-amber-950 text-amber-100',
  info: 'border-blue-500/40 bg-blue-950 text-blue-100',
};

/**
 * Global toast stack — replaces `Dryftq.toast()`.
 * Screen-reader friendly (`role="status"` + polite live region).
 */
export function ToastHost() {
  const { toasts, dismissToast } = useToasts();

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[70] flex w-[min(92vw,24rem)] flex-col gap-2.5"
      role="status"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cx(
            'pointer-events-auto flex items-start gap-3 rounded-xl border p-3.5 shadow-pop animate-slide-in-right',
            TONE[toast.type],
          )}
        >
          <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-white/10">
            <Icon name={ICON[toast.type]} className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0 flex-1">
            {toast.title && <p className="text-sm font-bold">{toast.title}</p>}
            <p className="text-xs leading-relaxed opacity-90">{toast.message}</p>
          </div>
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            aria-label="Dismiss notification"
            className="rounded-md p-1 opacity-60 transition hover:bg-white/10 hover:opacity-100"
          >
            <Icon name="close" className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
