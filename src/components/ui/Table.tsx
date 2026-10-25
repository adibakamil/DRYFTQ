import type { HTMLAttributes, ReactNode, ThHTMLAttributes, TdHTMLAttributes } from 'react';
import { cx } from '../../lib/utils';

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  /** Console tables render on the dark navy surface. */
  tone?: 'light' | 'dark';
  children: ReactNode;
}

export function Table({ tone = 'light', className, children, ...rest }: TableProps) {
  return (
    <div className="thin-scroll w-full overflow-x-auto">
      <table
        className={cx('w-full border-collapse text-left text-sm', className)}
        data-tone={tone}
        {...rest}
      >
        {children}
      </table>
    </div>
  );
}

export function Thead({ tone = 'light', children }: { tone?: 'light' | 'dark'; children: ReactNode }) {
  return (
    <thead
      className={cx(
        'text-[11px] uppercase tracking-wider',
        tone === 'dark' ? 'text-slate-400' : 'text-gray-500',
      )}
    >
      {children}
    </thead>
  );
}

export function Tr({ className, children, ...rest }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cx('border-b last:border-b-0', className)} {...rest}>
      {children}
    </tr>
  );
}

export function Th({ className, tone = 'light', ...rest }: ThHTMLAttributes<HTMLTableCellElement> & { tone?: 'light' | 'dark' }) {
  return (
    <th
      scope="col"
      className={cx(
        'px-4 py-3 font-semibold',
        tone === 'dark' ? 'border-[#0d3459]' : 'border-gray-200',
        className,
      )}
      {...rest}
    />
  );
}

export function Td({ className, tone = 'light', ...rest }: TdHTMLAttributes<HTMLTableCellElement> & { tone?: 'light' | 'dark' }) {
  return (
    <td
      className={cx(
        'px-4 py-3 align-middle',
        tone === 'dark'
          ? 'border-[#0d3459] text-slate-200'
          : 'border-gray-200 text-gray-700',
        className,
      )}
      {...rest}
    />
  );
}
