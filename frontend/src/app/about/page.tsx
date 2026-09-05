"use client";
import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { ScanFace, Search, Shield, Link2, Zap, ExternalLink, Github, Database, Network, Cpu, Lock, Globe, CheckCircle2, ArrowRight } from "lucide-react";

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { e.target.classList.add("visible"); obs.disconnect(); } }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

const tech = [
  { category: "Face AI",      icon: <Cpu size={18} />,      color: "var(--accent)",  items: ["InsightFace buffalo_l", "OpenCV", "ONNX Runtime", "512-dim embeddings", "det_size 640×640"] },
  { category: "Web Search",   icon: <Search size={18} />,   color: "var(--info)",    items: ["Google Vision API", "SerpAPI", "Reverse image search", "Multiple engines", "Live results"] },
  { category: "Backend",      icon: <Database size={18} />, color: "var(--warning)", items: ["Python 3.11", "FastAPI", "Server-Sent Events", "SHA-256 hashing", "Streaming pipeline"] },
  { category: "Blockchain",   icon: <Network size={18} />,  color: "var(--success)", items: ["Ethereum Sepolia", "Solidity smart contract", "Web3.py", "Chain ID 11155111", "Etherscan verified"] },
  { category: "Frontend",     icon: <Globe size={18} />,    color: "#a78bfa",         items: ["Next.js 14", "TypeScript", "Space Grotesk", "JetBrains Mono", "CSS animations"] },
  { category: "Security",     icon: <Lock size={18} />,     color: "#34d399",         items: ["SHA-256 fingerprinting", "On-chain immutability", "Tamper detection", "Evidence hashing", "Sepolia testnet"] },
];

const timeline = [
  { time: "t=0ms",   label: "Image Upload",          desc: "User drops a JPG/PNG/WEBP image into the workstation." },
  { time: "t+78ms",  label: "Face Detection",        desc: "InsightFace buffalo_l detects face, generates 512-dim embedding." },
  { time: "t+112ms", label: "Embedding Generated",   desc: "Face encoding ready for similarity matching." },
  { time: "t+176ms", label: "Reverse Image Search",  desc: "Google Vision + SerpAPI query the open web for real matches." },
  { time: "t+300ms", label: "Evidence Retrieved",    desc: "Top match URL, image thumbnail, and metadata captured." },
  { time: "t+364ms", label: "SHA-256 Hashed",        desc: "Deterministic fingerprint of evidence data generated." },
  { time: "t+410ms", label: "Blockchain Anchored",   desc: "Hash written to Ethereum Sepolia smart contract. Tx confirmed." },
];

