import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../../../components/ui';

/** Legacy inline message shown on simulated sign-in. */
const STATUS_MESSAGE = 'Authentication simulated. Accessing telemetry node...';

export interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * "Sign in to Industrial Console" — no backend is wired up, so submitting shows
 * the legacy inline confirmation and hands the visitor over to the console
 * (`/dashboard`) after 900 ms. Editing the form hides the status again.
 */
export function LoginModal({ open, onClose }: LoginModalProps) {
  const navigate = useNavigate();
  const [status, setStatus] = useState<string | null>(null);

  // Simulated sign-in hands over to the console, like the legacy demo flow.
  useEffect(() => {
    if (status === null) return;
    const timer = window.setTimeout(() => navigate('/dashboard'), 900);
    return () => window.clearTimeout(timer);
  }, [status, navigate]);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus(STATUS_MESSAGE);
    form.reset();
  };

  return (
    <Modal open={open} onClose={onClose} size="md" panelClassName="!max-w-md" labelledBy="loginTitle">
      <div className="mb-5 text-center">
        <span className="text-2xl font-black tracking-tight">DRYFTQ</span>
        <h2 className="mt-2 text-lg font-bold" id="loginTitle">
          Sign in to Industrial Console
        </h2>
        <p className="text-sm text-gray-600">Enter your enterprise operator credentials.</p>
      </div>
      <form className="space-y-4" id="loginForm" onSubmit={onSubmit} onChange={() => setStatus(null)}>
        <div>
          <label className="label" htmlFor="loginEmail">
            Corporate Email
          </label>
          <input
            className="field"
            id="loginEmail"
            name="email"
            type="email"
            autoComplete="username"
            placeholder="operator@enterprise.com"
            required
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-700" htmlFor="loginPw">
              Password
            </label>
            <a className="text-sm font-medium text-brand-action hover:underline" href="#">
              Forgot?
            </a>
          </div>
          <input
            className="field"
            id="loginPw"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••••••"
            required
          />
        </div>
        <button className="btn btn-primary w-full" type="submit">
          Sign In
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
