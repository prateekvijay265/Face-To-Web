import React from "react";
import { ExternalLink, Eye, Plus, Link2 } from "lucide-react";

type SearchResultProps = {
  rank: number;
  url: string;
  source: string;
  matchStatus?: string;
  confidence?: number;
  engines?: string[];
  thumbnail?: string;
};

function getDomain(url: string) {
  try { return new URL(url).hostname.replace("www.", ""); }
  catch { return url; }
}

function getSourceColor(source: string) {
  const map: Record<string, string> = {
    Pinterest: "#e60023",
    LinkedIn: "#0a66c2",
    Instagram: "#c13584",
    Facebook: "#1877f2",
    Twitter: "#1da1f2",
    Flickr: "#ff0084",
    SoundCloud: "#ff5500",
    Google: "#4285f4",
    Reddit: "#ff4500",
    YouTube: "#ff0000",
  };
  for (const key in map) {
    if (source.toLowerCase().includes(key.toLowerCase())) return map[key];
  }
  return "var(--accent)";
}

export function SearchResultCard({ rank, url, source, matchStatus, confidence, engines, thumbnail }: SearchResultProps) {
  const confVal = confidence ? confidence * 100 : 0;
  const confStr = confVal.toFixed(1);
  const domain = getDomain(url);
  const sourceColor = getSourceColor(source);

  let statusBg = "var(--surface-3)";
  let statusColor = "var(--muted)";
  let statusBorder = "var(--border)";
  if (matchStatus === "MATCH") { statusBg = "var(--success-glow)"; statusColor = "var(--success)"; statusBorder = "var(--success)"; }
  if (matchStatus === "POSSIBLE_MATCH") { statusBg = "rgba(255,202,40,0.1)"; statusColor = "var(--warning)"; statusBorder = "var(--warning)"; }
  if (matchStatus === "NO_MATCH") { statusBg = "rgba(255,59,92,0.1)"; statusColor = "var(--danger)"; statusBorder = "var(--danger)"; }

  const date = new Date();
  const timestamp = `${String(date.getDate()).padStart(2,"0")}/${String(date.getMonth()+1).padStart(2,"0")}/${date.getFullYear()} ${String(date.getHours()).padStart(2,"0")}:${String(date.getMinutes()).padStart(2,"0")}`;

  return (
    <div className="flex items-stretch gap-0 border-b group transition-all duration-150 hover:bg-[var(--surface-2)]"
      style={{ borderColor: "var(--border)", minHeight: 88 }}>

      {/* Rank stripe */}
      <div className="shrink-0 w-10 flex flex-col items-center justify-center gap-1 py-3"
        style={{ borderRight: "1px solid var(--border)" }}>
        <span className="mono font-bold" style={{ fontSize: 11, color: "var(--accent)" }}>
          {String(rank).padStart(2, "0")}
        </span>
      </div>

      {/* Thumbnail — bigger, square */}
      <div className="shrink-0 relative overflow-hidden"
        style={{ width: 80, background: "var(--surface-3)", borderRight: "1px solid var(--border)" }}>
        {thumbnail ? (
          <img src={thumbnail} alt={source}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="mono" style={{ fontSize:8, color:"var(--muted)", textTransform:"uppercase" }}>No image</div>
          </div>
        )}
        {/* Source color bar */}
        <div style={{
          position:"absolute", bottom:0, left:0, right:0, height:3,
          background:sourceColor, opacity:0.9
        }} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col justify-between py-3 px-4 min-w-0 gap-1.5">
        {/* Source name + status badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* Colored dot for source */}
            <div style={{ width:8, height:8, borderRadius:"50%", background:sourceColor, flexShrink:0, boxShadow:`0 0 5px ${sourceColor}` }} />
            <span className="font-bold text-sm truncate" style={{ color:"var(--text)" }}>{source}</span>
            {engines?.map(e => (
              <span key={e} style={{
                fontSize:7, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase",
                padding:"1px 5px", borderRadius:3, background:"var(--surface-3)",
                color:"var(--muted)", border:"1px solid var(--border)", flexShrink:0
              }}>{e}</span>
            ))}
          </div>
          {matchStatus && (
            <span className="mono shrink-0" style={{
              fontSize:7, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase",
              padding:"2px 7px", borderRadius:3, border:`1px solid ${statusBorder}`,
              background:statusBg, color:statusColor,
            }}>{matchStatus.replace(/_/g, " ")}</span>
          )}
        </div>

        {/* URL — styled as a clickable pill */}
        <a href={url} target="_blank" rel="noreferrer"
          className="flex items-center gap-1.5 group/link"
          style={{ textDecoration:"none" }}>
          <div style={{
            display:"flex", alignItems:"center", gap:6,
            background:"var(--surface-3)", border:"1px solid var(--border)",
            borderRadius:6, padding:"3px 8px", maxWidth:"100%", overflow:"hidden",
            transition:"border-color .15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--info)")}
          onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}>
            <Link2 size={9} style={{ color:"var(--info)", flexShrink:0 }} />
            <span className="mono" style={{
              fontSize:9, color:"var(--info)", overflow:"hidden",
              textOverflow:"ellipsis", whiteSpace:"nowrap",
            }}>{domain}</span>
            <span className="mono" style={{
              fontSize:8, color:"var(--muted)", overflow:"hidden",
              textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1,
            }}>/{url.split("/").slice(3).join("/").substring(0, 40)}{url.split("/").slice(3).join("/").length > 40 ? "…" : ""}</span>
            <ExternalLink size={8} style={{ color:"var(--muted)", flexShrink:0, opacity:0.6 }} />
          </div>
        </a>

        {/* Bottom row: confidence + timestamp + actions */}
        <div className="flex items-center gap-4">
          {/* Confidence */}
          <div className="flex items-center gap-2">
            <div style={{ width:60, height:3, background:"var(--surface-3)", borderRadius:2, overflow:"hidden" }}>
              <div style={{
                width:`${confVal}%`, height:"100%", borderRadius:2,
                background:`linear-gradient(90deg, var(--accent), var(--accent-2))`,
                boxShadow:`0 0 4px var(--accent-glow)`
              }} />
            </div>
            <span className="mono font-bold" style={{ fontSize:10, color:"var(--text)" }}>{confStr}%</span>
          </div>

          <span className="mono" style={{ fontSize:8, color:"var(--muted)" }}>{timestamp}</span>

          {/* Actions — only visible on hover */}
          <div className="flex items-center gap-2 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <a href={url} target="_blank" rel="noreferrer" title="Open source"
              style={{
                display:"flex", alignItems:"center", gap:4,
                fontSize:9, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase",
                color:"var(--accent)", background:"var(--accent-glow)", border:"1px solid var(--accent)",
                borderRadius:4, padding:"3px 8px", textDecoration:"none", transition:"opacity .15s"
              }}>
              <ExternalLink size={9} /> Open
            </a>
            <button title="View evidence" style={{
              display:"flex", alignItems:"center", gap:4,
              fontSize:9, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase",
              color:"var(--text-2)", background:"var(--surface-3)", border:"1px solid var(--border)",
              borderRadius:4, padding:"3px 8px", cursor:"pointer", transition:"all .15s"
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--info)"; e.currentTarget.style.borderColor = "var(--info)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-2)"; e.currentTarget.style.borderColor = "var(--border)"; }}>
              <Eye size={9} /> View
            </button>
            <button title="Add to case" style={{
              display:"flex", alignItems:"center", gap:4,
              fontSize:9, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase",
              color:"var(--text-2)", background:"var(--surface-3)", border:"1px solid var(--border)",
              borderRadius:4, padding:"3px 8px", cursor:"pointer", transition:"all .15s"
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--success)"; e.currentTarget.style.borderColor = "var(--success)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-2)"; e.currentTarget.style.borderColor = "var(--border)"; }}>
              <Plus size={9} /> Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
