import { useEffect, useRef } from 'react';

/**
 * The animated "quantum wave" canvas from the dark Process section — a faithful
 * port of `#quantumWaveCanvas` in `landing/main.js`: four sine waves with the
 * same frequencies, amplitudes, speeds, offsets and colours, DPR-aware sizing
 * via ResizeObserver, paused by IntersectionObserver when off-screen, paused by
 * `visibilitychange` when the tab is hidden, and disabled entirely under
 * `prefers-reduced-motion: reduce` (a single static frame is drawn instead).
 */
export function QuantumWave() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const box = boxRef.current;
    if (!canvas || !box) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0;
    let h = 0;
    let t = 0;
    let visible = true;
    let raf = 0;

    const wave = (freq: number, amp: number, speed: number, off: number, stroke: string, dot?: string): void => {
      ctx.beginPath();
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = stroke;
      const pts: Array<[number, number]> = [];
      for (let x = 0; x <= w; x += 4) {
        const env = Math.sin((x / w) * Math.PI);
        const y =
          h / 2 +
          Math.sin(x * freq + t * speed + off) * amp * env +
          Math.cos(x * freq * 1.5 - t * speed * 0.7) * amp * 0.4 * env;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        if (x % 36 === 0) pts.push([x, y]);
      }
      ctx.stroke();
      if (dot) {
        ctx.fillStyle = dot;
        pts.forEach(([px, py]) => {
          ctx.beginPath();
          ctx.arc(px, py, 1.8, 0, 6.283);
          ctx.fill();
        });
      }
    };

    const draw = (): void => {
      ctx.clearRect(0, 0, w, h);
      const k = Math.min(1, h / 90); // scale amplitudes to canvas height
      wave(0.007, 30 * k, 0.018, 0, 'rgba(6,182,212,.55)', 'rgba(6,182,212,.8)');
      wave(0.011, 34 * k, 0.024, 2.2, 'rgba(255,90,31,.9)', 'rgba(255,140,50,.95)');
      wave(0.015, 22 * k, 0.016, 4.5, 'rgba(245,158,11,.4)');
      wave(0.02, 17 * k, 0.028, 1.2, 'rgba(59,130,246,.55)', 'rgba(96,165,250,.8)');
    };

    const size = (): void => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = box.clientWidth;
      h = box.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };

    const loop = (): void => {
      t += 1;
      draw();
      raf = visible && !document.hidden ? requestAnimationFrame(loop) : 0;
    };

    const start = (): void => {
      if (!raf && !reduceMotion && visible && !document.hidden) raf = requestAnimationFrame(loop);
    };

    const resizeObserver = new ResizeObserver(size);
    resizeObserver.observe(box);

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      start();
    });
    intersectionObserver.observe(box);

    document.addEventListener('visibilitychange', start);
    size();
    start();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', start);
    };
  }, []);

  return (
    <div ref={boxRef} className="relative mt-8 h-24 sm:h-28" aria-hidden="true">
      <canvas ref={canvasRef} id="quantumWaveCanvas" className="block h-full w-full" />
    </div>
  );
}
