import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { cx } from '../../lib/utils';

export interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

/** Label + control + validation message wrapper (accessibility-safe ids). */
export function Field({ label, htmlFor, error, hint, required, children, className }: FieldProps) {
  return (
    <div className={className}>
      <label className="label" htmlFor={htmlFor}>
        {label}
        {required ? <span className="ml-0.5 text-brand-action">*</span> : null}
      </label>
      {children}
      {error ? (
        <span className="field-error" role="alert">
          {error}
        </span>
      ) : hint ? (
        <span className="mt-1.5 block text-xs text-gray-500">{hint}</span>
      ) : null}
    </div>
  );
}

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  invalid?: boolean;
};

export function TextInput({ id, invalid, className, ...rest }: TextFieldProps) {
  return <input id={id} aria-invalid={invalid || undefined} className={cx('field', className)} {...rest} />;
}

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  id: string;
  invalid?: boolean;
};

export function Select({ id, invalid, className, children, ...rest }: SelectFieldProps) {
  return (
    <select id={id} aria-invalid={invalid || undefined} className={cx('field', className)} {...rest}>
      {children}
    </select>
  );
}

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  id: string;
  invalid?: boolean;
};

export function TextArea({ id, invalid, className, ...rest }: TextAreaProps) {
  return <textarea id={id} aria-invalid={invalid || undefined} className={cx('field min-h-[92px]', className)} {...rest} />;
}
