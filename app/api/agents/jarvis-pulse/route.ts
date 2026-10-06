import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/agents/jarvis-pulse
 *
 * Returns live system metrics without touching any connector or LLM.
 * Consumed by the JarvisAlerts HUD every 30 seconds.
 */
export async function GET() {
  const os = await import("os");
  const freeMem = Math.round(os.freemem() / 1024 / 1024);
  const totalMem = Math.round(os.totalmem() / 1024 / 1024);
  const load = parseFloat(os.loadavg()[0].toFixed(2));
  const uptime = Math.round(os.uptime());
  const platform = os.platform();

  return NextResponse.json({ freeMem, totalMem, load, uptime, platform });
}
