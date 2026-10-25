import { useEffect, useRef, useState } from 'react';
import { cx } from '../../lib/utils';
import { Icon } from '../../components/Icon';

interface NavItem {
  href: string;
  label: string;
}

/** Primary nav — labels and hrefs are the legacy ones, quirks included. */
const NAV_ITEMS: NavItem[] = [
  { href: '#hero', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#services', label: 'Services' },
  { href: '#process', label: 'Portfolio' },
  { href: '#platform', label: 'Blog' },
  { href: '#contact-footer', label: 'Contact' },
];

const MOBILE_LINK_CLASS =
  'block rounded-lg px-3 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 aria-[current=true]:bg-brand-tint aria-[current=true]:text-brand-action';

export interface SiteHeaderProps {
  /** Hash of the section the scroll-spy currently highlights (`null` = none). */
  currentSection: string | null;
  onLogin: () => void;
  onGetStarted: () => void;
}

/**
 * Sticky site header: wordmark, desktop primary nav (scroll-spy aware via
 * `data-current`), Login / Get Started triggers and the mobile menu
 * (aria-expanded toggle that swaps the menu/close icon, closes on link click,
 * on Escape and when the viewport crosses the 1024px breakpoint).
 */
export function SiteHeader({ currentSection, onLogin, onGetStarted }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Legacy: matchMedia('(min-width: 1024px)') → close the menu on desktop.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setMenuOpen(false);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Legacy: Escape closes an open menu and restores focus to the toggle.
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const isCurrent = (href: string) => currentSection === href;
  // Opening a modal always collapses the mobile menu (legacy openModal did).
  const openLogin = () => {
    setMenuOpen(false);
    onLogin();
  };
  const openContact = () => {
    setMenuOpen(false);
    onGetStarted();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200/80 bg-white/95 backdrop-blur" id="siteHeader">
      <div className="container-x flex items-center justify-between gap-6" style={{ height: 'var(--nav-h)' }}>
        <a href="#hero" className="text-2xl font-black tracking-tight text-brand-ink" aria-label="DRYFTQ — home">
          DRYFTQ
        </a>

        <nav className="hidden lg:block" aria-label="Primary">
          <ul className="flex items-center gap-6 xl:gap-9" id="primaryNav">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <a
                  className="nav-link"
                  href={item.href}
                  data-current={isCurrent(item.href) ? 'true' : 'false'}
                  aria-current={isCurrent(item.href) ? 'true' : 'false'}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <button className="btn btn-outline" type="button" aria-haspopup="dialog" onClick={openLogin}>
            Login
          </button>
          <button className="btn btn-primary" type="button" aria-haspopup="dialog" onClick={openContact}>
            Get Started <Icon name="arrow" className="icon-arrow" />
          </button>
        </div>

        <button
          ref={toggleRef}
          className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 lg:hidden"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="mobileMenu"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <Icon name={menuOpen ? 'close' : 'menu'} className="h-6 w-6" />
        </button>
      </div>

      <div id="mobileMenu" className={cx('border-t border-gray-100 bg-white lg:hidden', !menuOpen && 'hidden')}>
        <nav className="container-x py-3" aria-label="Mobile">
          <ul className="flex flex-col">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <a
                  className={MOBILE_LINK_CLASS}
                  href={item.href}
                  aria-current={isCurrent(item.href) ? 'true' : 'false'}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="grid grid-cols-2 gap-3 pb-3 pt-4">
            <button className="btn btn-outline" type="button" aria-haspopup="dialog" onClick={openLogin}>
              Login
            </button>
            <button className="btn btn-primary" type="button" aria-haspopup="dialog" onClick={openContact}>
              Get Started
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
