"use client";
import React, { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";

type BlockchainProps = {
  network: string;
  chainId: string;
  contract: string;
  transaction: string;
  block: string;
  status: "CONFIRMED" | "PENDING" | "FAILED";
};

const BlockHashDisplay = ({ label, hash, isTx, isSepolia }: { label: string, hash: string, isTx?: boolean, isSepolia?: boolean }) => {
  const [copied, setCopied] = useState(false);
  
  const onCopy = () => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between">
        <span className="text-[10px] font-mono text-[var(--muted)] uppercase opacity-70">{label}</span>
        {isTx && isSepolia && hash !== "N/A (Already Registered)" && (
          <a href={`https://sepolia.etherscan.io/tx/${hash}`} target="_blank" rel="noreferrer" className="text-[10px] font-mono text-[var(--info)] hover:underline flex items-center gap-1">
            Explorer <ExternalLink size={10} />
          </a>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs truncate bg-[var(--surface-2)] px-2 py-1.5 rounded border border-[var(--border)] flex-1">{hash}</span>
        <button onClick={onCopy} className="p-1.5 border border-[var(--border)] rounded hover:bg-[var(--surface-2)] transition-colors text-[var(--muted)] hover:text-[var(--text)] shrink-0">
          {copied ? <Check size={14} className="text-[var(--success)]"/> : <Copy size={14}/>}
        </button>
      </div>
    </div>
  );
};

export function BlockchainCard({ data }: { data: BlockchainProps }) {
  const isSepolia = data.chainId === "11155111" || data.network.toLowerCase().includes("sepolia");
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-xl flex flex-col gap-6 bg-gradient-to-br from-[var(--surface)] to-[var(--surface-2)]">
      <div className="flex justify-between items-center border-b border-[var(--border)] pb-2">
        <h3 className="font-mono text-sm text-[var(--muted)] tracking-widest uppercase">Blockchain Record</h3>
        <div className={`px-2 py-1 rounded text-[10px] font-mono font-bold tracking-wider uppercase
           ${data.status === 'CONFIRMED' ? 'bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/30' : 
             data.status === 'PENDING' ? 'bg-[var(--warning)]/10 text-[var(--warning)] border border-[var(--warning)]/30' : 
             'bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/30'}
        `}>
          {data.status}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-mono text-[var(--muted)] uppercase opacity-70">Network</span>
          <span className="text-xs font-mono uppercase truncate">{data.network}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-mono text-[var(--muted)] uppercase opacity-70">Chain ID</span>
          <span className="text-xs font-mono truncate">{data.chainId}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-mono text-[var(--muted)] uppercase opacity-70">Block</span>
          <span className="text-xs font-mono truncate">{data.block}</span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <BlockHashDisplay label="Contract Address" hash={data.contract} />
        <BlockHashDisplay label="Transaction Hash" hash={data.transaction} isTx={true} isSepolia={isSepolia} />
      </div>
    </div>
  );
}
