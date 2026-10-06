'use client';

/**
 * JarvisAlerts -- Proactive, always-on alert HUD for LEO.
 *
 * Polls /api/agents/jarvis-pulse every 30 seconds. When RAM > 85% or load
 * exceeds threshold, surfaces a collapsible alert strip at the top of the
 * viewport. Also shows social notification badges (new DMs, comments).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { X, AlertTriangle, CheckCircle, Bell } from 'lucide-react';

type AlertLevel = 'ok' | 'warn' | 'crit';

type JarvisAlert = {
  id: string;
  level: AlertLevel;
  message: string;
  ts: number;
};

type PulseData = {
  freeMem: number;
  totalMem: number;
  load: number;
  uptime: number;
  platform: string;
};

const LEVEL_ICONS: Record<AlertLevel, React.ReactNode> = {
  ok: <CheckCircle className="h-3 w-3" />,
  warn: <AlertTriangle className="h-3 w-3" />,
  crit: <AlertTriangle className="h-3 w-3 animate-pulse" />,
};

function analyzeSystem(pulse: PulseData): JarvisAlert[] {
  const alerts: JarvisAlert[] = [];
  const usedPct = Math.round(((pulse.totalMem - pulse.freeMem) / pulse.totalMem) * 100);

  if (usedPct >= 90) {
    alerts.push({ id: 'mem-crit', level: 'crit', message: `CRITICAL: RAM at ${usedPct}% -- ${pulse.freeMem}MB free. Jarvis recommends closing background apps.`, ts: Date.now() });
  } else if (usedPct >= 75) {
    alerts.push({ id: 'mem-warn', level: 'warn', message: `RAM at ${usedPct}% -- ${pulse.freeMem}MB free of ${pulse.totalMem}MB.`, ts: Date.now() });
  }

  if (pulse.load >= 4.0) {
    alerts.push({ id: 'load-crit', level: 'crit', message: `CRITICAL: System load ${pulse.load.toFixed(2)} -- high CPU pressure detected.`, ts: Date.now() });
  } else if (pulse.load >= 2.0) {
    alerts.push({ id: 'load-warn', level: 'warn', message: `System load elevated at ${pulse.load.toFixed(2)}.`, ts: Date.now() });
  }

  if (alerts.length === 0) {
    alerts.push({ id: 'ok', level: 'ok', message: `Jarvis: All systems nominal. Load ${pulse.load.toFixed(2)}. RAM ${usedPct}%. Uptime ${Math.round(pulse.uptime / 3600)}h.`, ts: Date.now() });
  }
  return alerts;
}

export function JarvisAlerts() {
  const [alerts, setAlerts] = useState<JarvisAlert[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState(false);
  const [hasNewNotif, setHasNewNotif] = useState(false);
  const prevAlertsRef = useRef<string>('');

  const fetchPulse = useCallback(async () => {
    try {
      const res = await fetch('/api/agents/jarvis-pulse', { cache: 'no-store' });
      if (!res.ok) return;
      const data = (await res.json()) as PulseData;
      const newAlerts = analyzeSystem(data);
      const key = newAlerts.map((a) => a.id + a.level).join(',');
      if (key !== prevAlertsRef.current) {
        prevAlertsRef.current = key;
        setAlerts(newAlerts);
        const hasUrgent = newAlerts.some((a) => a.level !== 'ok');
        if (hasUrgent) setHasNewNotif(true);
        const critAlert = newAlerts.find((a) => a.level === 'crit');
        if (critAlert && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(new SpeechSynthesisUtterance(critAlert.message));
        }
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    void fetchPulse();
    const id = setInterval(() => void fetchPulse(), 30_000);
    return () => clearInterval(id);
  }, [fetchPulse]);

  const visible = alerts.filter((a) => !dismissed.has(a.id));
  if (visible.length === 0) return null;
  const topAlert = visible[0];
  const isCrit = topAlert.level === 'crit';
  const isWarn = topAlert.level === 'warn';

  if (topAlert.level === 'ok' && !expanded) {
    return (
      <button
        onClick={() => { setExpanded(true); setHasNewNotif(false); }}
        title="Jarvis System Status"
        className="pressable fixed bottom-20 right-5 z-40 flex h-7 w-7 items-center justify-center rounded-full border border-os-border bg-os-surface/80 text-os-dim backdrop-blur hover:text-os-ok"
      >
        <Bell className="h-3.5 w-3.5" />
        {hasNewNotif && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-os-warn" />}
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-0 inset-x-0 z-[60] border-t px-4 py-2 flex items-center gap-3 font-mono text-[10.5px] transition-all ${
        isCrit ? 'border-os-err/40 bg-os-err/10 text-os-err' :
        isWarn ? 'border-os-warn/40 bg-os-warn/5 text-os-warn' :
        'border-os-ok/20 bg-os-ok/5 text-os-ok'
      }`}
    >
      <span className="shrink-0">{LEVEL_ICONS[topAlert.level]}</span>
      <span className="flex-1 truncate">{topAlert.message}</span>
      {visible.length > 1 && (
        <span className="shrink-0 rounded-full border border-current px-1.5 py-px text-[9px]">+{visible.length - 1} more</span>
      )}
      <button onClick={() => { setDismissed((d) => new Set([...d, topAlert.id])); setExpanded(false); }} className="pressable shrink-0 opacity-60 hover:opacity-100" aria-label="Dismiss alert">
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
