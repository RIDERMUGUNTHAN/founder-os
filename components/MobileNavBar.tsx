'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  MessageSquare,
  Bot,
  Menu,
  Plus,
  X,
  TrendingUp,
  DollarSign,
  Share2,
  Workflow,
  Network,
  Cpu,
  Sliders,
  QrCode,
} from 'lucide-react';
import { MobileCaptureModal } from './MobileCaptureModal';
import { DesktopServerInfoModal } from './DesktopServerInfoModal';

export function MobileNavBar() {
  const pathname = usePathname();
  const [isCaptureOpen, setIsCaptureOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);

  const navItems = [
    { label: 'Console', href: '/', icon: Home },
    { label: 'Comms', href: '/comms', icon: MessageSquare },
    { label: 'Agents', href: '/agents', icon: Bot },
  ];

  return (
    <>
      {/* Pinned Bottom Navigation Bar for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-os-border bg-[#09090b]/95 backdrop-blur-lg px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2">
        <div className="flex items-center justify-around">
          {/* Console */}
          <Link
            href="/"
            className={`flex flex-col items-center gap-1 p-1 text-[10px] font-mono ${
              pathname === '/' ? 'text-emerald-400 font-bold' : 'text-os-muted'
            }`}
          >
            <Home className="h-4 w-4" />
            <span>Console</span>
          </Link>

          {/* Comms */}
          <Link
            href="/comms"
            className={`flex flex-col items-center gap-1 p-1 text-[10px] font-mono ${
              pathname.startsWith('/comms') ? 'text-emerald-400 font-bold' : 'text-os-muted'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Comms</span>
          </Link>

          {/* Center Quick Capture Button */}
          <button
            onClick={() => setIsCaptureOpen(true)}
            className="flex h-11 w-11 -mt-4 items-center justify-center rounded-full bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform"
            aria-label="Quick Capture"
          >
            <Plus className="h-6 w-6 stroke-[2.5]" />
          </button>

          {/* Agents */}
          <Link
            href="/agents"
            className={`flex flex-col items-center gap-1 p-1 text-[10px] font-mono ${
              pathname.startsWith('/agents') ? 'text-emerald-400 font-bold' : 'text-os-muted'
            }`}
          >
            <Bot className="h-4 w-4" />
            <span>Agents</span>
          </Link>

          {/* Menu Drawer Toggle */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className={`flex flex-col items-center gap-1 p-1 text-[10px] font-mono ${
              isMenuOpen ? 'text-emerald-400 font-bold' : 'text-os-muted'
            }`}
          >
            <Menu className="h-4 w-4" />
            <span>More</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col bg-[#09090b]/98 backdrop-blur-xl animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-os-border px-5 py-4 pt-[max(env(safe-area-inset-top),16px)]">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="font-mono text-xs font-bold tracking-widest uppercase">
                FOUNDER OS NAVIGATION
              </span>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="rounded-lg p-1.5 text-os-muted hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
            <div>
              <div className="font-mono text-[10px] tracking-wider text-os-dim uppercase mb-2">
                Operations
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/tasks"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl border border-os-border bg-os-surface p-3 text-xs font-medium text-os-text"
                >
                  <Cpu className="h-4 w-4 text-emerald-400" />
                  <span>Tasks Board</span>
                </Link>
                <Link
                  href="/finances"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl border border-os-border bg-os-surface p-3 text-xs font-medium text-os-text"
                >
                  <DollarSign className="h-4 w-4 text-emerald-400" />
                  <span>Finances</span>
                </Link>
                <Link
                  href="/funnel"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl border border-os-border bg-os-surface p-3 text-xs font-medium text-os-text"
                >
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  <span>Client Funnel</span>
                </Link>
                <Link
                  href="/social"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl border border-os-border bg-os-surface p-3 text-xs font-medium text-os-text"
                >
                  <Share2 className="h-4 w-4 text-emerald-400" />
                  <span>Social Growth</span>
                </Link>
              </div>
            </div>

            <div>
              <div className="font-mono text-[10px] tracking-wider text-os-dim uppercase mb-2">
                Intelligence & Infrastructure
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/brain"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl border border-os-border bg-os-surface p-3 text-xs font-medium text-os-text"
                >
                  <Network className="h-4 w-4 text-purple-400" />
                  <span>Brain Graph</span>
                </Link>
                <Link
                  href="/workflows"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl border border-os-border bg-os-border bg-os-surface p-3 text-xs font-medium text-os-text"
                >
                  <Workflow className="h-4 w-4 text-purple-400" />
                  <span>Workflows</span>
                </Link>
                <Link
                  href="/integrations"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl border border-os-border bg-os-surface p-3 text-xs font-medium text-os-text"
                >
                  <Sliders className="h-4 w-4 text-purple-400" />
                  <span>Integrations</span>
                </Link>
                <Link
                  href="/trading"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl border border-os-border bg-os-surface p-3 text-xs font-medium text-os-text"
                >
                  <TrendingUp className="h-4 w-4 text-purple-400" />
                  <span>Trading Monitor</span>
                </Link>
              </div>
            </div>

            {/* Companion / Server Link */}
            <div className="pt-2">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsServerModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-os-border bg-white/5 py-3 font-mono text-xs font-semibold text-os-text hover:bg-white/10"
              >
                <QrCode className="h-4 w-4 text-emerald-400" />
                <span>Pair with Windows Desktop</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Capture Modal */}
      <MobileCaptureModal
        isOpen={isCaptureOpen}
        onClose={() => setIsCaptureOpen(false)}
      />

      {/* Desktop Link / Pairing Modal */}
      <DesktopServerInfoModal
        isOpen={isServerModalOpen}
        onClose={() => setIsServerModalOpen(false)}
      />
    </>
  );
}
