import React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

export function ErrorState({ message, details }: { message: string; details?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-[var(--danger)]/5 border border-[var(--danger)]/30 rounded-xl text-center h-full min-h-[150px]">
      <AlertTriangle className="w-8 h-8 text-[var(--danger)] mb-3 opacity-80" />
      <span className="font-bold text-[var(--danger)] text-sm uppercase tracking-wider">{message}</span>
      {details && <span className="text-xs text-[var(--danger)]/70 font-mono mt-2">{details}</span>}
    </div>
  );
}

export function EmptyState({ message, icon: Icon }: { message: string; icon?: React.ElementType }) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center h-full min-h-[150px] border border-dashed border-[var(--border)] rounded-xl bg-[var(--surface-2)]/30">
      {Icon && <Icon className="w-6 h-6 text-[var(--muted)] mb-3 opacity-30" />}
      <span className="text-[10px] text-[var(--muted)] font-mono uppercase tracking-widest">{message}</span>
    </div>
  );
}

export function LoadingState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center h-full min-h-[150px] border border-[var(--border)] rounded-xl bg-[var(--surface-2)]/30">
      <Loader2 className="w-6 h-6 text-[var(--accent)] animate-spin mb-3" />
      <span className="text-[10px] font-mono text-[var(--accent)] tracking-widest uppercase animate-pulse">{message}</span>
    </div>
  );
}
