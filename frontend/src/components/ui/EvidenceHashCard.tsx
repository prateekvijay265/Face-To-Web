"use client";
import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

export function EvidenceHashCard({ data }: { data: { algorithm: string, version: string, hash: string } }) {
  const [copied, setCopied] = useState(false);

  const copyHash = () => {
    navigator.clipboard.writeText(data.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-xl flex flex-col gap-6">
      <div className="flex justify-between items-center border-b border-[var(--border)] pb-2">
        <h3 className="font-mono text-sm text-[var(--muted)] tracking-widest uppercase">Forensic Metadata</h3>
        <div className="px-2 py-1 bg-[var(--surface-2)] border border-[var(--border)] rounded text-[10px] font-mono text-[var(--muted)]">
          v{data.version}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-mono text-[var(--muted)] uppercase tracking-wider">Evidence SHA-256</span>
            <span className="text-[10px] font-mono text-[var(--accent)] uppercase">{data.algorithm}</span>
          </div>
          <div className="relative group">
            <div className="font-mono text-xs break-all bg-[var(--surface-2)] p-4 rounded border border-[var(--border)] text-[var(--text)] group-hover:border-[var(--muted)] transition-colors">
              {data.hash}
            </div>
            <button 
              onClick={copyHash}
              className="absolute top-2 right-2 p-1.5 bg-[var(--surface)] border border-[var(--border)] rounded text-[var(--muted)] hover:text-[var(--text)] transition-colors"
              title="Copy Hash"
            >
              {copied ? <Check size={14} className="text-[var(--success)]" /> : <Copy size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
