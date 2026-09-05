"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ScanFace, Home, Info, Menu, X, Zap } from "lucide-react";

const links = [
  { href: "/",           label: "Home",        icon: <Home size={15} /> },
  { href: "/investigate",label: "Investigate",  icon: <ScanFace size={15} /> },
  { href: "/about",      label: "About",        icon: <Info size={15} /> },
];

export function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  const isWorkstation = pathname === "/investigate";

  // The workstation has its own full-bleed layout — hide global nav there
  if (isWorkstation) return null;

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        height: "var(--nav-h)",
        background: scrolled ? "rgba(8,8,8,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
        transition: "all 0.3s var(--ease-out)",
        display: "flex", alignItems: "center",
        padding: "0 clamp(16px, 4vw, 48px)",
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", marginRight: "auto" }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: "var(--accent-dim)", border: "1px solid var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 14px var(--accent-glow)",
            transition: "box-shadow 0.3s",
          }}>
            <ScanFace size={18} style={{ color: "var(--accent)" }} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text)", lineHeight: 1 }}>Face-to-Web</div>
            <div style={{ fontSize: 8, color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>HH Goa · Task 3</div>
          </div>
        </Link>

        {/* Desktop links */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }} className="hide-mobile">
          {links.map(l => (
            <Link key={l.href} href={l.href} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 14px", borderRadius: 8,
              fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase",
              textDecoration: "none",
              color: pathname === l.href ? "var(--accent)" : "var(--text-2)",
              background: pathname === l.href ? "var(--accent-dim)" : "transparent",
              border: pathname === l.href ? "1px solid rgba(255,92,0,0.3)" : "1px solid transparent",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { if (pathname !== l.href) { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.background = "var(--surface-2)"; }}}
            onMouseLeave={e => { if (pathname !== l.href) { e.currentTarget.style.color = "var(--text-2)"; e.currentTarget.style.background = "transparent"; }}}
            >
              {l.icon} {l.label}
            </Link>
          ))}
          <Link href="/investigate" className="btn-accent btn-sm" style={{ marginLeft: 8, textDecoration: "none" }}>
            <Zap size={12} /> Launch App
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(o => !o)}
          className="show-mobile"
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text)", padding: 8 }}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile drawer */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 99,
        background: "rgba(8,8,8,0.97)", backdropFilter: "blur(20px)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16,
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.35s var(--ease-out)",
      }}>
        {links.map(l => (
          <Link key={l.href} href={l.href} style={{
            display: "flex", alignItems: "center", gap: 12, textDecoration: "none",
            fontSize: 22, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase",
            color: pathname === l.href ? "var(--accent)" : "var(--text)",
            padding: "16px 32px", borderRadius: 12,
            background: pathname === l.href ? "var(--accent-dim)" : "transparent",
            transition: "all 0.2s",
          }}>
            {l.icon} {l.label}
          </Link>
        ))}
        <Link href="/investigate" className="btn-accent" style={{ marginTop: 16, textDecoration: "none", fontSize: 14 }}>
          <Zap size={14} /> Launch Workstation
        </Link>
      </div>

      <style>{`
        .hide-mobile { display: flex; }
        .show-mobile { display: none; }
        @media (max-width: 680px) {
          .hide-mobile { display: none !important; }
          .show-mobile { display: block !important; }
        }
      `}</style>
    </>
  );
}
