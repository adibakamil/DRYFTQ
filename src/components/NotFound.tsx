import { Link } from 'react-router-dom';
import { MODULE_ROUTES } from '../app/routes';

/** Branded 404 (React port of the legacy server's `NOT_FOUND_HTML`). */
export function NotFound() {
  return (
    <main className="console-scope flex min-h-screen items-center justify-center bg-brand-console p-6 text-white">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FF3D0A] shadow-lg shadow-orange-500/30">
          <span className="text-3xl font-black tracking-wider text-white">D</span>
        </div>
        <h1 className="mb-2 text-3xl font-extrabold tracking-tight">DRYFTQ Industrial OS</h1>
        <p className="mb-8 text-sm text-slate-400">AI-Powered Industrial Telemetry &amp; Plant Operations</p>

        <div className="rounded-2xl border border-[#0d3459] bg-[#07243E] p-8 text-left shadow-2xl">
          <h2 className="text-xl font-bold text-white">404 - Page Not Found</h2>
          <p className="mt-1 text-sm text-slate-400">The page you requested does not exist.</p>

          <div className="mt-6 border-t border-[#0d3459] pt-4">
            <Link
              to="/dashboard"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF3D0A] px-8 py-3.5 text-sm font-bold tracking-wide text-white shadow-lg shadow-orange-500/20 transition hover:bg-[#e03405]"
            >
              Return to Dashboard
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>

          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {MODULE_ROUTES.map((route) => (
              <li key={route.key}>
                <Link
                  to={route.path}
                  className="flex items-center gap-2 rounded-xl border border-white/5 bg-[#031B30]/60 p-3 text-sm transition hover:bg-[#FF3D0A]/10 hover:text-white"
                >
                  <span aria-hidden>▸</span>
                  <span className="font-medium text-slate-200">{route.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
