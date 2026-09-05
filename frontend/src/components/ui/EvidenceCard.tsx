import React from "react";
import { FileText, Image as ImageIcon } from "lucide-react";

export function EvidenceCard({ data }: { data: any }) {
  if (!data) return null;

  const isImage = data.content_type?.startsWith("image/");
  const Icon = isImage ? ImageIcon : FileText;

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-xl flex flex-col gap-6">
      <div className="flex justify-between items-center border-b border-[var(--border)] pb-2">
        <h3 className="font-mono text-sm text-[var(--muted)] tracking-widest uppercase">Discovered Content</h3>
        <div className="px-2 py-1 bg-[var(--surface-2)] border border-[var(--border)] rounded text-[10px] font-mono text-[var(--muted)]">
          {data.provider || "UNKNOWN SOURCE"}
        </div>
      </div>

      <div className="flex items-start gap-4">
        <div className="p-3 bg-[var(--surface-2)] rounded border border-[var(--border)] text-[var(--accent)] shrink-0">
          <Icon size={24} />
        </div>
        
        <div className="flex flex-col min-w-0 flex-1">
           <h4 className="font-bold text-sm truncate">{data.title || "Untitled Document"}</h4>
           <a href={data.source_url} target="_blank" rel="noreferrer" className="text-xs text-[var(--info)] hover:underline truncate mt-1">
             {data.source_url}
           </a>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[var(--muted)] uppercase opacity-70">Content Type</span>
          <span className="font-mono truncate">{data.content_type || "text/html"}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[var(--muted)] uppercase opacity-70">Retrieved</span>
          <span className="font-mono truncate">{new Date(data.retrieved_at).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
