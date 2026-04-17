import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const CA       = "6JRWQuAPZDc1N7FYGsMGsvXVYiadaKndsbXjCbx5pump";
const API_KEY  = "7e03dd01-b931-4fac-8e9f-06a310c1238a";
const X_URL    = "https://x.com/thesimplecoin";
const COMM_URL = "https://twitter.com/i/communities/2029368575186640897";
// ─────────────────────────────────────────────────────────────────────────────

// ── isMobile hook ────────────────────────────────────────────────────────────
function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 640);
  useEffect(() => {
    const h = () => setMobile(window.innerWidth < 640);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return mobile;
}

// ── Magnetic hook (desktop only) ─────────────────────────────────────────────
function useMagnetic(s = 0.3) {
  const ref = useRef(null);
  const move = useCallback((e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * s}px,${(e.clientY - r.top - r.height / 2) * s}px)`;
  }, [s]);
  const leave = useCallback(() => { if (ref.current) ref.current.style.transform = "translate(0,0)"; }, []);
  return { ref, onMouseMove: move, onMouseLeave: leave };
}

// ── Particles ────────────────────────────────────────────────────────────────
function Particles() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current, ctx = c.getContext("2d");
    let W, H, pts, raf;
    const init = () => {
      W = c.width = innerWidth; H = c.height = innerHeight;
      const count = W < 640 ? 28 : 55;
      pts = Array.from({ length: count }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - .5) * .18, vy: (Math.random() - .5) * .18,
        r: Math.random() * 1.1 + .3, o: Math.random() * .35 + .08,
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      pts.forEach(d => {
        d.x = (d.x + d.vx + W) % W; d.y = (d.y + d.vy + H) % H;
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,0,0,${d.o})`; ctx.fill();
      });
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, dist = Math.hypot(dx, dy);
        if (dist < 115) {
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(0,0,0,${.06 * (1 - dist / 115)})`; ctx.lineWidth = .5; ctx.stroke();
        }
      }
      raf = requestAnimationFrame(draw);
    };
    init(); draw();
    window.addEventListener("resize", init);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", init); };
  }, []);
  return <canvas ref={ref} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, opacity: .5 }} />;
}

// ── 3D Coin ──────────────────────────────────────────────────────────────────
function Coin3D({ size = 160 }) {
  const coinRef = useRef(null);
  const rot = useRef({ x: -10, y: 15 }), vel = useRef({ x: 0, y: 0 });
  const drag = useRef(false), last = useRef({ x: 0, y: 0 }), t = useRef(0);

  useEffect(() => {
    let raf;
    const tick = () => {
      t.current += .012; vel.current.x *= .92; vel.current.y *= .92;
      if (!drag.current) {
        rot.current.x += vel.current.x; rot.current.y += vel.current.y;
        const ix = Math.sin(t.current * .7) * 4, iy = Math.cos(t.current) * 6;
        if (coinRef.current) coinRef.current.style.transform =
          `rotateX(${rot.current.x + ix}deg) rotateY(${rot.current.y + iy}deg)`;
      }
      raf = requestAnimationFrame(tick);
    };
    tick(); return () => cancelAnimationFrame(raf);
  }, []);

  const pd = e => { drag.current = true; last.current = { x: e.clientX, y: e.clientY }; e.currentTarget.setPointerCapture(e.pointerId); };
  const pm = e => {
    if (!drag.current) return;
    vel.current.x = -(e.clientY - last.current.y) * .4;
    vel.current.y =  (e.clientX - last.current.x) * .4;
    rot.current.x += vel.current.x; rot.current.y += vel.current.y;
    last.current = { x: e.clientX, y: e.clientY };
    if (coinRef.current) coinRef.current.style.transform =
      `rotateX(${rot.current.x}deg) rotateY(${rot.current.y}deg)`;
  };
  const pu = () => { drag.current = false; };

  const imgSize = size * 0.61;
  const face = (back) => ({
    position: "absolute", inset: 0, backfaceVisibility: "hidden",
    transform: back ? "rotateY(180deg)" : "none", borderRadius: "50%",
    background: back
      ? "radial-gradient(circle at 65% 35%, #f5f3ef, #d8d4cc 60%, #b8b4ac)"
      : "radial-gradient(circle at 35% 35%, #ffffff, #e8e4dd 60%, #ccc8c0)",
    boxShadow: `0 0 0 5px ${back ? "#ccc8c0" : "#d0ccc4"},0 0 0 7px ${back ? "#aeaaa2" : "#b8b4ac"},4px 12px 40px rgba(0,0,0,.22),inset 0 2px 4px rgba(255,255,255,.9),inset 0 -2px 6px rgba(0,0,0,.1)`,
    display: "flex", alignItems: "center", justifyContent: "center",
  });

  return (
    <div style={{ width: size, height: size, perspective: 800, cursor: "grab", userSelect: "none", touchAction: "none" }}
      onPointerDown={pd} onPointerMove={pm} onPointerUp={pu} onPointerLeave={pu}>
      <div ref={coinRef} style={{ width: "100%", height: "100%", transformStyle: "preserve-3d", position: "relative" }}>
        <div style={face(false)}>
          <img src="logo.png" alt="S" style={{ width: imgSize, height: imgSize, objectFit: "contain", borderRadius: "50%" }} />
        </div>
        <div style={face(true)}>
          <span style={{ fontFamily: "'DM Serif Display',serif", fontSize: size * .21, color: "#888", fontStyle: "italic" }}>simple.</span>
        </div>
      </div>
    </div>
  );
}

// ── Typewriter — 1s pause, fast delete ──────────────────────────────────────
const WORDS = [
  "Buy. Hold. Win.",
  "No roadmap. Just results.",
  "The idea is the product.",
  "Complexity is fear. This is freedom.",
  "The simplest trade you'll ever make.",
];
function Typewriter() {
  const [txt, setTxt] = useState("");
  const [wi, setWi]   = useState(0);
  const [ci, setCi]   = useState(0);
  const [del, setDel] = useState(false);

  useEffect(() => {
    const w = WORDS[wi];
    let delay;
    if (!del && ci < w.length)       delay = 75;           // typing speed
    else if (!del && ci === w.length) delay = 1000;         // 1s pause when full
    else if (del && ci > 0)          delay = 28;            // fast delete
    else { setDel(false); setWi(i => (i + 1) % WORDS.length); return; }

    const t = setTimeout(() => {
      if (!del && ci < w.length)       setCi(c => c + 1);
      else if (!del && ci === w.length) setDel(true);
      else if (del && ci > 0)          setCi(c => c - 1);
    }, delay);
    return () => clearTimeout(t);
  }, [ci, del, wi]);

  useEffect(() => setTxt(WORDS[wi].slice(0, ci)), [ci, wi]);

  return (
    <span>
      {txt}
      <span style={{
        display: "inline-block", width: 2, height: "0.85em",
        background: "#0e0e0e", marginLeft: 2, verticalAlign: "middle",
        animation: "blink 1s step-end infinite",
      }} />
    </span>
  );
}

// ── Live stats ────────────────────────────────────────────────────────────────
function useLiveStats() {
  const [stats, setStats]   = useState({ holders: null, price: null, mcap: null });
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch(`https://data.solanatracker.io/tokens/${CA}`, {
          headers: { "x-api-key": API_KEY },
        });
        if (!res.ok) throw new Error(`${res.status}`);
        const d = await res.json();
        setStats({
          holders: d.holders ?? null,
          price:   d.price?.usd   ?? d.pools?.[0]?.price?.usd   ?? null,
          mcap:    d.marketCap?.usd ?? d.pools?.[0]?.marketCap?.usd ?? null,
        });
        setStatus("ok");
      } catch (e) {
        console.warn("Stats:", e.message);
        setStatus("error");
      }
    };
    fetch_();
    const iv = setInterval(fetch_, 60_000);
    return () => clearInterval(iv);
  }, []);

  return { stats, status };
}

