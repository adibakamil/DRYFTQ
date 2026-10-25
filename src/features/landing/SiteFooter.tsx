import { useEffect, useState } from 'react';
import { Icon, type IconName } from '../../components/Icon';

const SOCIALS: Array<{ icon: IconName; label: string }> = [
  { icon: 'linkedin', label: 'DRYFTQ on LinkedIn' },
  { icon: 'x', label: 'DRYFTQ on X' },
  { icon: 'youtube', label: 'DRYFTQ on YouTube' },
];

const COLUMNS: Array<{ title: string; links: Array<{ label: string; href: string }> }> = [
  {
    title: 'Platform',
    links: [
      { label: 'Overview', href: '#platform' },
      { label: 'Solutions', href: '#about' },
      { label: 'Features', href: '#services' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
      { label: 'Careers', href: '#' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Privacy', href: '#' },
    ],
  },
];

/** Site footer with the platform/company/resources link columns. */
export function SiteFooter() {
  // Legacy replaced the static `#year` (2026) with the current year on load.
  const [year, setYear] = useState(2026);
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="border-t border-gray-200 bg-white" id="contact-footer">
      <div className="container-x pb-8 pt-14 md:pt-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-5">
          <div className="col-span-2">
            <span className="block text-xl font-black tracking-tight">DRYFTQ</span>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-gray-600">
              The industrial AI and quantum intelligence platform for smarter, more resilient manufacturing.
            </p>
            <ul className="mt-5 flex items-center gap-3">
              {SOCIALS.map((social) => (
                <li key={social.label}>
                  <a className="social" href="#" aria-label={social.label}>
                    <Icon name={social.icon} className="icon-fill h-4 w-4" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-brand-ink">{column.title}</h2>
              <ul className="space-y-2.5 text-sm">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a className="foot-link" href={link.href}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-2 border-t border-gray-100 pt-6 text-xs text-gray-600 sm:flex-row">
          <p>© {year} DRYFTQ. All rights reserved.</p>
          <p className="font-medium">Smarter insights. Stronger industry.</p>
        </div>
      </div>
    </footer>
  );
}
