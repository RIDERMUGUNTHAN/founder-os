'use client';

import { useState, useEffect } from 'react';
import { X, Copy, Check, Laptop, Smartphone, Wifi } from 'lucide-react';

interface DesktopServerInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DesktopServerInfoModal({ isOpen, onClose }: DesktopServerInfoModalProps) {
  const [copied, setCopied] = useState(false);
  const [localUrl, setLocalUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      const port = window.location.port || '4100';
      setLocalUrl(`http://${host}:${port}`);
    }
  }, []);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(localUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-os-border bg-[#0d0d11] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-os-border pb-3">
          <div className="flex items-center gap-2">
            <Wifi className="h-4 w-4 text-emerald-400" />
            <h3 className="font-mono text-sm font-semibold tracking-wider text-os-text uppercase">
              Mobile Companion Pair
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-os-muted hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-center gap-6 py-3">
            <div className="flex flex-col items-center gap-1.5 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-os-border bg-black/60 text-emerald-400">
                <Laptop className="h-6 w-6" />
              </div>
              <span className="font-mono text-[10px] text-os-dim uppercase">Windows App</span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-xs font-mono text-emerald-400">SYNC</span>
              <div className="h-0.5 w-12 bg-gradient-to-r from-emerald-500/80 to-purple-500/80 my-1" />
            </div>

            <div className="flex flex-col items-center gap-1.5 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-os-border bg-black/60 text-purple-400">
                <Smartphone className="h-6 w-6" />
              </div>
              <span className="font-mono text-[10px] text-os-dim uppercase">Mobile Companion</span>
            </div>
          </div>

          <div className="rounded-xl border border-os-border bg-black/80 p-3.5 space-y-2">
            <div className="font-mono text-[11px] text-os-dim uppercase tracking-wider">
              Pairing Connection URL
            </div>
            <div className="flex items-center justify-between gap-2">
              <code className="font-mono text-xs text-emerald-400 truncate">
                {localUrl}
              </code>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 rounded-lg border border-os-border bg-os-surface px-2.5 py-1 font-mono text-xs text-os-text hover:bg-white/10 transition-colors shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="text-xs text-os-muted space-y-1.5 leading-relaxed font-mono">
            <div>1. Ensure your phone is on the same local Wi-Fi / VPN as this PC.</div>
            <div>2. Open FounderOS Mobile on Android or iOS.</div>
            <div>3. In Companion Mode, enter the URL above to connect.</div>
          </div>

          <button
            onClick={onClose}
            className="w-full rounded-xl bg-white/10 py-2.5 font-mono text-xs font-semibold text-os-text hover:bg-white/15 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
