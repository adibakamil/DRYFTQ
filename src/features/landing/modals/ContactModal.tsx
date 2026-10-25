import { useState, type FormEvent } from 'react';
import { Icon } from '../../../components/Icon';
import { Modal } from '../../../components/ui';

/** Legacy inline message shown when the pilot request is "sent". */
const STATUS_MESSAGE = 'Demo mode: no backend is connected yet, so this request was not sent.';

const SECTORS: string[] = [
  'Automotive & Robotics',
  'Electronics & Semiconductor',
  'Pharma & Biotech',
  'Heavy Manufacturing',
  'Energy & Utilities',
];

export interface ContactModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * "Talk to Our Engineering Team" enterprise-inquiry dialog. Submitting shows
 * the legacy inline demo-mode confirmation (no backend is connected) and hides
 * it again as soon as the form is edited.
 */
export function ContactModal({ open, onClose }: ContactModalProps) {
  const [status, setStatus] = useState<string | null>(null);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus(STATUS_MESSAGE);
    form.reset();
  };

  return (
    <Modal open={open} onClose={onClose} size="md" labelledBy="contactTitle">
      <div className="mb-5 pr-8">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-action">Enterprise Onboarding</span>
        <h2 className="mt-1 text-xl font-extrabold" id="contactTitle">
          Talk to Our Engineering Team
        </h2>
        <p className="text-sm text-gray-600">Deploy quantum process drift intelligence to your plant floor.</p>
      </div>
      <form className="space-y-4" id="inquiryForm" onSubmit={onSubmit} onChange={() => setStatus(null)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="firstName">
              First Name
            </label>
            <input
              className="field"
              id="firstName"
              name="firstName"
              type="text"
              autoComplete="given-name"
              placeholder="Jane"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="lastName">
              Last Name
            </label>
            <input
              className="field"
              id="lastName"
              name="lastName"
              type="text"
              autoComplete="family-name"
              placeholder="Doe"
              required
            />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="workEmail">
            Work Email
          </label>
          <input
            className="field"
            id="workEmail"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="jane@manufacturing.com"
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="sector">
            Industry Sector
          </label>
          <select className="field" id="sector" name="sector">
            {SECTORS.map((sector) => (
              <option key={sector}>{sector}</option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary w-full" type="submit">
          Request Pilot Evaluation <Icon name="arrow" className="icon-arrow" />
        </button>
        {status !== null && (
          <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900" role="status">
            {status}
          </p>
        )}
      </form>
    </Modal>
  );
}
