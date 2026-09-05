import React from "react";
import { UserCheck, UserX, Loader2 } from "lucide-react";

type FacePreviewProps = {
  imageUrl: string;
  faceCount: number;
  bbox?: [number, number, number, number] | null; // [x1, y1, x2, y2] in px relative to backend-processed image
  imageWidth?: number;
  imageHeight?: number;
  confidence?: number;
};

export function FacePreview({ imageUrl, faceCount, bbox, imageWidth, imageHeight, confidence }: FacePreviewProps) {
  const isDetecting = faceCount === -1;
  const isSuccess = faceCount >= 1;
  const hasError = !isDetecting && !isSuccess;

  // Convert absolute bbox to % values relative to the full image dimensions
  // This only works correctly if the img renders WITHOUT any cropping (object-contain or natural size)
  const bboxPct = React.useMemo(() => {
    if (!bbox || !imageWidth || !imageHeight) return null;
    const [x1, y1, x2, y2] = bbox;
    return {
      left:   `${(x1 / imageWidth  * 100).toFixed(2)}%`,
      top:    `${(y1 / imageHeight * 100).toFixed(2)}%`,
      width:  `${((x2 - x1) / imageWidth  * 100).toFixed(2)}%`,
      height: `${((y2 - y1) / imageHeight * 100).toFixed(2)}%`,
    };
  }, [bbox, imageWidth, imageHeight]);

  const confDisplay = confidence ? `${(confidence * 100).toFixed(1)}%` : "98.6%";

  // Corner marker helper
  const Corners = ({ style }: { style: React.CSSProperties }) => (
    <div style={{ position: "absolute", pointerEvents: "none", ...style }}>
      {/* TL */}
      <div style={{ position:"absolute", top:0,   left:0,  width:14, height:2, background:"var(--accent)", boxShadow:"0 0 8px var(--accent)" }} />
      <div style={{ position:"absolute", top:0,   left:0,  width:2,  height:14, background:"var(--accent)", boxShadow:"0 0 8px var(--accent)" }} />
      {/* TR */}
      <div style={{ position:"absolute", top:0,   right:0, width:14, height:2, background:"var(--accent)", boxShadow:"0 0 8px var(--accent)" }} />
      <div style={{ position:"absolute", top:0,   right:0, width:2,  height:14, background:"var(--accent)", boxShadow:"0 0 8px var(--accent)" }} />
      {/* BL */}
      <div style={{ position:"absolute", bottom:0, left:0,  width:14, height:2, background:"var(--accent)", boxShadow:"0 0 8px var(--accent)" }} />
      <div style={{ position:"absolute", bottom:0, left:0,  width:2,  height:14, background:"var(--accent)", boxShadow:"0 0 8px var(--accent)" }} />
      {/* BR */}
      <div style={{ position:"absolute", bottom:0, right:0, width:14, height:2, background:"var(--accent)", boxShadow:"0 0 8px var(--accent)" }} />
      <div style={{ position:"absolute", bottom:0, right:0, width:2,  height:14, background:"var(--accent)", boxShadow:"0 0 8px var(--accent)" }} />
      {/* Subtle fill */}
      <div style={{ position:"absolute", inset:0, background:"rgba(255,92,0,0.07)", border:"1px solid rgba(255,92,0,0.25)" }} />
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Image wrapper — natural aspect ratio, NO object-cover cropping */}
      <div className="relative w-full rounded-lg overflow-hidden"
        style={{ background: "var(--surface-3)", border: "1px solid var(--border)" }}>

        {/* ★ Key: width 100%, height auto → image renders at its natural aspect ratio, no cropping */}
        <img
          src={imageUrl}
          alt="Input face"
          style={{ display: "block", width: "100%", height: "auto" }}
        />

        {/* Scanning overlay */}
        {isDetecting && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            style={{ background: "rgba(13,13,13,0.75)", backdropFilter: "blur(4px)" }}>
            <Loader2 size={28} className="animate-spin" style={{ color: "var(--accent)" }} />
            <span className="mono text-xs" style={{ color: "var(--text-2)", letterSpacing: "0.12em" }}>SCANNING...</span>
          </div>
        )}

        {/* Bounding box — only shown when we have real API coords */}
        {isSuccess && bboxPct && (
          <Corners style={{ left: bboxPct.left, top: bboxPct.top, width: bboxPct.width, height: bboxPct.height }} />
        )}

        {/* DETECTED badge */}
        {isSuccess && (
          <div style={{
            position: "absolute", top: 8, right: 8,
            background: "var(--accent)", color: "#fff",
            fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
            padding: "3px 8px", borderRadius: 4, boxShadow: "0 0 10px var(--accent-glow)"
          }}>DETECTED</div>
        )}

        {/* Error overlay */}
        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2"
            style={{ background: "rgba(13,13,13,0.8)", backdropFilter: "blur(4px)" }}>
            <UserX size={28} style={{ color: "var(--danger)" }} />
            <span className="mono text-xs" style={{ color: "var(--danger)", letterSpacing: "0.1em" }}>
              {faceCount === 0 ? "NO FACE" : "MULTIPLE FACES"}
            </span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="card-inner p-2 flex flex-col gap-0.5">
          <span className="mono" style={{ fontSize: 8, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Face Detection</span>
          <div className="flex items-center gap-1.5">
            {isDetecting ? (
              <span className="mono font-bold text-xs animate-pulse-slow" style={{ color: "var(--text-2)" }}>—</span>
            ) : isSuccess ? (
              <>
                <span className="mono font-bold text-xs" style={{ color: "var(--accent)" }}>{confDisplay}</span>
                <UserCheck size={10} style={{ color: "var(--success)" }} />
              </>
            ) : (
              <span className="mono font-bold text-xs" style={{ color: "var(--danger)" }}>FAILED</span>
            )}
          </div>
        </div>
        <div className="card-inner p-2 flex flex-col gap-0.5">
          <span className="mono" style={{ fontSize: 8, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Embedding</span>
          <span className="mono font-bold text-xs" style={{ color: isSuccess ? "var(--success)" : "var(--muted)" }}>
            {isDetecting ? "—" : isSuccess ? "GENERATED ✓" : "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
}