// ── Animated number ───────────────────────────────────────────────────────────
function AnimNum({ value, decimals = 0, prefix = "", suffix = "" }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    if (value === null) return;
    const from = prev.current, to = value, start = performance.now(), dur = 900;
    const tick = now => {
      const p = Math.min((now - start) / dur, 1), ease = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (to - from) * ease);
      if (p < 1) requestAnimationFrame(tick); else prev.current = to;
    };
    requestAnimationFrame(tick);
  }, [value]);
  if (value === null) return <span>—</span>;
  return <span>{prefix}{display.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</span>;
}

// ── StatCard ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, prefix = "", suffix = "", decimals = 0, pulse, mobile }) {
  return (
    <div style={{ textAlign: "center", position: "relative", padding: mobile ? "20px 0" : 0 }}>
      {pulse && (
        <span style={{
          position: "absolute", top: mobile ? 20 : 4, right: mobile ? 8 : -8,
          width: 6, height: 6, borderRadius: "50%", background: "#3ecf8e",
          display: "inline-block", animation: "live-pulse 2s ease infinite",
        }} />
      )}
      <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: "clamp(26px,7vw,44px)", letterSpacing: "-0.02em", lineHeight: 1, color: "#0e0e0e" }}>
        <AnimNum value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
      </div>
      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "#bbb", marginTop: 8 }}>
        {label}
      </div>
    </div>
  );
}

