import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { feature } from "topojson-client";
import { cn } from "@/lib/utils";
import { isExchangeOpen, type RegionId } from "./companies";
import { formatMoney, formatPercent, moveColor, type WorldQuote } from "./useWorldQuotes";

interface MarketGlobeProps {
  quotes: WorldQuote[];
  selectedSymbol: string | null;
  onSelect: (_symbol: string) => void;
  region: RegionId;
  /** [lng, lat] the globe should turn to. Changing it starts a new turn. */
  focus: [number, number];
  className?: string;
}

type Vec3 = [number, number, number];

const RAD = Math.PI / 180;
const toVec = (lng: number, lat: number): Vec3 => {
  const l = lng * RAD;
  const p = lat * RAD;
  return [Math.cos(p) * Math.cos(l), Math.cos(p) * Math.sin(l), Math.sin(p)];
};
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOutBack = (t: number) => 1 + 2.7 * Math.pow(t - 1, 3) + 1.7 * Math.pow(t - 1, 2);

// Land is drawn as an even field of dots. The outline is rasterised once on a
// flat canvas, then sampled on a grid whose longitude step widens toward the
// poles so the dots stay evenly spaced on the sphere.
type LandGeometry =
  | { type: "Polygon"; coordinates: [number, number][][] }
  | { type: "MultiPolygon"; coordinates: [number, number][][][] };
type LandShape =
  | { type: "FeatureCollection"; features: { geometry: LandGeometry }[] }
  | { type: "Feature"; geometry: LandGeometry };

let landDotsPromise: Promise<Float32Array> | null = null;

