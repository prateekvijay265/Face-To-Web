"use client";
import React, { useState, useRef } from "react";
import { UploadDropzone } from "@/components/ui/UploadDropzone";
import { FacePreview } from "@/components/ui/FacePreview";
import { PipelineStepper } from "@/components/ui/PipelineStepper";
import { SearchResultCard } from "@/components/ui/SearchResultCard";
import { VerificationCard } from "@/components/ui/VerificationCard";
import { useToast } from "@/components/ui/Toast";
import Link from "next/link";
import {
  ScanFace, Search, Shield, BarChart3, FileText,
  Plus, ChevronDown, Settings, Bell, Activity, Upload,
  Loader2, Home, Zap, ArrowLeft
} from "lucide-react";

/* ─── Sidebar ────────────────────────────────────────────── */
function Sidebar({ active, setActive, onNew }: { active: string; setActive: (s: string) => void; onNew: () => void }) {
  const items = [
    { id: "investigation", label: "Investigation", icon: <ScanFace size={15} /> },
    { id: "evidence",      label: "Evidence",      icon: <FileText size={15} /> },
    { id: "search",        label: "Search",         icon: <Search size={15} /> },
    { id: "verification",  label: "Verification",   icon: <Shield size={15} /> },
    { id: "reports",       label: "Reports",        icon: <BarChart3 size={15} /> },
  ];
  return (
    <aside style={{
      width: "var(--sidebar-w)", flexShrink: 0,
      background: "var(--surface)", borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column", padding: "0 8px",
      position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 40,
    }}>
      {/* Logo */}
      <div style={{ padding: "16px 8px", borderBottom: "1px solid var(--border)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none", color: "inherit" }}>
          <div style={{
            width: 30, height: 30, borderRadius: 7,
            background: "var(--accent-dim)", border: "1px solid var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <ScanFace size={16} style={{ color: "var(--accent)" }} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>Face-to-Web</div>
            <div style={{ fontSize: 8, color: "var(--muted)", letterSpacing: "0.08em" }}>Evidence Workstation</div>
          </div>
        </Link>
      </div>

      {/* New Investigation */}
      <div style={{ padding: "12px 0 6px" }}>
        <button className="btn-accent w-full btn-sm" onClick={onNew} style={{ justifyContent: "space-between", width: "100%" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Plus size={12} /> New Investigation</span>
          <ChevronDown size={12} />
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, paddingTop: 4 }}>
        {items.map(item => (
          <button key={item.id} onClick={() => setActive(item.id)}
            className={`sidebar-nav-item ${active === item.id ? "active" : ""}`}>
            {item.icon} {item.label}
          </button>
        ))}
      </nav>

      {/* Back to home */}
      <div style={{ padding: "8px 0", borderTop: "1px solid var(--border)" }}>
        <Link href="/" className="sidebar-nav-item" style={{ textDecoration: "none" }}>
          <ArrowLeft size={14} /> Back to Home
        </Link>
      </div>

      {/* System status */}
      <div style={{ padding: "10px 10px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)", boxShadow: "0 0 6px var(--success)" }} className="anim-pulse-slow" />
          <span style={{ fontSize: 10, color: "var(--text-2)", fontWeight: 600 }}>System Online</span>
        </div>
        <div style={{ fontSize: 8, color: "var(--muted)", letterSpacing: "0.06em" }}>All systems operational · v1.0</div>
      </div>
    </aside>
  );
}

/* ─── Top Header ─────────────────────────────────────────── */
function TopHeader({ caseId, runState }: { caseId: string; runState: any }) {
  const candidateCount = runState?.data?.matches?.length || (runState?.data?.match ? 1 : 0);
  return (
    <header style={{
      height: 52, background: "var(--surface)", borderBottom: "1px solid var(--border)",
      display: "flex", alignItems: "center",
      paddingLeft: `calc(var(--sidebar-w) + 20px)`, paddingRight: 20, gap: 16,
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 30,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)", boxShadow: "0 0 6px var(--success)" }} />
          <span className="mono" style={{ fontSize: 9, color: "var(--success)", fontWeight: 700, letterSpacing: "0.12em" }}>ONLINE</span>
        </div>
        <div style={{ width: 1, height: 16, background: "var(--border)" }} />
        <span className="mono" style={{ fontSize: 9, color: "var(--muted)" }}>
          CASE ID: <span style={{ color: "var(--text-2)" }}>{caseId}</span>
        </span>
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        {[
          { label: "Case Integrity", val: "94%", color: "var(--accent)" },
          { label: "Evidence Items", val: String(candidateCount).padStart(2, "0"), color: "var(--text)" },
        ].map((m, i) => (
          <React.Fragment key={m.label}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <span style={{ fontSize: 8, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{m.label}</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: m.color, lineHeight: 1.1 }}>{m.val}</span>
            </div>
            {i === 0 && <div style={{ width: 1, height: 32, background: "var(--border)" }} />}
          </React.Fragment>
        ))}
        <div style={{ width: 1, height: 32, background: "var(--border)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex" }}><Settings size={14} /></button>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex" }}><Bell size={14} /></button>
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>HH</div>
        </div>
      </div>
    </header>
  );
}

/* ─── Telemetry ──────────────────────────────────────────── */
function Telemetry({ stages }: { stages: any[] }) {
  const rows = [
    { label: "Face detection",      stageId: "upload",   ms: 78 },
    { label: "Embedding generation",stageId: "upload",   ms: 112 },
    { label: "Query dispatch",      stageId: "search",   ms: 64 },
    { label: "Results received",    stageId: "evidence", ms: 156 },
  ];
  const getStatus = (sid: string) => stages.find(s => s.id === sid)?.status || "IDLE";
  const total = rows.reduce((a, r) => a + r.ms, 0);
  return (
    <div className="card" style={{ padding: 16 }}>
      <div className="section-header" style={{ marginBottom: 12 }}>Search Telemetry</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {rows.map(r => {
          const st = getStatus(r.stageId);
          const done = st === "SUCCESS";
          const run  = st === "PROCESSING";
          return (
            <div key={r.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, background: done ? "var(--success)" : run ? "var(--accent)" : "var(--muted)", boxShadow: done ? "0 0 5px var(--success)" : run ? "0 0 5px var(--accent)" : "none" }} />
                <span style={{ fontSize: 11, color: "var(--text-2)" }}>{r.label}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="mono" style={{ fontSize: 8, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{done ? "COMPLETED" : run ? "RUNNING" : "WAITING"}</span>
                {done && <span className="mono" style={{ fontSize: 10, color: "var(--text-2)" }}>{r.ms}ms</span>}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10, marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "var(--text-2)", fontWeight: 600 }}>Total latency</span>
        <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>{total}ms</span>
      </div>
    </div>
  );
}

/* ─── Workstation Page ───────────────────────────────────── */
export default function InvestigatePage() {
  const { addToast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [runState, setRunState] = useState<any>(null);
  const isCanceledRef = useRef(false);
  const [active, setActive] = useState("investigation");
  const [filter, setFilter] = useState("All");
  const caseId = "CASE-2026-0509-0017";

  const getStages = () => {
    const s = [
      { id: "upload",   label: "INPUT",    sublabel: "Image upload",     status: "IDLE" },
      { id: "search",   label: "SEARCH",   sublabel: "Find candidates",  status: "IDLE" },
      { id: "evidence", label: "EVIDENCE", sublabel: "Discover sources", status: "IDLE" },
      { id: "verify",   label: "VERIFY",   sublabel: "Verify integrity", status: "IDLE" },
    ];
    if (!runState) return s;
    const { status, current_stage, stages = {} } = runState;
    const set = (id: string, names: string[]) => {
      const step = s.find(x => x.id === id); if (!step) return;
      if (names.some(n => stages[n]?.status === "FAILED")) step.status = "ERROR";
      else if (names.some(n => stages[n]?.status === "PROCESSING") || (names.includes(current_stage) && status === "RUNNING")) step.status = "PROCESSING";
      else if (names.every(n => stages[n]?.status === "SUCCESS")) step.status = "SUCCESS";
    };
    set("upload",   ["FACE_DETECTION"]);
    set("search",   ["SEARCHING"]);
    set("evidence", ["EVIDENCE_RETRIEVAL", "HASHING"]);
    set("verify",   ["BLOCKCHAIN_SUBMISSION", "VERIFICATION"]);
    return s as any;
  };

  const startPipeline = async (imageFile: File) => {
    isCanceledRef.current = false;
    setRunState({ status: "RUNNING", current_stage: "RECEIVED", stages: {}, data: {} });
    try {
      const fd = new FormData(); fd.append("image", imageFile);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/pipeline/run`, { method: "POST", body: fd });
      if (!res.ok) { try { const e = await res.json(); addToast(e.message || "Pipeline failed", "ERROR"); } catch { addToast(`HTTP ${res.status}`, "ERROR"); } setRunState((p: any) => ({ ...p, status: "FAILED" })); return; }
      if (!res.body) throw new Error("No body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const parts = buf.split("\n\n"); buf = parts.pop() || "";
        for (const p of parts) {
          if (!p.trim()) continue;
          try { const parsed = JSON.parse(p.trim()); if (parsed.error_code) { addToast(parsed.message || "Error", "ERROR"); setRunState((x: any) => ({ ...x, status: "FAILED" })); return; } if (!isCanceledRef.current) setRunState(parsed); } catch {}
        }
      }
      if (buf.trim()) try { const parsed = JSON.parse(buf.trim()); if (!isCanceledRef.current) setRunState(parsed); } catch {}
    } catch { addToast("Pipeline error.", "ERROR"); setRunState((p: any) => ({ ...p, status: "FAILED" })); }
  };

  const handleUpload = (f: File) => { setFile(f); setPreviewUrl(URL.createObjectURL(f)); startPipeline(f); };

  const handleVerifyAgain = async () => {
    if (!runState?.data?.blockchain) return;
    try {
      setRunState((p: any) => ({ ...p, stages: { ...p.stages, VERIFICATION: { status: "PROCESSING" } } }));
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/blockchain/verify`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ source_url: runState.data.evidence?.source_url, expected_hash: runState.data.blockchain?.evidence_hash, transaction_hash: runState.data.blockchain?.transaction_hash }) });
      const v = await res.json();
      setRunState((p: any) => ({ ...p, data: { ...p.data, verification: v }, stages: { ...p.stages, VERIFICATION: { status: v.status === "VERIFIED" ? "SUCCESS" : "FAILED" } } }));
      addToast(v.status === "VERIFIED" ? "Integrity confirmed." : "Verification issue.", v.status === "VERIFIED" ? "SUCCESS" : "ERROR");
    } catch { setRunState((p: any) => ({ ...p, stages: { ...p.stages, VERIFICATION: { status: "FAILED" } } })); }
  };

  const reset = () => { isCanceledRef.current = true; setFile(null); setPreviewUrl(""); setRunState(null); setActive("investigation"); };

  const stages = getStages();
  const data = runState?.data || {};
  const allMatches: any[] = data.matches || (data.match ? [data.match] : []);
  const filters = ["All", "High confidence", "Social", "Visual"];
  const filtered = allMatches.filter(m => {
    if (filter === "All") return true;
    if (filter === "High confidence") return (m.confidence || 0) >= 0.8;
    return true;
  });

  /* ── Section content ── */
  const renderInvestigation = () => (
    <>
      {/* Pipeline / Upload bar */}
      <div className="card" style={{ padding: 16 }}>
        {!file ? (
          <UploadDropzone onUpload={handleUpload} />
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <div style={{ width: 36, height: 36, borderRadius: 6, overflow: "hidden", border: "1px solid var(--border)", flexShrink: 0 }}>
                <img src={previewUrl} alt="upload" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{file.name}</div>
                <div className="mono" style={{ fontSize: 9, color: "var(--muted)" }}>{(file.size/1024/1024).toFixed(2)}MB · {file.type.split("/")[1]?.toUpperCase()}</div>
              </div>
            </div>
            <div style={{ flex: 1 }}><PipelineStepper stages={stages} /></div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button className="btn-ghost btn-sm" onClick={reset}><Upload size={11} /> Replace</button>
              <button className="btn-accent btn-sm" onClick={() => file && startPipeline(file)} disabled={runState?.status === "RUNNING"}>
                {runState?.status === "RUNNING" ? <Loader2 size={11} className="animate-spin" /> : <Activity size={11} />}
                {runState?.status === "RUNNING" ? "Analyzing…" : "Analyze"}
              </button>
            </div>
          </div>
        )}
      </div>

      {file && (
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 14, alignItems: "start" }}>
          {/* Left */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="section-header">Input Image</div>
              <FacePreview imageUrl={previewUrl}
                faceCount={data.face ? data.face.face_count : (runState?.stages?.FACE_DETECTION?.status === "PROCESSING" ? -1 : 1)}
                bbox={data.face?.bbox}
                imageWidth={data.face?.image_width}
                imageHeight={data.face?.image_height}
                confidence={data.face?.confidence}
              />
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10 }}>
                <div className="mono" style={{ fontSize: 8, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Image Metadata</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
                  {[
                    { label: "Res", val: `${data.face?.image_width || "—"}×${data.face?.image_height || "—"}` },
                    { label: "Format", val: file.name.split(".").pop()?.toUpperCase() || "—" },
                    { label: "Size",   val: `${(file.size/1024/1024).toFixed(1)}MB` },
                  ].map(m => (
                    <div key={m.label} className="card-inner" style={{ padding: "6px 8px", textAlign: "center" }}>
                      <div className="mono" style={{ fontSize: 7, color: "var(--muted)", textTransform: "uppercase" }}>{m.label}</div>
                      <div className="mono" style={{ fontSize: 9, color: "var(--text-2)", fontWeight: 600 }}>{m.val}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <Telemetry stages={stages} />
          </div>

          {/* Right */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Candidates */}
            <div className="card" style={{ overflow: "hidden" }}>
              <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div className="section-header" style={{ borderBottom: "none", paddingBottom: 0 }}>Search Candidates</div>
                <span className="mono" style={{ fontSize: 9, color: "var(--muted)" }}>{allMatches.length} results</span>
              </div>
              <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", display: "flex", gap: 6 }}>
                {filters.map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{
                    background: filter === f ? "var(--accent)" : "var(--surface-3)",
                    color: filter === f ? "#fff" : "var(--text-2)",
                    border: `1px solid ${filter === f ? "var(--accent)" : "var(--border)"}`,
                    borderRadius: 5, padding: "4px 10px", fontSize: 10, fontWeight: 600, cursor: "pointer", transition: "all .15s"
                  }}>{f}</button>
                ))}
              </div>
              <div style={{ padding: "0 16px" }}>
                {filtered.length === 0 ? (
                  <div style={{ padding: "32px 0", textAlign: "center" }}>
                    {runState?.status === "RUNNING" ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                        <Loader2 size={24} className="animate-spin" style={{ color: "var(--accent)" }} />
                        <span className="mono" style={{ fontSize: 9, color: "var(--muted)", letterSpacing: "0.12em" }}>RUNNING NEURAL SEARCH…</span>
                      </div>
                    ) : <span style={{ fontSize: 12, color: "var(--muted)" }}>No candidates found</span>}
                  </div>
                ) : filtered.map((m: any, idx: number) => (
                  <SearchResultCard key={idx} rank={m.rank ?? idx+1} source={m.source || "Unknown"}
                    url={m.url} matchStatus={m.match_status} confidence={m.confidence}
                    engines={m.metadata?.engines} thumbnail={m.thumbnail} />
                ))}
              </div>
            </div>

            {/* Verification */}
            {(data.blockchain || data.fingerprint) && (
              <VerificationCard
                status={data.verification?.status || (runState?.stages?.VERIFICATION?.status === "PROCESSING" ? "PROCESSING" : "UNAVAILABLE")}
                localHash={data.verification?.local_hash || data.fingerprint?.evidence_hash}
                onChainHash={data.verification?.on_chain_hash || data.blockchain?.evidence_hash}
                blockchain={data.blockchain} onVerifyAgain={handleVerifyAgain}
                isVerifying={runState?.stages?.VERIFICATION?.status === "PROCESSING"}
              />
            )}
          </div>
        </div>
      )}

      {!file && (
        <div style={{ textAlign: "center", marginTop: 72 }}>
          <ScanFace size={52} style={{ color: "var(--muted)", margin: "0 auto 12px" }} />
          <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text-2)", marginBottom: 6 }}>Start a New Investigation</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>Drag & drop a face image above to begin the blockchain evidence pipeline.</div>
        </div>
      )}
    </>
  );

  const renderSection = () => {
    switch (active) {
      case "evidence": return (
        <div className="card" style={{ padding: 24 }}>
          <div className="section-header" style={{ marginBottom: 16 }}>Evidence Library</div>
          {allMatches.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 0" }}>
              <FileText size={40} style={{ color: "var(--muted)", margin: "0 auto 12px" }} />
              <div style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 4 }}>No evidence collected yet</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>Run an investigation to capture evidence.</div>
              <button className="btn-accent btn-sm" style={{ marginTop: 16 }} onClick={() => setActive("investigation")}><Zap size={11} /> Start Investigation</button>
            </div>
          ) : allMatches.map((m: any, i) => <SearchResultCard key={i} rank={i+1} source={m.source || "Unknown"} url={m.url} matchStatus={m.match_status} confidence={m.confidence} engines={m.metadata?.engines} thumbnail={m.thumbnail} />)}
        </div>
      );
      case "search": return (
        <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="section-header">Search Candidates</div>
          <div style={{ display: "flex", gap: 6 }}>
            {filters.map(f => <button key={f} onClick={() => setFilter(f)} style={{ background: filter===f?"var(--accent)":"var(--surface-3)", color:filter===f?"#fff":"var(--text-2)", border:`1px solid ${filter===f?"var(--accent)":"var(--border)"}`, borderRadius:5, padding:"4px 10px", fontSize:10, fontWeight:600, cursor:"pointer" }}>{f}</button>)}
          </div>
          {filtered.length === 0 ? <div style={{ textAlign:"center", padding:"48px 0", color:"var(--muted)", fontSize:12 }}>No results — run an investigation first.</div>
            : filtered.map((m: any, i) => <SearchResultCard key={i} rank={i+1} source={m.source||"Unknown"} url={m.url} matchStatus={m.match_status} confidence={m.confidence} engines={m.metadata?.engines} thumbnail={m.thumbnail} />)}
        </div>
      );
      case "verification": return (data.blockchain || data.fingerprint) ? (
        <VerificationCard status={data.verification?.status || "UNAVAILABLE"} localHash={data.verification?.local_hash || data.fingerprint?.evidence_hash} onChainHash={data.verification?.on_chain_hash || data.blockchain?.evidence_hash} blockchain={data.blockchain} onVerifyAgain={handleVerifyAgain} isVerifying={runState?.stages?.VERIFICATION?.status === "PROCESSING"} />
      ) : (
        <div className="card" style={{ padding: 48, textAlign:"center" }}>
          <Shield size={40} style={{ color:"var(--muted)", margin:"0 auto 12px" }} />
          <div style={{ fontSize:13, color:"var(--text-2)", marginBottom:6 }}>No blockchain record yet</div>
          <div style={{ fontSize:11, color:"var(--muted)" }}>Complete an investigation first.</div>
          <button className="btn-accent btn-sm" style={{ marginTop:16 }} onClick={() => setActive("investigation")}><ScanFace size={11} /> Run Investigation</button>
        </div>
      );
      case "reports": return (
        <div className="card" style={{ padding: 24, display:"flex", flexDirection:"column", gap:16 }}>
          <div className="section-header">Reports</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
            {[
              { label:"Investigations", val: file?"1":"0", color:"var(--accent)" },
              { label:"Matches Found",  val: String(allMatches.length), color:"var(--success)" },
              { label:"Verified",       val: data.verification?.status==="VERIFIED"?"1":"0", color:"var(--info)" },
            ].map(s => (
              <div key={s.label} className="card-inner" style={{ padding:20 }}>
                <div className="mono" style={{ fontSize:8, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:6 }}>{s.label}</div>
                <div style={{ fontSize:32, fontWeight:800, color:s.color }}>{s.val}</div>
              </div>
            ))}
          </div>
          {file && (
            <div style={{ borderTop:"1px solid var(--border)", paddingTop:14 }}>
              <div className="mono" style={{ fontSize:8, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:10 }}>Current Case</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                {[
                  { label:"File",       val: file.name },
                  { label:"Case ID",    val: caseId },
                  { label:"Status",     val: runState?.status || "IDLE" },
                  { label:"Candidates", val: String(allMatches.length) },
                ].map((r, i) => (
                  <div key={i} className="card-inner" style={{ padding:"10px 12px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span className="mono" style={{ fontSize:9, color:"var(--muted)", textTransform:"uppercase" }}>{r.label}</span>
                    <span className="mono" style={{ fontSize:10, color:"var(--text-2)", fontWeight:600 }}>{r.val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
      default: return renderInvestigation();
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active={active} setActive={setActive} onNew={reset} />
      <div style={{ marginLeft: "var(--sidebar-w)", flex: 1, display: "flex", flexDirection: "column" }}>
        <TopHeader caseId={caseId} runState={runState} />
        <main style={{ marginTop: 52, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          {renderSection()}
        </main>
      </div>
    </div>
  );
}
