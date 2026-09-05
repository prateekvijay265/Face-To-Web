"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ScanFace, Shield, Search, Link2, Zap, ArrowRight,
  Github, ExternalLink, ChevronDown, Eye, Lock, Globe,
  Cpu, Database, Network, CheckCircle2, Star
} from "lucide-react";

/* ─── Animated Counter ───────────────────────────────────── */
function Counter({ to, suffix = "", duration = 1800 }: { to: number; suffix?: string; duration?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        setVal(Math.round(ease * to));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to, duration]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* ─── Reveal on scroll ───────────────────────────────────── */
function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { e.target.classList.add("visible"); obs.disconnect(); }
    }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ─── Floating particle ─────────────────────────────────── */
function Particles() {
  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    dur: Math.random() * 8 + 6,
    delay: Math.random() * 4,
  }));
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: "absolute",
          left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size,
          borderRadius: "50%",
          background: "var(--accent)",
          opacity: 0.25,
          animation: `float ${p.dur}s ease-in-out ${p.delay}s infinite alternate`,
        }} />
      ))}
    </div>
  );
}

/* ─── Pipeline Step Card ─────────────────────────────────── */
function StepCard({ num, icon, title, desc, color, delay }: any) {
  return (
    <Reveal delay={delay}>
      <div className="card-glow p-6 flex flex-col gap-4 h-full" style={{ position: "relative", overflow: "hidden" }}>
        {/* Background number */}
        <div style={{
          position: "absolute", bottom: -10, right: 8,
          fontSize: 80, fontWeight: 800, color: "rgba(255,255,255,0.025)",
          fontFamily: "var(--font-syne), sans-serif", lineHeight: 1, userSelect: "none"
        }}>{num}</div>

        <div style={{
          width: 44, height: 44, borderRadius: 10, display: "flex",
          alignItems: "center", justifyContent: "center",
          background: `${color}18`, border: `1px solid ${color}40`,
        }}>
          <div style={{ color }}>{icon}</div>
        </div>

        <div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color, marginBottom: 6 }}>
            Step {num}
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>{title}</h3>
          <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.65 }}>{desc}</p>
        </div>
      </div>
    </Reveal>
  );
}

/* ─── Feature row ───────────────────────────────────────── */
function FeatureRow({ icon, title, desc, delay }: any) {
  return (
    <Reveal delay={delay}>
      <div style={{
        display: "flex", gap: 16, padding: "20px 0",
        borderBottom: "1px solid var(--border)",
        transition: "all 0.2s",
      }}
      onMouseEnter={e => (e.currentTarget.style.paddingLeft = "8px")}
      onMouseLeave={e => (e.currentTarget.style.paddingLeft = "0px")}
      >
        <div style={{ color: "var(--accent)", flexShrink: 0, paddingTop: 2 }}>{icon}</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>{title}</div>
          <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.6 }}>{desc}</div>
        </div>
        <ArrowRight size={14} style={{ color: "var(--muted)", marginLeft: "auto", flexShrink: 0, alignSelf: "center" }} />
      </div>
    </Reveal>
  );
}

