import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import factoryFloor from '../../../assets/img/factory-floor.jpg';
import { useStore } from '../../store/context';
import { cx } from '../../lib/utils';
import { ACCENT_COLOR, TWIN_MACHINES, type TwinMachine } from './twinData';

/* ------------------------------------------------------------------ */
/* Tiny icon set (inline, so the map never waits on an icon font)      */
/* ------------------------------------------------------------------ */

const GLYPHS: Record<string, ReactNode> = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.6-3.6" />
    </>
  ),
  filter: <path d="M4 5h16l-6.4 7.5V20l-3.2-1.6v-5.9z" />,
  expand: (
    <>
      <path d="M8 3H3v5" />
      <path d="M16 3h5v5" />
      <path d="M8 21H3v-5" />
      <path d="M21 16v5h-5" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  minus: <path d="M5 12h14" />,
  target: (
    <>
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="2.4" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
    </>
  ),
  crosshair: (
    <>
      <circle cx="12" cy="12" r="6" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
    </>
  ),
  chevron: <path d="m6 9 6 6 6-6" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  arrow: <path d="M7 17 17 7M8 7h9v9" />,
  check: <path d="m5 13 4 4L19 7" />,
};

function Glyph({ name, className = 'h-4 w-4' }: { name: keyof typeof GLYPHS | string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {GLYPHS[name]}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Types + constants                                                   */
/* ------------------------------------------------------------------ */

interface Pan {
  x: number;
  y: number;
}

const ASSET_FILTERS = [
  { value: 'all', label: 'All Assets' },
  { value: 'Critical', label: 'Critical only' },
  { value: 'Attention', label: 'Needs attention' },
  { value: 'Healthy', label: 'Healthy only' },
];

const LINE_FILTERS = ['all', 'Line 1', 'Line 2', 'Line 3'];

const GAUGE_CIRCUMFERENCE = 2 * Math.PI * 34;

const clampZoom = (z: number) => Math.min(2.4, Math.max(1, Math.round(z * 100) / 100));

/* ------------------------------------------------------------------ */
/* Machine marker                                                      */
/* ------------------------------------------------------------------ */

function MachineMarker({
  machine,
  muted,
  active,
  onSelect,
}: {
  machine: TwinMachine;
  muted: boolean;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={cx('twin-marker', muted && 'is-muted')}
      style={
        {
          top: `${machine.top}%`,
          left: `${machine.left}%`,
          '--twin-lift-m': `${machine.mobileLift ?? 16}px`,
        } as CSSProperties
      }
    >
      {machine.ring ? (
        <span className={cx('twin-ring', `twin-ring--${machine.accent}`)} aria-hidden>
          <span className="twin-ring__wave" />
        </span>
      ) : (
        <span className="twin-dot" aria-hidden />
      )}

      {machine.layout === 'card' ? (
        <button
          type="button"
          data-twin-ui
          onClick={onSelect}
          aria-label={`${machine.name} — ${machine.health}% health, ${machine.status}`}
          className={cx('twin-card-marker', active && 'is-active')}
        >
          <span className="twin-card-marker__title">{machine.name}</span>
          <span className="twin-card-marker__row">
            <span className="twin-card-marker__value">{machine.health}%</span>
            <span className="twin-card-marker__flag">Critical</span>
          </span>
          <span className="twin-card-marker__hint">Tap for telemetry</span>
        </button>
      ) : (
        <button
          type="button"
          data-twin-ui
          onClick={onSelect}
          aria-label={`${machine.name} — ${machine.health}% health, ${machine.status}`}
          className={cx(
            'twin-tag',
            machine.connector && 'twin-tag--connect',
            machine.stem && 'twin-tag--stem',
            active && 'is-active',
          )}
        >
          <span className="twin-tag__name">{machine.name}</span>
          <span className={cx('twin-tag__value', `twin-tag__value--${machine.accent}`)}>{machine.health}%</span>
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Digital twin card                                                   */
/* ------------------------------------------------------------------ */

export default function DigitalTwin() {
  const { notify } = useStore();
  const navigate = useNavigate();

  const viewportRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const dragRef = useRef<{ sx: number; sy: number; px: number; py: number } | null>(null);

  const [overlaysOn, setOverlaysOn] = useState(true);
  const [attentionOnly, setAttentionOnly] = useState(false);
  const [assetFilter, setAssetFilter] = useState('all');
  const [lineFilter, setLineFilter] = useState('all');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Pan>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMenuOpen, setViewMenuOpen] = useState(false);
  const [nativeFs, setNativeFs] = useState(false);
  const [pseudoFs, setPseudoFs] = useState(false);
  const fsActive = nativeFs || pseudoFs;

  const selected = useMemo(() => TWIN_MACHINES.find((m) => m.id === selectedId) ?? null, [selectedId]);

  const clampPan = useCallback((next: Pan, z: number): Pan => {
    const el = viewportRef.current;
    const w = el?.clientWidth ?? 0;
    const h = el?.clientHeight ?? 0;
    const mx = Math.max(0, ((z - 1) * w) / 2);
    const my = Math.max(0, ((z - 1) * h) / 2);
    return {
      x: Math.min(mx, Math.max(-mx, next.x)),
      y: Math.min(my, Math.max(-my, next.y)),
    };
  }, []);

  const applyZoom = useCallback(
    (next: number) => {
      const z = clampZoom(next);
      setZoom(z);
      setPan((p) => clampPan(p, z));
    },
    [clampPan],
  );

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  /* Zoom with Ctrl/⌘ + wheel — plain wheel keeps scrolling the page. */
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      applyZoom(zoom * (e.deltaY < 0 ? 1.12 : 0.9));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [applyZoom, zoom]);

  /* Escape closes the drawer / the view menu / the pseudo-fullscreen view. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setSelectedId(null);
      setViewMenuOpen(false);
      setPseudoFs(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* Full-screen state follows the browser, not just our button. */
  useEffect(() => {
    const onFs = () => setNativeFs(document.fullscreenElement === cardRef.current);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  /* Lock page scroll while the in-page fullscreen view is active. */
  useEffect(() => {
    if (!pseudoFs) return;
    document.body.classList.add('twin-fs-lock');
    return () => document.body.classList.remove('twin-fs-lock');
  }, [pseudoFs]);

  const toggleFullScreen = async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        /* ignore */
      }
      return;
    }
    if (pseudoFs) {
      setPseudoFs(false);
      return;
    }
    const el = cardRef.current;
    if (!el) return;
    try {
      await el.requestFullscreen();
    } catch {
      setPseudoFs(true);
      return;
    }
    // Some embeds resolve the promise without granting fullscreen.
    if (document.fullscreenElement !== el) setPseudoFs(true);
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || e.pointerType !== 'mouse') return; // touch keeps native scroll
    if ((e.target as HTMLElement).closest('[data-twin-ui]')) return;
    dragRef.current = { sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y };
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    setPan(clampPan({ x: d.px + (e.clientX - d.sx), y: d.py + (e.clientY - d.sy) }, zoom));
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    setDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
  };

  const toggleOverlays = () => {
    setOverlaysOn((on) => {
      if (on) setSelectedId(null);
      return !on;
    });
  };

  const visibleIds = useMemo(() => {
    return new Set(
      TWIN_MACHINES.filter((m) => {
        const lineOk = lineFilter === 'all' || m.line === lineFilter;
        const assetOk = assetFilter === 'all' || m.status === assetFilter;
        const attentionOk = !attentionOnly || m.status !== 'Healthy';
        return lineOk && assetOk && attentionOk;
      }).map((m) => m.id),
    );
  }, [assetFilter, lineFilter, attentionOnly]);

  const acknowledge = () => {
    if (!selected) return;
    notify({
      title: 'Telemetry acknowledged',
      message: `${selected.name} readings acknowledged — maintenance follow-up queued for ${selected.line}.`,
      type: 'success',
    });
    setSelectedId(null);
  };

  return (
    <section
      ref={cardRef}
      className={cx('console-card-solid twin-card', pseudoFs && 'is-pseudo-full')}
      aria-label="Floor and operations overview"
    >
      {/* ---------------- toolbar ---------------- */}
      <div className="twin-toolbar">
        <h2 className="twin-toolbar__title">Floor &amp; Operations Overview</h2>

        <div className="twin-toolbar__spacer" />

        <select
          className="twin-select"
          value={assetFilter}
          onChange={(e) => setAssetFilter(e.target.value)}
          aria-label="Filter assets"
        >
          {ASSET_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>

        <select
          className="twin-select"
          value={lineFilter}
          onChange={(e) => setLineFilter(e.target.value)}
          aria-label="Filter production line"
        >
          <option value="all">Production Line</option>
          {LINE_FILTERS.filter((l) => l !== 'all').map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>

        <button type="button" className="twin-btn twin-btn--icon" title="Search · zoom to fit" onClick={resetView}>
          <Glyph name="search" />
        </button>
        <button
          type="button"
          className={cx('twin-btn twin-btn--icon', attentionOnly && 'is-on')}
          title="Highlight assets needing attention"
          aria-pressed={attentionOnly}
          onClick={() => setAttentionOnly((v) => !v)}
        >
          <Glyph name="filter" />
        </button>
        <button type="button" className="twin-btn" onClick={toggleFullScreen} title="Toggle full screen">
          <Glyph name="expand" />
          <span className="twin-btn__label">{fsActive ? 'Exit Full Screen' : 'Full Screen'}</span>
        </button>

        <div className="twin-switch-wrap">
          <span className="twin-switch-label">3D Overlays</span>
          <button
            type="button"
            role="switch"
            className="twin-switch"
            aria-checked={overlaysOn}
            aria-label="3D overlays on or off"
            onClick={toggleOverlays}
          />
        </div>
      </div>

      {/* ---------------- map ---------------- */}
      <div
        ref={viewportRef}
        className={cx('twin-viewport', dragging && 'is-dragging')}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={resetView}
      >
        <div
          className="twin-layer"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
        >
          <img
            src={factoryFloor}
            alt="Isometric 3D floor plan of the DRYFTQ plant"
            className="twin-map"
            draggable={false}
          />

          <div className={cx('twin-overlays', !overlaysOn && 'is-off')} aria-hidden={!overlaysOn}>
            {TWIN_MACHINES.map((m) => (
              <MachineMarker
                key={m.id}
                machine={m}
                muted={!visibleIds.has(m.id)}
                active={selectedId === m.id}
                onSelect={() => setSelectedId(m.id)}
              />
            ))}
          </div>
        </div>

        {/* floating top-right view control */}
        <div className="twin-float twin-float--top" data-twin-ui>
          <div className="twin-menu-wrap">
            <button
              type="button"
              className={cx('twin-float__select', viewMenuOpen && 'is-open')}
              aria-expanded={viewMenuOpen}
              onClick={() => setViewMenuOpen((v) => !v)}
            >
              Dropdown
              <Glyph name="chevron" className="h-3.5 w-3.5" />
            </button>
            {viewMenuOpen && (
              <div className="twin-menu" role="menu">
                <button type="button" role="menuitem" onClick={() => { resetView(); setViewMenuOpen(false); }}>
                  Fit to plant <span>100%</span>
                </button>
                <button type="button" role="menuitem" onClick={() => { applyZoom(1.35); setViewMenuOpen(false); }}>
                  Zone detail <span>135%</span>
                </button>
                <button type="button" role="menuitem" onClick={() => { applyZoom(1.8); setViewMenuOpen(false); }}>
                  Machine detail <span>180%</span>
                </button>
              </div>
            )}
          </div>
          <button type="button" className="twin-float__btn" aria-label="Zoom in" onClick={() => applyZoom(zoom + 0.2)}>
            <Glyph name="plus" className="h-4 w-4" />
          </button>
          <button type="button" className="twin-float__btn" aria-label="Zoom out" onClick={() => applyZoom(zoom - 0.2)}>
            <Glyph name="minus" className="h-4 w-4" />
          </button>
        </div>

        {/* floating bottom-right stack */}
        <div className="twin-float twin-float--bottom" data-twin-ui>
          <button type="button" className="twin-float__btn" aria-label="Zoom in" onClick={() => applyZoom(zoom + 0.2)}>
            <Glyph name="plus" className="h-4 w-4" />
          </button>
          <button type="button" className="twin-float__btn" aria-label="Zoom out" onClick={() => applyZoom(zoom - 0.2)}>
            <Glyph name="minus" className="h-4 w-4" />
          </button>
          <span className="twin-float__divider" />
          <button type="button" className="twin-float__btn" aria-label="Reset view" title="Reset view" onClick={resetView}>
            <Glyph name="target" className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={cx('twin-float__btn', overlaysOn && 'is-active')}
            aria-label="Toggle overlays"
            aria-pressed={overlaysOn}
            title={overlaysOn ? 'Hide 3D overlays' : 'Show 3D overlays'}
            onClick={toggleOverlays}
          >
            <Glyph name="layers" className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="twin-float__btn"
            aria-label="Recenter floor"
            title="Recenter floor"
            onClick={() => setPan({ x: 0, y: 0 })}
          >
            <Glyph name="crosshair" className="h-4 w-4" />
          </button>
        </div>

        {/* ---------------- telemetry drawer ---------------- */}
        <aside className={cx('twin-drawer', selected && 'is-open')} aria-hidden={!selected} data-twin-ui>
          {selected && (
            <>
              <div className="twin-drawer__head">
                <div className="min-w-0">
                  <p className="twin-drawer__eyebrow">Machine telemetry</p>
                  <h3 className="twin-drawer__title">{selected.name}</h3>
                  <p className="twin-drawer__meta">
                    {selected.asset} · {selected.line}
                  </p>
                </div>
                <button
                  type="button"
                  className="twin-drawer__close"
                  aria-label="Close telemetry"
                  onClick={() => setSelectedId(null)}
                >
                  <Glyph name="close" className="h-4 w-4" />
                </button>
              </div>

              <div className="twin-drawer__body">
                <div className="twin-health">
                  <div className="twin-gauge-wrap">
                    <svg viewBox="0 0 88 88" className="twin-gauge" aria-hidden>
                      <circle className="twin-gauge__track" cx="44" cy="44" r="34" />
                      <circle
                        className="twin-gauge__value"
                        cx="44"
                        cy="44"
                        r="34"
                        stroke={ACCENT_COLOR[selected.accent]}
                        strokeDasharray={`${(selected.health / 100) * GAUGE_CIRCUMFERENCE} ${GAUGE_CIRCUMFERENCE}`}
                        transform="rotate(-90 44 44)"
                      />
                    </svg>
                    <span className="twin-gauge__label">{selected.health}%</span>
                  </div>
                  <div>
                    <span className={cx('twin-status', `twin-status--${selected.accent}`)}>{selected.status}</span>
                    <p className="twin-health__caption">
                      Composite asset health
                      <br />
                      across 12 sensors
                    </p>
                  </div>
                </div>

                <div className="twin-metrics">
                  <div className="twin-metric">
                    <span className="twin-metric__label">Temperature</span>
                    <span className="twin-metric__value">{selected.temperature} °C</span>
                  </div>
                  <div className="twin-metric">
                    <span className="twin-metric__label">Vibration</span>
                    <span className="twin-metric__value">{selected.vibration} mm/s</span>
                  </div>
                  <div className="twin-metric">
                    <span className="twin-metric__label">Shift output</span>
                    <span className="twin-metric__value">{selected.shiftOutput.toLocaleString()} units</span>
                  </div>
                  <div className="twin-metric">
                    <span className="twin-metric__label">Production line</span>
                    <span className="twin-metric__value">{selected.line}</span>
                  </div>
                </div>

                <div>
                  <h4 className="twin-drawer__subhead">AI recommendation</h4>
                  <p className="twin-note">{selected.note}</p>
                </div>
              </div>

              <div className="twin-drawer__actions">
                <button type="button" className="twin-action twin-action--ghost" onClick={() => navigate('/machines')}>
                  Open machine
                  <Glyph name="arrow" className="h-3.5 w-3.5" />
                </button>
                <button type="button" className="twin-action twin-action--primary" onClick={acknowledge}>
                  <Glyph name="check" className="h-3.5 w-3.5" />
                  Acknowledge
                </button>
              </div>
            </>
          )}
        </aside>
      </div>
    </section>
  );
}
