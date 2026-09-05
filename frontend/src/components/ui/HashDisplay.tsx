"use client";
import React, { useState } from "react";
import { CopyButton } from "./CopyButton";
import { ChevronDown, ChevronRight } from "lucide-react";

export function HashDisplay({ hash, label }: { hash: string; label?: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = hash.length > 20;
  
  const displayHash = expanded || !isLong 
    ? hash 
    : `${hash.slice(0, 10)}...${hash.slice(-8)}`;

  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-xs text-muted font-mono uppercase">{label}</span>}
      <div className="flex items-center gap-2 bg-surface-2 px-3 py-2 rounded border border-border">
        <span className="font-mono text-sm text-text break-all">{displayHash}</span>
        <div className="flex gap-1 ml-auto shrink-0">
          <CopyButton text={hash} />
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 hover:bg-surface-2 rounded text-muted hover:text-text transition-colors"
            >
              {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
