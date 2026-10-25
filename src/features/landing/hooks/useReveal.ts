import { useEffect } from 'react';

/**
 * Scroll reveal — port of the legacy IntersectionObserver from `landing/main.js`:
 * every `.reveal` element gains `.visible` as it enters the viewport
 * (threshold 0.12, bottom root margin of -5%) and is then unobserved.
 * With reduced motion requested (or no IntersectionObserver at all) the
 * elements are shown immediately, exactly like the legacy fallback branch.
 */
export function useReveal(): void {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!('IntersectionObserver' in window) || reduceMotion) {
      els.forEach((el) => el.classList.add('visible'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -5% 0px' },
    );
    els.forEach((el) => io.observe(el));

    return () => io.disconnect();
  }, []);
}
