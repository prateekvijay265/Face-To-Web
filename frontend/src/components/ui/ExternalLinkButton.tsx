import React from "react";
import { ExternalLink } from "lucide-react";

export function ExternalLinkButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs font-mono text-accent hover:text-accent-soft transition-colors"
    >
      {children}
      <ExternalLink className="w-3 h-3" />
    </a>
  );
}
