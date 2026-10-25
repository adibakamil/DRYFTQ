import { cx } from '../../lib/utils';
import { Icon, type IconName } from '../Icon';

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: IconName;
  /** Small count bubble (active alerts, open tasks…). */
  count?: number;
}

export interface TabsProps<T extends string> {
  items: TabItem<T>[];
  value: T;
  onChange(value: T): void;
  ariaLabel: string;
  className?: string;
}

/** Segmented control used for page-level filters (status tabs, ranges…). */
export function Tabs<T extends string>({ items, value, onChange, ariaLabel, className }: TabsProps<T>) {
  return (
    <div role="tablist" aria-label={ariaLabel} className={cx('flex flex-wrap items-center gap-1.5', className)}>
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            data-active={active}
            className="tab-btn"
            onClick={() => onChange(item.id)}
          >
            {item.icon && <Icon name={item.icon} />}
            {item.label}
            {typeof item.count === 'number' && (
              <span
                className={cx(
                  'ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                  active ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600',
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