// ── CopyCA ────────────────────────────────────────────────────────────────────
function CopyCA({ mobile }) {
  const [state, setState] = useState("idle");
  const mag = useMagnetic(.18);
  const copy = () => { navigator.clipboard.writeText(CA); setState("copied"); setTimeout(() => setState("idle"), 2000); };
  const copied = state === "copied";

  // Truncate CA for display on mobile
  const displayCA = mobile ? `${CA.slice(0, 8)}...${CA.slice(-8)}` : CA;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, width: "100%" }}>
      <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: "#aaa" }}>
        Contract Address
      </span>
      <button
        ref={mag.ref} onMouseMove={mag.onMouseMove} onMouseLeave={mag.onMouseLeave}
        onClick={copy}
        style={{
          all: "unset", display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 12, width: "100%", maxWidth: mobile ? "100%" : 420,
          background: copied ? "#0e0e0e" : "rgba(0,0,0,0.04)",
          border: `1px solid ${copied ? "#0e0e0e" : "rgba(0,0,0,0.1)"}`,
          borderRadius: 8, padding: mobile ? "14px 16px" : "14px 20px",
          cursor: "pointer", transition: "all .3s cubic-bezier(.22,1,.36,1)",
          boxSizing: "border-box",
        }}>
        <span style={{
          fontFamily: "'DM Mono',monospace", fontSize: mobile ? 11 : 11,
          letterSpacing: "0.04em", fontWeight: 300,
          color: copied ? "#f9f7f4" : "#0e0e0e", transition: "color .3s",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          flex: 1,
        }}>
          {copied ? "✓  copied to clipboard" : displayCA}
        </span>
        <span style={{ color: copied ? "#f9f7f4" : "#aaa", transition: "color .3s", flexShrink: 0 }}>
          {copied
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>}
        </span>
      </button>
    </div>
  );
}

// ── MagLink ───────────────────────────────────────────────────────────────────
function MagLink({ href, children, mobile }) {
  const mag = useMagnetic(.28);
  const [hov, setHov] = useState(false);
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      ref={mag.ref} onMouseMove={mag.onMouseMove}
      onMouseLeave={e => { mag.onMouseLeave(e); setHov(false); }}
      onMouseEnter={() => setHov(true)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        fontFamily: "'DM Mono',monospace", fontSize: mobile ? 11 : 10,
        letterSpacing: "0.2em", textTransform: "uppercase",
        color: hov ? "#0e0e0e" : "#888", textDecoration: "none",
        transition: "color .2s", padding: mobile ? "12px 20px" : "8px 0",
        border: mobile ? "1px solid rgba(0,0,0,0.1)" : "none",
        borderRadius: mobile ? 8 : 0,
        flex: mobile ? 1 : "none",
        justifyContent: mobile ? "center" : "flex-start",
        background: mobile ? "rgba(0,0,0,0.03)" : "transparent",
      }}>
      {children}
    </a>
  );
}