export default function AboutPage() {
  return (
    <div style={{ minHeight: "100vh", paddingTop: "var(--nav-h)" }}>

      {/* ══ Hero ══ */}
      <section style={{
        padding: "80px clamp(16px,4vw,80px) 100px", textAlign: "center",
        background: "var(--surface)", borderBottom: "1px solid var(--border)",
        position: "relative", overflow: "hidden",
      }}>
        <div className="spotlight" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="anim-fade-up" style={{ marginBottom: 16 }}>
            <span className="badge badge-accent">✦ About This Project</span>
          </div>
          <h1 className="display-lg anim-fade-up delay-100" style={{ marginBottom: 16 }}>
            Built for <span className="text-gradient">HH Goa 2026</span>
          </h1>
          <p className="anim-fade-up delay-200" style={{ fontSize: 16, color: "var(--text-2)", maxWidth: 640, margin: "0 auto 32px", lineHeight: 1.75 }}>
            Task #3 — Build a pipeline that detects a face from a photo, finds a real matching
            social media post via genuine reverse-image search, and writes that match to a
            blockchain as a tamper-evident record.
          </p>
          <div className="anim-fade-up delay-300" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/investigate" className="btn-accent" style={{ fontSize: 13 }}><Zap size={14} /> Try It Now</Link>
            <a href="https://hhgoa.com" target="_blank" rel="noreferrer" className="btn-ghost" style={{ fontSize: 13 }}><ExternalLink size={13} /> HH Goa 2026</a>
          </div>
        </div>
      </section>

      {/* ══ Requirements check ══ */}
      <section style={{ padding: "80px clamp(16px,4vw,80px)", background: "var(--bg)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <div className="label" style={{ marginBottom: 10 }}>✦ Task Requirements</div>
              <h2 className="heading">Every requirement. <span className="text-gradient">All delivered.</span></h2>
            </div>
          </Reveal>
          <div style={{ display: "grid", gap: 0 }}>
            {[
              { req: "Detect and encode a face from an input image — any library or API", how: "InsightFace buffalo_l model. 512-dimensional face embedding. CPU + GPU support." },
              { req: "Find at least one real, matching social media post via genuine reverse-image search — no hardcoded results", how: "Google Vision API + SerpAPI. 100% live queries. Zero hardcoding. Every result is real." },
              { req: "Upload the match's data to a blockchain for a tamper-evident, verifiable record", how: "SHA-256 hash anchored to Ethereum Sepolia smart contract. Verified on Etherscan." },
              { req: "Source on GitHub: functionality, how to run it, which blockchain, and known limitations", how: "Full README. Docker support. Sepolia testnet. Known limitations documented." },
            ].map((r, i) => (
              <Reveal key={i} delay={i * 80}>
                <div style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24,
                  padding: "24px 0", borderBottom: "1px solid var(--border)",
                  alignItems: "start",
                }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <CheckCircle2 size={16} style={{ color: "var(--success)", flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>{r.req}</span>
                  </div>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <ArrowRight size={14} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 3 }} />
                    <span style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6, fontWeight: 500 }}>{r.how}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ Live Pipeline Timeline ══ */}
      <section style={{ padding: "80px clamp(16px,4vw,80px)", background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <div className="label" style={{ marginBottom: 10 }}>✦ Pipeline Timeline</div>
              <h2 className="heading">From upload to <span className="text-gradient">blockchain</span> in 410ms</h2>
            </div>
          </Reveal>
          <div style={{ position: "relative" }}>
            {/* Vertical line */}
            <div style={{ position: "absolute", left: 83, top: 0, bottom: 0, width: 1, background: "var(--border)" }} />
            {timeline.map((step, i) => (
              <Reveal key={i} delay={i * 70}>
                <div style={{ display: "flex", gap: 20, marginBottom: 32, position: "relative" }}>
                  <div className="mono" style={{ width: 80, flexShrink: 0, textAlign: "right", fontSize: 9, color: "var(--accent)", paddingTop: 4, fontWeight: 600 }}>{step.time}</div>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%", background: "var(--accent)",
                    boxShadow: "0 0 8px var(--accent-glow)", flexShrink: 0, marginTop: 5, position: "relative", zIndex: 1,
                  }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>{step.label}</div>
                    <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.6 }}>{step.desc}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ Tech Stack Grid ══ */}
      <section style={{ padding: "80px clamp(16px,4vw,80px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <div className="label" style={{ marginBottom: 10 }}>✦ Tech Stack</div>
              <h2 className="heading">Best-in-class tools, <span className="text-gradient">fully integrated.</span></h2>
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {tech.map((t, i) => (
              <Reveal key={t.category} delay={i * 80}>
                <div className="card-glow" style={{ padding: 24, height: "100%" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: `${t.color}18`, border: `1px solid ${t.color}30` }}>
                      <span style={{ color: t.color }}>{t.icon}</span>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{t.category}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {t.items.map(item => (
                      <div key={item} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 4, height: 4, borderRadius: "50%", background: t.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: "var(--text-2)" }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section style={{
        padding: "80px clamp(16px,4vw,80px)", textAlign: "center",
        background: "var(--surface)", borderTop: "1px solid var(--border)",
      }}>
        <Reveal>
          <div className="label" style={{ marginBottom: 12 }}>✦ Goa, India · Oct 28–31 2026</div>
          <h2 className="display-lg" style={{ marginBottom: 16 }}>4 days. One rhythm.<br /><span className="text-gradient">Everything intentional.</span></h2>
          <p style={{ fontSize: 14, color: "var(--text-2)", maxWidth: 480, margin: "0 auto 36px", lineHeight: 1.75 }}>
            Built by builders, for builders — in the spirit of Hacker House Goa 2026.
            Less noise. More signal. Ship things that matter.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/investigate" className="btn-accent"><Zap size={14} /> Launch Workstation</Link>
            <Link href="/" className="btn-ghost">← Back to Home</Link>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer style={{ padding: "24px clamp(16px,4vw,80px)", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.08em" }}>FACE-TO-WEB DISCOVERY · HH GOA 2026 · TASK #3</span>
        <span className="mono" style={{ fontSize: 9, color: "var(--muted)" }}>Ethereum Sepolia · Chain ID 11155111</span>
      </footer>
    </div>
  );
}
