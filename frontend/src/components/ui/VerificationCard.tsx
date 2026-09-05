import React from "react";
import { ShieldCheck, ShieldAlert, Loader2, RefreshCw, ExternalLink, Copy, Check } from "lucide-react";

type VerificationStatus = "VERIFIED" | "TAMPERED" | "UNAVAILABLE" | "PROCESSING" | "IDLE";

function HashRow({ label, value }: { label: string; value?: string }) {
  const [copied, setCopied] = React.useState(false);
  const copy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="flex flex-col gap-1">
      <span className="mono" style={{ fontSize: 8, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</span>
      <div className="flex items-center gap-2">
        <span className="mono flex-1 truncate" style={{ fontSize: 9, color: "var(--text-2)" }}>
          {value || "N/A"}
        </span>
        {value && (
          <button onClick={copy} style={{ background: "none", border: "none", cursor: "pointer", color: copied ? "var(--success)" : "var(--muted)", flexShrink: 0 }}>
            {copied ? <Check size={10} /> : <Copy size={10} />}
          </button>
        )}
      </div>
    </div>
  );
}

export function VerificationCard({
  status, localHash, onChainHash, blockchain, onVerifyAgain, isVerifying
}: {
  status: VerificationStatus | string;
  localHash?: string;
  onChainHash?: string;
  blockchain?: any;
  onVerifyAgain?: () => void;
  isVerifying?: boolean;
}) {
  const normalizedStatus = status === "HASH_MISMATCH" ? "TAMPERED" : status;
  const isVerified = normalizedStatus === "VERIFIED";
  const isTampered = normalizedStatus === "TAMPERED";
  const isProcessing = normalizedStatus === "PROCESSING" || isVerifying;

  const isMatch = isVerified;

  return (
    <div className="card p-4 flex flex-col gap-4">
      <div className="section-header">Evidence Verification</div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left: Status */}
        <div className="card-inner p-4 flex flex-col items-center justify-center gap-3 text-center" style={{ minHeight: 160 }}>
          {isProcessing ? (
            <>
              <Loader2 size={36} className="animate-spin" style={{ color: "var(--accent)" }} />
              <span className="mono text-xs" style={{ color: "var(--text-2)", letterSpacing: "0.1em" }}>VERIFYING...</span>
            </>
          ) : isVerified ? (
            <>
              <div className="glow-success rounded-full p-3" style={{ background: "var(--success-glow)" }}>
                <ShieldCheck size={36} style={{ color: "var(--success)" }} />
              </div>
              <div>
                <div className="font-bold text-xl" style={{ color: "var(--success)" }}>VERIFIED</div>
                <div className="mono" style={{ fontSize: 9, color: "var(--text-2)", marginTop: 4 }}>
                  Evidence fingerprint matches the blockchain record.
                </div>
              </div>
            </>
          ) : isTampered ? (
            <>
              <div className="rounded-full p-3" style={{ background: "rgba(255,59,92,0.15)" }}>
                <ShieldAlert size={36} style={{ color: "var(--danger)" }} />
              </div>
              <div>
                <div className="font-bold text-xl" style={{ color: "var(--danger)" }}>TAMPERED</div>
                <div className="mono" style={{ fontSize: 9, color: "var(--text-2)", marginTop: 4 }}>Hash mismatch detected.</div>
              </div>
            </>
          ) : (
            <>
              <ShieldCheck size={36} style={{ color: "var(--muted)" }} />
              <span className="mono text-xs" style={{ color: "var(--muted)" }}>UNAVAILABLE</span>
            </>
          )}

          {onVerifyAgain && !isProcessing && (
            <button className="btn-ghost" onClick={onVerifyAgain} style={{ fontSize: 10 }}>
              <RefreshCw size={11} /> Verify again
            </button>
          )}
        </div>

        {/* Middle: Fingerprint */}
        <div className="card-inner p-4 flex flex-col gap-3">
          <div className="mono" style={{ fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Fingerprint (SHA-256)
          </div>

          <HashRow label="Current fingerprint" value={localHash} />

          <div className="flex items-center gap-2 py-1">
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span className="mono" style={{ fontSize: 8, color: isMatch ? "var(--success)" : isTampered ? "var(--danger)" : "var(--muted)" }}>
              {isMatch ? "= EXACT MATCH" : isTampered ? "≠ MISMATCH" : "="}
            </span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          <HashRow label="On-chain fingerprint" value={onChainHash} />

          {isVerified && (
            <div className="flex flex-col gap-1 pt-1" style={{ borderTop: "1px solid var(--border)" }}>
              <span className="mono" style={{ fontSize: 8, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Match Status</span>
              <span className="mono font-bold text-xs" style={{ color: "var(--success)" }}>Exact match</span>
            </div>
          )}
        </div>

        {/* Right: Blockchain Record */}
        <div className="card-inner p-4 flex flex-col gap-2.5">
          <div className="mono" style={{ fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Blockchain Record
          </div>

          {[
            { label: "Network", value: blockchain?.network || "Sepolia" },
            { label: "Chain ID", value: blockchain?.chain_id || "11155111" },
            { label: "Contract Address", value: blockchain?.contract_address },
            { label: "Transaction Hash", value: blockchain?.transaction_hash },
            { label: "Block Status", value: blockchain?.block_status || "Confirmed" },
            { label: "Block Number", value: blockchain?.block_number },
            { label: "Timestamp", value: blockchain?.timestamp },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-start gap-2">
              <span className="mono shrink-0" style={{ fontSize: 8, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
              <span className="mono text-right" style={{ fontSize: 8, color: "var(--text-2)", wordBreak: "break-all", maxWidth: "60%" }}>
                {value || "N/A"}
              </span>
            </div>
          ))}

          {blockchain?.transaction_hash && (
            <a
              href={`https://sepolia.etherscan.io/tx/${blockchain.transaction_hash}`}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost mt-1"
              style={{ fontSize: 9, justifyContent: "center" }}
            >
              <ExternalLink size={10} /> View on Etherscan
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
