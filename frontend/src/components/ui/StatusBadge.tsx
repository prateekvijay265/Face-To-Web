import React from "react";
import { CheckCircle2, AlertCircle, Clock, XCircle, ChevronRight } from "lucide-react";

type Status = "IDLE" | "PROCESSING" | "SUCCESS" | "WARNING" | "ERROR" | "SKIPPED";

export function StatusBadge({ status }: { status: Status }) {
  const config = {
    IDLE: { color: "text-muted border-border", icon: Clock },
    PROCESSING: { color: "text-accent border-accent", icon: ChevronRight },
    SUCCESS: { color: "text-success border-success", icon: CheckCircle2 },
    WARNING: { color: "text-warning border-warning", icon: AlertCircle },
    ERROR: { color: "text-danger border-danger", icon: XCircle },
    SKIPPED: { color: "text-muted border-border", icon: ChevronRight },
  };

  const { color, icon: Icon } = config[status];

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-mono tracking-wider ${color}`}>
      <Icon className="w-3 h-3" />
      <span>{status}</span>
    </div>
  );
}
