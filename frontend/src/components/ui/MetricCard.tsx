import React from "react";

export function MetricCard({ label, value, subtext }: { label: string; value: React.ReactNode; subtext?: string }) {
  return (
    <div className="flex flex-col gap-1 p-3 bg-surface border border-border rounded">
      <span className="text-xs font-mono text-muted uppercase">{label}</span>
      <span className="text-lg font-medium">{value}</span>
      {subtext && <span className="text-xs text-muted">{subtext}</span>}
    </div>
  );
}