// ── Marquee ───────────────────────────────────────────────────────────────────
function Marquee() {
  const txt = "SIMPLE COIN · BUY · HOLD · REPEAT · THE SIMPLEST IDEA IS THE STRONGEST ONE · ";
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 10,
      overflow: "hidden", borderTop: "1px solid rgba(0,0,0,0.07)",
      background: "rgba(249,247,244,0.97)", backdropFilter: "blur(8px)", padding: "9px 0",
    }}>
      <div style={{ display: "flex", whiteSpace: "nowrap", animation: "marquee 24s linear infinite" }}>
        {[...Array(4)].map((_, i) => (
          <span key={i} style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "#bbb" }}>
            {txt}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t); }, []);
  const { stats, status } = useLiveStats();
  const mobile = useIsMobile();

  const fi = (d) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(24px)",
    transition: `opacity .85s cubic-bezier(.22,1,.36,1) ${d}s, transform .85s cubic-bezier(.22,1,.36,1) ${d}s`,
  });

  const fmtMcap = (v) => {
    if (v === null) return null;
    if (v >= 1_000_000) return { value: v / 1_000_000, suffix: "M", decimals: 2, prefix: "$" };
    if (v >= 1_000)     return { value: v / 1_000,     suffix: "K", decimals: 1, prefix: "$" };
    return { value: v, suffix: "", decimals: 0, prefix: "$" };
  };
  const mcapFmt = fmtMcap(stats.mcap);

  const coinSize = mobile ? 140 : 180;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #f9f7f4; color: #0e0e0e; font-family: 'DM Mono', monospace; overscroll-behavior: none; -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #ddd; border-radius: 2px; }
        @keyframes blink    { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes marquee  { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes spin-slow{ from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes pulse-ring { 0%{transform:scale(.9);opacity:.5} 100%{transform:scale(1.7);opacity:0} }
        @keyframes live-pulse { 0%{box-shadow:0 0 0 0 rgba(62,207,142,.5)} 70%{box-shadow:0 0 0 6px rgba(62,207,142,0)} 100%{box-shadow:0 0 0 0 rgba(62,207,142,0)} }
      `}</style>

      <Particles />

      {/* corner marks — hide on very small screens */}
      {!mobile && ["tl","tr","bl","br"].map(p => (
        <div key={p} style={{
          position: "fixed", zIndex: 5, width: 18, height: 18,
          top: p[0]==="t" ? 20 : "auto", bottom: p[0]==="b" ? 20 : "auto",
          left: p[1]==="l" ? 20 : "auto", right: p[1]==="r" ? 20 : "auto",
          borderTop:    p[0]==="t" ? "1px solid rgba(0,0,0,.15)" : "none",
          borderBottom: p[0]==="b" ? "1px solid rgba(0,0,0,.15)" : "none",
          borderLeft:   p[1]==="l" ? "1px solid rgba(0,0,0,.15)" : "none",
          borderRight:  p[1]==="r" ? "1px solid rgba(0,0,0,.15)" : "none",
        }} />
      ))}

      {/* ── HERO ── */}
      <section style={{
        minHeight: "100svh",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: mobile ? "60px 20px 120px" : "80px 24px 140px",
        position: "relative", zIndex: 1, gap: 0,
      }}>
        {/* coin */}
        <div style={{ ...fi(.05), position: "relative", marginBottom: mobile ? 36 : 52 }}>
          {[1, 2].map(i => (
            <div key={i} style={{
              position: "absolute", inset: -20 * i, borderRadius: "50%",
              border: "1px solid rgba(0,0,0,.07)",
              animation: `pulse-ring ${2.2 + i * .9}s cubic-bezier(.22,1,.36,1) ${i * .5}s infinite`,
              pointerEvents: "none",
            }} />
          ))}
          <Coin3D size={coinSize} />
        </div>

        {/* eyebrow */}
        <div style={{ ...fi(.15), fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: "0.32em", textTransform: "uppercase", color: "#bbb", marginBottom: mobile ? 16 : 22 }}>
          Solana · 2026
        </div>

        {/* headline */}
        <h1 style={{
          ...fi(.25),
          fontFamily: "'DM Serif Display',serif",
          fontSize: mobile ? "clamp(52px,16vw,72px)" : "clamp(60px,13vw,116px)",
          lineHeight: .88, letterSpacing: "-0.03em",
          textAlign: "center", color: "#0e0e0e",
          marginBottom: mobile ? 24 : 32,
        }}>
          Simple<br /><em style={{ color: "#ccc" }}>is enough.</em>
        </h1>

        {/* typewriter */}
        <div style={{
          ...fi(.35),
          fontFamily: "'DM Serif Display',serif",
          fontSize: mobile ? "clamp(15px,4.5vw,20px)" : "clamp(17px,3vw,25px)",
          fontStyle: "italic", color: "#999",
          textAlign: "center",
          marginBottom: mobile ? 40 : 56,
          minHeight: "1.5em",
          padding: "0 12px",
        }}>
          <Typewriter />
        </div>

        {/* divider */}
        <div style={{ ...fi(.4), width: 1, height: mobile ? 36 : 52, background: "linear-gradient(to bottom,transparent,rgba(0,0,0,.15),transparent)", marginBottom: mobile ? 36 : 52 }} />

        {/* CA */}
        <div style={{ ...fi(.5), marginBottom: mobile ? 32 : 48, width: "100%", maxWidth: mobile ? "100%" : 460, padding: mobile ? "0 0" : 0 }}>
          <CopyCA mobile={mobile} />
        </div>

        {/* links */}
        <div style={{ ...fi(.6), display: "flex", gap: mobile ? 12 : 40, alignItems: "center", width: mobile ? "100%" : "auto" }}>
          <MagLink href={X_URL} mobile={mobile}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Twitter
          </MagLink>
          {!mobile && <div style={{ width: 1, height: 20, background: "rgba(0,0,0,.1)" }} />}
          <MagLink href={COMM_URL} mobile={mobile}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Community
          </MagLink>
        </div>

        {/* scroll hint — desktop only */}
        {!mobile && (
          <div style={{ ...fi(.85), position: "absolute", bottom: 80, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: "0.25em", textTransform: "uppercase", color: "#ccc" }}>scroll</span>
            <div style={{ width: 1, height: 32, background: "linear-gradient(to bottom,#ccc,transparent)" }} />
          </div>
        )}
      </section>

      {/* ── LIVE STATS ── */}
      <section style={{
        padding: mobile ? "60px 20px" : "80px 24px",
        position: "relative", zIndex: 1,
        borderTop: "1px solid rgba(0,0,0,0.06)",
        display: "flex", flexDirection: "column", alignItems: "center",
      }}>
        {/* live badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: mobile ? 32 : 48 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3ecf8e", display: "inline-block", animation: "live-pulse 2s ease infinite" }} />
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "#aaa" }}>
            {status === "loading" ? "Fetching on-chain data..." : status === "error" ? "Add API key for live data" : "Live on-chain data"}
          </span>
        </div>

        {/* stat grid — stacks on mobile */}
        <div style={{
          display: "grid",
          gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(3,1fr)",
          gap: mobile ? "0" : 56,
          maxWidth: 680, width: "100%",
        }}>
          {/* on mobile: Holders full width top, then price + mcap side by side */}
          {mobile ? (
            <>
              <div style={{ gridColumn: "1 / -1", borderBottom: "1px solid rgba(0,0,0,0.06)", paddingBottom: 24, marginBottom: 0 }}>
                <StatCard label="Holders" value={stats.holders} pulse={status === "ok"} mobile={mobile} />
              </div>
              <div style={{ borderRight: "1px solid rgba(0,0,0,0.06)", paddingRight: 16, paddingTop: 24 }}>
                <StatCard label="Price" value={stats.price} prefix="$"
                  decimals={stats.price && stats.price < 0.001 ? 8 : stats.price && stats.price < 1 ? 6 : 4}
                  pulse={status === "ok"} mobile={mobile} />
              </div>
              <div style={{ paddingLeft: 16, paddingTop: 24 }}>
                {mcapFmt
                  ? <StatCard label="Market Cap" value={mcapFmt.value} prefix={mcapFmt.prefix} suffix={mcapFmt.suffix} decimals={mcapFmt.decimals} pulse={status === "ok"} mobile={mobile} />
                  : <StatCard label="Market Cap" value={null} pulse={false} mobile={mobile} />}
              </div>
            </>
          ) : (
            <>
              <StatCard label="Holders" value={stats.holders} pulse={status === "ok"} />
              <StatCard label="Price" value={stats.price} prefix="$"
                decimals={stats.price && stats.price < 0.001 ? 8 : stats.price && stats.price < 1 ? 6 : 4}
                pulse={status === "ok"} />
              {mcapFmt
                ? <StatCard label="Market Cap" value={mcapFmt.value} prefix={mcapFmt.prefix} suffix={mcapFmt.suffix} decimals={mcapFmt.decimals} pulse={status === "ok"} />
                : <StatCard label="Market Cap" value={null} pulse={false} />}
            </>
          )}
        </div>

        <div style={{ marginTop: mobile ? 32 : 40, fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: "0.15em", color: "#ddd", textAlign: "center" }}>
          Updates every 60s · Powered by SolanaTracker
        </div>
      </section>

      {/* ── MANIFESTO ── */}
      <section style={{
        padding: mobile ? "60px 20px" : "100px 24px",
        position: "relative", zIndex: 1,
        borderTop: "1px solid rgba(0,0,0,0.06)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ maxWidth: 700, width: "100%" }}>
          <div style={{
            fontFamily: "'DM Serif Display',serif",
            fontSize: mobile ? "clamp(28px,8vw,44px)" : "clamp(34px,7vw,68px)",
            lineHeight: 1.06, letterSpacing: "-0.025em", color: "#0e0e0e",
            marginBottom: mobile ? 40 : 56,
          }}>
            "The most powerful ideas<br />
            <span style={{ color: "#ccc" }}>need no explanation."</span>
          </div>

          {/* manifesto grid — always 1 col on mobile */}
          <div style={{
            display: "grid",
            gridTemplateColumns: mobile ? "1fr" : "1fr 1fr",
            gap: mobile ? 0 : 32,
          }}>
            {[
              { n: "01", t: "No Whitepaper", b: "You already understand it. That's the point." },
              { n: "02", t: "No Roadmap",    b: "The destination is simplicity. You're already there." },
              { n: "03", t: "No Utility",    b: "Sometimes a thing's value is that it simply exists." },
              { n: "04", t: "No Complexity", b: "Buy. Hold. Let the idea do the work." },
            ].map(({ n, t, b }) => (
              <div key={n} style={{ borderTop: "1px solid rgba(0,0,0,0.08)", padding: mobile ? "20px 0" : "24px 0 0 0" }}>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: "0.2em", color: "#ccc", marginBottom: 10 }}>{n}</div>
                <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: mobile ? 18 : 20, marginBottom: 8, color: "#0e0e0e" }}>{t}</div>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, fontWeight: 300, lineHeight: 1.7, color: "#888" }}>{b}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{
        minHeight: mobile ? "auto" : "55vh",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: mobile ? "60px 20px 100px" : "100px 24px 140px",
        position: "relative", zIndex: 1,
        borderTop: "1px solid rgba(0,0,0,0.06)",
      }}>
        {!mobile && (
          <div style={{ position: "absolute", opacity: .04, width: 360, height: 360, animation: "spin-slow 40s linear infinite", pointerEvents: "none" }}>
            <img src="logo.png" alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
        )}
        <div style={{
          fontFamily: "'DM Serif Display',serif",
          fontSize: mobile ? "clamp(44px,14vw,72px)" : "clamp(48px,10vw,96px)",
          lineHeight: .9, letterSpacing: "-0.03em",
          textAlign: "center", marginBottom: mobile ? 32 : 40, position: "relative",
        }}>
          Are you<br /><em style={{ color: "#ccc" }}>in?</em>
        </div>
        <div style={{ marginBottom: mobile ? 36 : 52, position: "relative", width: "100%" }}>
          <CopyCA mobile={mobile} />
        </div>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "#ddd", textAlign: "center" }}>
          Simple Coin · Solana · 2026 · Keep it simple
        </div>
      </section>

      <Marquee />
    </>
  );
}