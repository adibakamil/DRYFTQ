import type { FormEvent } from 'react';
import { Select } from '../../components/ui';
import {
  ACCENT_BLOCK,
  DATE_FORMAT_OPTIONS,
  LANGUAGE_OPTIONS,
  THEME_OPTIONS,
  TIMEZONE_OPTIONS,
  UNIT_OPTIONS,
  type SelectOption,
  type SettingsDraft,
  type ThemeChoice,
} from './shared';

/* ------------------------------------------------------------------ */
/* One label + select row (legacy: label `sm:w-1/3`, control `sm:w-2/3`) */
/* ------------------------------------------------------------------ */

interface SelectRowProps<T extends string> {
  id: string;
  label: string;
  value: T;
  options: readonly SelectOption<T>[];
  onChange(value: T): void;
}

function SelectRow<T extends string>({ id, label, value, options, onChange }: SelectRowProps<T>) {
  return (
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
      <label htmlFor={id} className="text-sm font-semibold text-slate-300 sm:w-1/3">
        {label}
      </label>
      <div className="relative sm:w-2/3">
        <Select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value as T)}
          className="cursor-pointer"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* System Settings card                                                */
/* ------------------------------------------------------------------ */

export interface SettingsFormCardProps {
  draft: SettingsDraft;
  onDraft(patch: Partial<SettingsDraft>): void;
  onSubmit(event: FormEvent<HTMLFormElement>): void;
}

/** Legacy `#settings-form` card — every select is controlled by the draft. */
export function SettingsFormCard({ draft, onDraft, onSubmit }: SettingsFormCardProps) {
  return (
    <article
      className="console-card-solid flex min-h-[580px] flex-col justify-between p-6 lg:col-span-7 lg:p-8"
      data-purpose="settings-form-card"
    >
      <div>
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">System Settings</h3>
            <p className="mt-1 text-xs text-slate-400">
              Configure language, time standard, and measurement units across dashboards
            </p>
          </div>
          <span className="chip whitespace-nowrap border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            Sync: Real-time
          </span>
        </div>

        <form id="settings-form" className="space-y-6" onSubmit={onSubmit}>
          <SelectRow
            id="select-language"
            label="Language"
            value={draft.language}
            options={LANGUAGE_OPTIONS}
            onChange={(language) => onDraft({ language })}
          />
          <SelectRow
            id="select-timezone"
            label="Timezone"
            value={draft.timezone}
            options={TIMEZONE_OPTIONS}
            onChange={(timezone) => onDraft({ timezone })}
          />
          <SelectRow
            id="select-date-format"
            label="Date Format"
            value={draft.dateFormat}
            options={DATE_FORMAT_OPTIONS}
            onChange={(dateFormat) => onDraft({ dateFormat })}
          />
          <SelectRow
            id="select-theme"
            label="Theme"
            value={draft.theme}
            options={THEME_OPTIONS}
            onChange={(theme) => onDraft({ theme: theme as ThemeChoice })}
          />
          <SelectRow
            id="select-units"
            label="Units"
            value={draft.units}
            options={UNIT_OPTIONS}
            onChange={(units) => onDraft({ units })}
          />

          <div className="pt-6">
            <button type="submit" className={ACCENT_BLOCK}>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </article>
  );
}
