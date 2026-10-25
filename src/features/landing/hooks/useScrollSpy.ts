import { useEffect, useState } from 'react';

/**
 * Section id → nav hash, exactly as the legacy `spyMap` in `landing/main.js`:
 * the `results` section deliberately maps to `null` (no link highlighted) and
 * both `contact` and `contact-footer` map to the footer hash.
 */
const SPY_MAP: Record<string, string | null> = {
  hero: '#hero',
  services: '#services',
  process: '#process',
  about: '#about',
  platform: '#platform',
  results: null,
  contact: '#contact-footer',
  'contact-footer': '#contact-footer',
};

/**
 * Scroll-spy for the primary/mobile nav. Reproduces the legacy algorithm:
 * the last section whose top crossed 35% of the viewport becomes current,
 * with the page bottom forced to `#contact-footer`. Returns the hash the
 * matching nav links should mark as current (`null` = none — the legacy
 * `results` mapping), so links can render `data-current`/`aria-current`.
 */
export function useScrollSpy(): string | null {
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    // Same section set as the legacy script, sorted into document order.
    const sections = Object.keys(SPY_MAP)
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
      .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));

    let ticking = false;
    // `undefined` sentinel so the first spy() always publishes its result.
    let lastTarget: string | null | undefined;

    const spy = () => {
      ticking = false;
      const y = window.innerHeight * 0.35;
      let cur: HTMLElement | null = sections[0] ?? null;
      sections.forEach((s) => {
        if (s.getBoundingClientRect().top <= y) cur = s;
      });
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        cur = document.getElementById('contact-footer');
      }
      const target = cur === null ? null : (SPY_MAP[cur.id] ?? null);
      if (target !== lastTarget) {
        lastTarget = target;
        setCurrent(target);
      }
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(spy);
      }
    };

    spy();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return current;
}