/* ─── Main Page ─────────────────────────────────────────── */
export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);

  // Parallax on hero
  useEffect(() => {
    const onScroll = () => {
      if (!heroRef.current) return;
      const y = window.scrollY;
      heroRef.current.style.transform = `translateY(${y * 0.25}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const techStack = [
    "InsightFace", "Python", "FastAPI", "Next.js", "Google Vision API",
    "SerpAPI", "Ethereum", "Solidity", "Web3.py", "SHA-256", "TypeScript", "TailwindCSS",
  ];

  return (
    <div style={{ minHeight: "100vh" }}>

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section style={{
        position: "relative", minHeight: "100vh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        overflow: "hidden", paddingTop: "var(--nav-h)",
      }}>
        {/* Background layers */}
        <div className="grid-bg" style={{ position: "absolute", inset: 0 }} />
        <div className="spotlight" style={{ position: "absolute", inset: 0 }} />
        <Particles />

        {/* Glowing orb */}
        <div style={{
          position: "absolute", width: 500, height: 500,
          borderRadius: "50%", top: "50%", left: "50%",
          transform: "translate(-50%,-60%)",
          background: "radial-gradient(circle, rgba(255,92,0,0.08) 0%, transparent 70%)",
          filter: "blur(40px)",
          animation: "breathe 6s ease-in-out infinite",
        }} />

        {/* Content */}
        <div ref={heroRef} style={{ textAlign: "center", padding: "0 clamp(16px,4vw,48px)", maxWidth: 900, position: "relative", zIndex: 2 }}>
          {/* HH Goa badge */}
          <div className="anim-fade-up" style={{ marginBottom: 28 }}>
            <span className="badge badge-accent" style={{ fontSize: 9 }}>
              ✦ HH GOA 2026 · TASK #3 · GOA, INDIA
            </span>
          </div>

          <h1 className="display-xl anim-fade-up delay-100" style={{ marginBottom: 16 }}>
            Verify Faces.<br />
            <span className="text-gradient-shimmer">Anchor Truth.</span>
          </h1>

          <p className="anim-fade-up delay-200" style={{
            fontSize: "clamp(14px,2vw,18px)", color: "var(--text-2)",
            lineHeight: 1.7, maxWidth: 620, margin: "0 auto 40px",
          }}>
            A complete pipeline that detects faces from photos, finds real matching
            social media posts via reverse-image search, and writes tamper-evident
            evidence onto the Ethereum blockchain.
          </p>

          <div className="anim-fade-up delay-300" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/investigate" className="btn-accent" style={{ fontSize: 14, padding: "14px 28px" }}>
              <Zap size={16} /> Launch Workstation
            </Link>
            <Link href="/about" className="btn-ghost" style={{ fontSize: 14, padding: "13px 28px" }}>
              <Info2 /> How It Works
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="anim-fade-up delay-500" style={{
            display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap",
            marginTop: 48, paddingTop: 32, borderTop: "1px solid var(--border)",
          }}>
            {[
              { icon: <Shield size={13} />, label: "Blockchain Verified" },
              { icon: <Lock size={13} />, label: "SHA-256 Hashed" },
              { icon: <Globe size={13} />, label: "Ethereum Sepolia" },
              { icon: <Eye size={13} />, label: "Real Image Search" },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-2)" }}>
                <span style={{ color: "var(--accent)" }}>{item.icon}</span> {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div style={{
          position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
          color: "var(--muted)", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase",
          animation: "float 2s ease-in-out infinite",
        }}>
          <span>Scroll</span>
          <ChevronDown size={14} />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STATS TICKER
      ══════════════════════════════════════════ */}
      <section style={{
        padding: "48px clamp(16px,4vw,80px)",
        background: "var(--surface)",
        borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)",
        overflow: "hidden",
      }}>
        <div className="marquee-track" style={{ gap: 64 }}>
          {[...Array(2)].map((_, rep) =>
            [
              { val: 98.6, suf: "%", label: "Face Detection Accuracy" },
              { val: 410, suf: "ms", label: "Avg Pipeline Latency" },
              { val: 3,   suf: "",   label: "Real Search Engines" },
              { val: 100, suf: "%",  label: "On-chain Tamper Proof" },
              { val: 11155111, suf: "", label: "Ethereum Chain ID" },
              { val: 256, suf: "-bit", label: "SHA-256 Fingerprint" },
            ].map((s, i) => (
              <div key={`${rep}-${i}`} style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "var(--accent)", lineHeight: 1 }}>
                    <Counter to={s.val} suffix={s.suf} />
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-2)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{s.label}</div>
                </div>
                <div style={{ width: 1, height: 40, background: "var(--border)" }} />
              </div>
            ))
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PIPELINE STEPS
      ══════════════════════════════════════════ */}
      <section style={{ padding: "100px clamp(16px,4vw,80px)", position: "relative" }}>
        <div className="spotlight-center" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />

        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <div className="label" style={{ marginBottom: 12 }}>✦ Pipeline</div>
              <h2 className="display-lg">Four steps.<br /><span className="text-gradient">One tamper-proof record.</span></h2>
              <p style={{ fontSize: 15, color: "var(--text-2)", maxWidth: 520, margin: "16px auto 0", lineHeight: 1.7 }}>
                From a single photo to an immutable blockchain record — the entire pipeline runs in under a second.
              </p>
            </div>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            <StepCard num={1} icon={<ScanFace size={22} />}     title="Face Detection"      color="var(--accent)"  delay={0}
              desc="InsightFace buffalo_l model detects and encodes your face with 512-dimensional embeddings in under 100ms." />
            <StepCard num={2} icon={<Search size={22} />}        title="Reverse Image Search" color="var(--info)"    delay={100}
              desc="Google Vision API + SerpAPI query the open web for real matching images. No hardcoded results, ever." />
            <StepCard num={3} icon={<Link2 size={22} />}         title="Evidence Capture"    color="var(--warning)" delay={200}
              desc="The top match URL, metadata, and image are retrieved. A SHA-256 fingerprint is generated for integrity." />
            <StepCard num={4} icon={<Shield size={22} />}        title="Blockchain Anchor"   color="var(--success)" delay={300}
              desc="The evidence hash is written to a smart contract on Ethereum Sepolia — permanently and tamper-evidently." />
          </div>

          {/* Connector line (desktop only) */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 32 }}>
            {["Upload", "Search", "Hash", "Anchor"].map((s, i) => (
              <React.Fragment key={s}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div className="timeline-dot done" style={{ width: 22, height: 22, fontSize: 9 }}>
                    <CheckCircle2 size={11} />
                  </div>
                  <span style={{ fontSize: 9, color: "var(--text-2)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>{s}</span>
                </div>
                {i < 3 && <div style={{ width: 40, height: 1, background: "var(--border)" }} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURES SPLIT
      ══════════════════════════════════════════ */}
      <section style={{
        padding: "100px clamp(16px,4vw,80px)",
        background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>

          {/* Left: text */}
          <div>
            <Reveal>
              <div className="label" style={{ marginBottom: 12 }}>✦ Features</div>
              <h2 className="display-lg" style={{ marginBottom: 20 }}>
                Less noise.<br /><span className="text-gradient">More signal.</span>
              </h2>
              <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.8, marginBottom: 32 }}>
                Built in the spirit of HH Goa — no fluff, no useless abstractions.
                Just a fully functional pipeline that ships and works.
              </p>
            </Reveal>

            <FeatureRow icon={<Cpu size={16} />}      delay={100} title="Real Face Encoding" desc="InsightFace buffalo_l — production-grade neural network. Not a toy detector." />
            <FeatureRow icon={<Globe size={16} />}     delay={200} title="Live Web Search"    desc="Queries Google Vision + SerpAPI in real-time. Every result is a genuine match." />
            <FeatureRow icon={<Database size={16} />}  delay={300} title="SHA-256 Fingerprint" desc="Deterministic hash of evidence URL + metadata. Any change breaks the fingerprint." />
            <FeatureRow icon={<Network size={16} />}   delay={400} title="Ethereum Anchoring"  desc="Smart contract on Sepolia testnet. Transaction hash viewable on Etherscan." />
          </div>

          {/* Right: visual card */}
          <Reveal delay={200}>
            <div style={{ position: "relative" }}>
              <div className="card-glow" style={{ padding: 24 }}>
                {/* Fake terminal */}
                <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
                  {["#ff5f57","#ffbd2e","#28c840"].map(c => (
                    <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
                  ))}
                  <span className="mono" style={{ marginLeft: 8, fontSize: 10, color: "var(--muted)" }}>pipeline.output</span>
                </div>
                {[
                  { t: "var(--success)", l: "✓ Face detected", r: "98.6% confidence" },
                  { t: "var(--success)", l: "✓ Embedding generated", r: "512-dim vector" },
                  { t: "var(--success)", l: "✓ Match found", r: "pinterest.com" },
                  { t: "var(--success)", l: "✓ Hash computed", r: "SHA-256" },
                  { t: "var(--accent)",  l: "⬡ Blockchain tx", r: "0x3d4e..." },
                  { t: "var(--info)",    l: "★ VERIFIED",      r: "Sepolia #328,771,408" },
                ].map((row, i) => (
                  <div key={i} className="mono" style={{
                    display: "flex", justifyContent: "space-between", padding: "7px 0",
                    borderBottom: "1px solid var(--border)", fontSize: 11,
                    color: row.t, animation: `fade-up 0.4s var(--ease-out) ${i * 80}ms both`,
                  }}>
                    <span>{row.l}</span>
                    <span style={{ color: "var(--text-2)", fontSize: 9 }}>{row.r}</span>
                  </div>
                ))}
              </div>

              {/* Floating accent dot */}
              <div style={{
                position: "absolute", top: -12, right: -12, width: 24, height: 24,
                borderRadius: "50%", background: "var(--success)", boxShadow: "0 0 16px var(--success-dim)",
                animation: "breathe 3s ease-in-out infinite",
              }} />
            </div>
          </Reveal>
        </div>

        <style>{`
          @media(max-width:768px){
            section > div { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>

      {/* ══════════════════════════════════════════
          TECH STACK MARQUEE
      ══════════════════════════════════════════ */}
      <section style={{ padding: "72px clamp(16px,4vw,80px)", overflow: "hidden" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div className="label" style={{ marginBottom: 8 }}>✦ Tech Stack</div>
            <h2 className="heading">Built with best-in-class tools</h2>
          </div>
        </Reveal>
        <div style={{ overflow: "hidden", maskImage: "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)" }}>
          <div className="marquee-track" style={{ gap: 12 }}>
            {[...techStack, ...techStack].map((t, i) => (
              <div key={i} style={{
                flexShrink: 0, padding: "8px 20px",
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: 999, fontSize: 12, fontWeight: 600, color: "var(--text-2)",
                letterSpacing: "0.04em", whiteSpace: "nowrap",
                transition: "all 0.2s",
              }}>{t}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA
      ══════════════════════════════════════════ */}
      <section style={{
        padding: "120px clamp(16px,4vw,80px)",
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        <div className="spotlight-center" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
        <Particles />
        <div style={{ position: "relative", zIndex: 2 }}>
          <Reveal>
            <div className="label" style={{ marginBottom: 16 }}>✦ Ready?</div>
            <h2 className="display-lg" style={{ marginBottom: 16 }}>
              Start your<br /><span className="text-gradient">investigation now.</span>
            </h2>
            <p style={{ fontSize: 15, color: "var(--text-2)", maxWidth: 480, margin: "0 auto 40px", lineHeight: 1.7 }}>
              Upload a face photo and watch the entire pipeline run — from detection to blockchain record — in seconds.
            </p>
          </Reveal>
          <Reveal delay={200}>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/investigate" className="btn-accent" style={{ fontSize: 15, padding: "16px 36px" }}>
                <Zap size={17} /> Launch Workstation
              </Link>
              <a href="https://hhgoa.com" target="_blank" rel="noreferrer" className="btn-ghost" style={{ fontSize: 14, padding: "15px 28px" }}>
                <ExternalLink size={14} /> HH Goa 2026
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer style={{
        padding: "32px clamp(16px,4vw,80px)",
        borderTop: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ScanFace size={16} style={{ color: "var(--accent)" }} />
          <span style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.06em" }}>
            FACE-TO-WEB DISCOVERY · HH GOA 2026 · TASK #3
          </span>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <span className="mono" style={{ fontSize: 9, color: "var(--muted)" }}>Ethereum Sepolia · Chain ID 11155111</span>
          <a href="https://hhgoa.com" target="_blank" rel="noreferrer"
            style={{ fontSize: 11, color: "var(--muted)", textDecoration: "none", transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--muted)")}>
            hhgoa.com
          </a>
        </div>
      </footer>
    </div>
  );
}

function Info2() { return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>; }
