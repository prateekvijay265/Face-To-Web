import React from "react";
import { Check, Loader2, X } from "lucide-react";

export type PipelineStage = {
  id: string;
  label: string;
  sublabel: string;
  status: "IDLE" | "PROCESSING" | "SUCCESS" | "WARNING" | "ERROR";
};

export function PipelineStepper({ stages }: { stages: PipelineStage[] }) {
  const completedCount = stages.filter(s => s.status === "SUCCESS").length;

  return (
    <div className="flex items-center w-full">
      {stages.map((stage, index) => {
        const isSuccess = stage.status === "SUCCESS";
        const isProcessing = stage.status === "PROCESSING";
        const isError = stage.status === "ERROR";
        const isActive = isProcessing;

        let dotClass = "timeline-dot";
        if (isSuccess) dotClass += " done";
        else if (isProcessing) dotClass += " active";
        else if (isError) dotClass += " error";

        const lineClass = `timeline-line${index < stages.length - 1 ? (isSuccess ? " done" : isProcessing ? " active" : "") : ""}`;

        return (
          <React.Fragment key={stage.id}>
            <div className="timeline-step">
              <div className={dotClass}>
                {isSuccess ? <Check size={12} strokeWidth={3} /> : isProcessing ? <Loader2 size={12} className="animate-spin" /> : isError ? <X size={12} /> : index + 1}
              </div>
              <div className="flex flex-col items-center text-center w-[70px]">
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: isActive || isSuccess ? "var(--text)" : "var(--muted)" }}>
                  {String(index + 1).padStart(2, "0")} {stage.label}
                </span>
                <span style={{ fontSize: 8, color: "var(--muted)", marginTop: 1 }}>{stage.sublabel}</span>
              </div>
            </div>
            {index < stages.length - 1 && (
              <div className={lineClass} style={{ flex: 1, margin: "0 4px", marginTop: "-16px" }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