function loadLandDots(): Promise<Float32Array> {
  if (landDotsPromise) return landDotsPromise;
  landDotsPromise = import("world-atlas/land-110m.json").then((mod) => {
    const topology = ((mod as { default?: unknown }).default ?? mod) as Parameters<typeof feature>[0];
    const land = feature(topology, topology.objects.land) as unknown as LandShape;
    const geometries = land.type === "FeatureCollection" ? land.features.map((f) => f.geometry) : [land.geometry];

    const W = 1440;
    const H = 720;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    for (const geometry of geometries) {
      const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
      for (const polygon of polygons) {
        for (const ring of polygon) {
          ring.forEach(([lng, lat], i) => {
            const x = ((lng + 180) / 360) * W;
            const y = ((90 - lat) / 180) * H;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.closePath();
        }
      }
    }
    ctx.fill("evenodd");
    const pixels = ctx.getImageData(0, 0, W, H).data;

    const STEP = 1.35;
    const out: number[] = [];
    for (let lat = -56; lat <= 82; lat += STEP) {
      const lngStep = STEP / Math.max(0.2, Math.cos(lat * RAD));
      const offset = (Math.round(lat / STEP) % 2) * (lngStep / 2);
      for (let lng = -180 + offset; lng < 180; lng += lngStep) {
        const x = Math.floor(((lng + 180) / 360) * W);
        const y = Math.floor(((90 - lat) / 180) * H);
        if (pixels[(y * W + x) * 4 + 3] > 120) {
          const v = toVec(lng, lat);
          out.push(v[0], v[1], v[2]);
        }
      }
    }
    return new Float32Array(out);
  });
  return landDotsPromise;
}

interface ScreenPoint {
  symbol: string;
  x: number;
  y: number;
  r: number;
  visible: boolean;
}

export function MarketGlobe({ quotes, selectedSymbol, onSelect, region, focus, className }: MarketGlobeProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const chipRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const [hovered, setHovered] = useState<string | null>(null);

  // Everything the animation loop reads lives in refs so the loop never restarts.
  const quotesRef = useRef(quotes);
  const selectedRef = useRef(selectedSymbol);
  const hoveredRef = useRef<string | null>(null);
  const regionRef = useRef(region);
  quotesRef.current = quotes;
  selectedRef.current = selectedSymbol;
  hoveredRef.current = hovered;
  regionRef.current = region;

  const view = useRef({
    lng: focus[0] - 50,
    lat: 10,
    tilt: 30,
    turn: null as null | { fromLng: number; fromLat: number; toLng: number; toLat: number; start: number; ms: number },
    dragging: false,
    idleUntil: 0,
    pointerInside: false,
  });
  const points = useRef<ScreenPoint[]>([]);
  const focusRef = useRef(focus);

  // Turn toward a new focus (region change or a company picked elsewhere).
  useEffect(() => {
    focusRef.current = focus;
    const v = view.current;
    const toLat = clamp(focus[1] - v.tilt, -55, 55);
    let delta = ((focus[0] - v.lng + 540) % 360) - 180;
    if (Math.abs(delta) < 0.01 && Math.abs(toLat - v.lat) < 0.01) return;
    if (reducedMotion) {
      v.lng += delta;
      v.lat = toLat;
      return;
    }
    if (!Number.isFinite(delta)) delta = 0;
    v.turn = {
      fromLng: v.lng,
      fromLat: v.lat,
      toLng: v.lng + delta,
      toLat,
      start: performance.now(),
      ms: 1300,
    };
    v.idleUntil = performance.now() + 9000;
  }, [focus, reducedMotion]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let radius = 300;
    let centerX = 0;
    let centerY = 0;
    let landDots: Float32Array | null = null;
    let raf = 0;
    let running = true;
    let onScreen = true;
    let last = performance.now();
    const born = performance.now();
    let landBorn = 0;

    loadLandDots()
      .then((dots) => {
        landDots = dots;
        landBorn = performance.now();
      })
      .catch(() => {
        /* the globe still works as a plain sphere with markers */
      });

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      const topPad = 26;
      radius = clamp(width * 0.56, 230, 640);
      centerX = width / 2;
      centerY = topPad + radius;
      // How far below the visual centre of the visible cap the globe's own
      // centre sits, as an angle: the focus latitude is lifted by this much.
      const visible = Math.min(height - topPad, radius);
      const tilt = Math.asin(clamp((radius - visible * 0.48) / radius, 0, 0.95)) / RAD;
      const v = view.current;
      const previousTilt = v.tilt;
      v.tilt = tilt;
      if (!v.turn && !v.dragging) v.lat = clamp(v.lat + (previousTilt - tilt), -55, 55);
    };
    resize();
    // First paint: start a quarter turn away and sweep in to the focus.
    {
      const v = view.current;
      const f = focusRef.current;
      const toLat = clamp(f[1] - v.tilt, -55, 55);
      if (reducedMotion) {
        v.lng = f[0];
        v.lat = toLat;
      } else {
        v.turn = { fromLng: f[0] - 70, fromLat: toLat - 12, toLng: f[0], toLat, start: performance.now(), ms: 2200 };
        v.idleUntil = performance.now() + 5000;
      }
    }

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
    });
    io.observe(wrap);

    const draw = (now: number) => {
      if (!running) return;
      raf = requestAnimationFrame(draw);
      const dt = Math.min(64, now - last);
      last = now;
      if (!onScreen || document.hidden || width === 0) return;

      const v = view.current;
      if (v.turn) {
        const t = clamp((now - v.turn.start) / v.turn.ms, 0, 1);
        const e = easeInOut(t);
        v.lng = v.turn.fromLng + (v.turn.toLng - v.turn.fromLng) * e;
        v.lat = v.turn.fromLat + (v.turn.toLat - v.turn.fromLat) * e;
        if (t >= 1) v.turn = null;
      } else if (!v.dragging && !reducedMotion && !hoveredRef.current && now > v.idleUntil) {
        if (regionRef.current === "all") {
          v.lng += dt * 0.0035; // one lap in roughly 100 seconds
        } else {
          // Stay on the chosen region with a slow sway.
          const sway = focusRef.current[0] + Math.sin(now / 5200) * 7;
          v.lng += (((sway - v.lng + 540) % 360) - 180) * 0.012;
        }
      }

      const lam = v.lng * RAD;
      const phi = v.lat * RAD;
      const c: Vec3 = [Math.cos(phi) * Math.cos(lam), Math.cos(phi) * Math.sin(lam), Math.sin(phi)];
      const east: Vec3 = [-Math.sin(lam), Math.cos(lam), 0];
      const north: Vec3 = [-Math.sin(phi) * Math.cos(lam), -Math.sin(phi) * Math.sin(lam), Math.cos(phi)];

      const intro = reducedMotion ? 1 : clamp((now - born) / 1400, 0, 1);
      const R = radius * (0.9 + 0.1 * easeInOut(intro));

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.globalAlpha = intro;

      // Atmosphere: the one place the brand cobalt shows up.
      const halo = ctx.createRadialGradient(centerX, centerY, R * 0.97, centerX, centerY, R * 1.13);
      halo.addColorStop(0, "rgba(73,79,223,0.42)");
      halo.addColorStop(0.35, "rgba(73,79,223,0.14)");
      halo.addColorStop(1, "rgba(73,79,223,0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(centerX, centerY, R * 1.13, 0, Math.PI * 2);
      ctx.fill();

      const body = ctx.createRadialGradient(centerX, centerY - R * 0.55, R * 0.1, centerX, centerY, R);
      body.addColorStop(0, "#16181a");
      body.addColorStop(0.6, "#0c0d0f");
      body.addColorStop(1, "#060607");
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(centerX, centerY, R, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.14)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Land
      if (landDots) {
        const landIn = reducedMotion ? 1 : clamp((now - landBorn) / 900, 0, 1);
        ctx.fillStyle = "#ffffff";
        const size = clamp(R / 260, 1.1, 2.1);
        for (let i = 0; i < landDots.length; i += 3) {
          const x3 = landDots[i];
          const y3 = landDots[i + 1];
          const z3 = landDots[i + 2];
          const depth = x3 * c[0] + y3 * c[1] + z3 * c[2];
          if (depth <= 0.02) continue;
          const y = centerY - R * (x3 * north[0] + y3 * north[1] + z3 * north[2]);
          if (y > height + 2) continue;
          const x = centerX + R * (x3 * east[0] + y3 * east[1]);
          ctx.globalAlpha = intro * landIn * (0.16 + 0.5 * depth);
          ctx.fillRect(x - size / 2, y - size / 2, size, size);
        }
      }

      // Markers
      const selected = selectedRef.current;
      const hover = hoveredRef.current;
      const activeRegion = regionRef.current;
      const list = quotesRef.current;
      const projected: (ScreenPoint & { depth: number; q: WorldQuote; index: number })[] = [];
      list.forEach((q, index) => {
        const p = toVec(q.lng, q.lat);
        const depth = p[0] * c[0] + p[1] * c[1] + p[2] * c[2];
        const x = centerX + R * (p[0] * east[0] + p[1] * east[1] + p[2] * east[2]);
        const y = centerY - R * (p[0] * north[0] + p[1] * north[1] + p[2] * north[2]);
        const move = Math.min(Math.abs(q.changePercent ?? 0), 5);
        const r = 4.5 + move * 1.25;
        projected.push({ symbol: q.symbol, x, y, r, visible: depth > 0.06 && y < height - 6, depth, q, index });
      });
      projected.sort((a, b) => a.depth - b.depth);

      const liveNow = new Map<string, boolean>();
      for (const p of projected) {
        if (!p.visible) continue;
        const q = p.q;
        const inRegion = activeRegion === "all" || q.region === activeRegion;
        const pop = reducedMotion ? 1 : clamp((now - born - 500 - p.index * 28) / 520, 0, 1);
        if (pop <= 0) continue;
        const scale = easeOutBack(pop);
        const r = p.r * scale;
        const color = moveColor(q.changePercent);
        const limb = clamp(p.depth * 2.2, 0.35, 1);
        const base = intro * limb * (inRegion ? 1 : 0.22);

        if (!liveNow.has(q.exchange)) liveNow.set(q.exchange, isExchangeOpen(q.exchange));
        const live = liveNow.get(q.exchange) && q.price !== null;

        // An open market breathes: a ring travels out from the dot.
        if (live && inRegion && !reducedMotion) {
          const phase = ((now / 2600 + p.index * 0.137) % 1 + 1) % 1;
          ctx.globalAlpha = base * (1 - phase) * 0.55;
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r + phase * r * 2.4, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.globalAlpha = base * 0.2;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 2.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = base;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
        // A dark ring keeps neighbouring dots apart where headquarters cluster.
        ctx.strokeStyle = "rgba(0,0,0,0.85)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        if (q.symbol === selected || q.symbol === hover) {
          ctx.globalAlpha = intro;
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r + 4, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;

      points.current = projected;

      // HTML labels ride along with their dots.
      const place = (el: HTMLDivElement | null, symbol: string | null, gap: number) => {
        if (!el) return;
        const p = symbol ? projected.find((it) => it.symbol === symbol) : undefined;
        if (!p || !p.visible) {
          el.style.opacity = "0";
          return;
        }
        el.style.opacity = "1";
        el.style.transform = `translate(${clamp(p.x, 70, width - 70)}px, ${p.y - p.r - gap}px) translate(-50%, -100%)`;
      };
      place(chipRef.current, selected && selected !== hover ? selected : null, 10);
      place(tooltipRef.current, hover, 12);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [reducedMotion]);

  // Pointer: drag to turn, hover to peek, click to select.
  const drag = useRef({ x: 0, y: 0, moved: 0, active: false });

  const nearest = (clientX: number, clientY: number) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    let best: ScreenPoint | null = null;
    let bestDistance = Infinity;
    for (const p of points.current) {
      if (!p.visible) continue;
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < Math.max(16, p.r + 8) && d < bestDistance) {
        best = p;
        bestDistance = d;
      }
    }
    return best?.symbol ?? null;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY, moved: 0, active: true };
    view.current.dragging = true;
    view.current.turn = null;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (d.active) {
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      d.x = e.clientX;
      d.y = e.clientY;
      d.moved += Math.abs(dx) + Math.abs(dy);
      const wrapWidth = wrapRef.current?.clientWidth ?? 800;
      const degPerPx = 1 / (clamp(wrapWidth * 0.56, 230, 640) * RAD);
      view.current.lng -= dx * degPerPx;
      view.current.lat = clamp(view.current.lat + dy * degPerPx, -55, 55);
      if (hovered) setHovered(null);
      return;
    }
    const symbol = nearest(e.clientX, e.clientY);
    if (symbol !== hovered) setHovered(symbol);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    d.active = false;
    view.current.dragging = false;
    view.current.idleUntil = performance.now() + 6000;
    if (d.moved < 6) {
      const symbol = nearest(e.clientX, e.clientY);
      if (symbol) onSelect(symbol);
    }
  };

  const hoveredQuote = hovered ? quotes.find((q) => q.symbol === hovered) : null;
  const selectedQuote = selectedSymbol ? quotes.find((q) => q.symbol === selectedSymbol) : null;

  return (
    <div
      ref={wrapRef}
      className={cn(
        "relative w-full touch-pan-y select-none overflow-hidden",
        hovered ? "cursor-pointer" : "cursor-grab active:cursor-grabbing",
        className
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={() => setHovered(null)}
    >
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Globe showing where well-known listed companies are headquartered, coloured by today's price move. The same companies are listed below."
        className="absolute inset-0 h-full w-full"
      />

      {/* Selected company chip */}
      <div
        ref={chipRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 opacity-0 transition-opacity duration-200"
      >
        {selectedQuote && (
          <div className="whitespace-nowrap rounded-full bg-white px-3 py-1 text-[13px] font-semibold text-black">
            {selectedQuote.name}
          </div>
        )}
      </div>

      {/* Hover tooltip */}
      <div
        ref={tooltipRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 opacity-0 transition-opacity duration-150"
      >
        {hoveredQuote && (
          <div className="min-w-[168px] rounded-[12px] border border-white/15 bg-[#16181a] px-3.5 py-2.5 text-left">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-sm font-semibold text-white">{hoveredQuote.name}</span>
              <span className="text-[13px] text-white/60">{hoveredQuote.label}</span>
            </div>
            <div className="mt-0.5 text-[13px] text-white/60">
              {hoveredQuote.city}, {hoveredQuote.country}
            </div>
            <div className="mt-2 flex items-baseline justify-between gap-4 tabular-nums">
              <span className="text-sm font-semibold text-white">
                {formatMoney(hoveredQuote.price, hoveredQuote.currency)}
              </span>
              <span className="text-[13px] font-semibold" style={{ color: moveColor(hoveredQuote.changePercent) }}>
                {formatPercent(hoveredQuote.changePercent)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Fade into the band, like a horizon */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black to-transparent" />
    </div>
  );
}
