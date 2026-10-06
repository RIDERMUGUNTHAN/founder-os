import { NextResponse } from "next/server";
import { getDb } from "@/lib/data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/agents/social-notifications
 *
 * Returns a unified feed of pending DMs, comments, new followers
 * across all configured social platforms. Used by the Jarvis HUD
 * and the social page to surface real-time social activity.
 *
 * In production, these would be fetched from platform APIs
 * (Instagram Graph API, ManyChat webhook queue, etc.).
 * Right now returns from the LEO DB + environment signal.
 */
export async function GET() {
  const db = getDb();
  const posts = db.socialPosts.queued();

  // Check for any configured social connectors
  const hasManyChat = !!process.env.MANYCHAT_API_KEY;
  const hasZernio = !!process.env.ZERNIO_API_KEY;
  const hasInstagram = !!process.env.INSTAGRAM_ACCESS_TOKEN;

  const notifications = [];

  if (posts.length > 0) {
    notifications.push({
      id: "queued-posts",
      type: "content",
      platform: "all",
      message: `${posts.length} post${posts.length === 1 ? "" : "s"} ready to publish`,
      priority: "normal",
      ts: new Date().toISOString(),
    });
  }

  if (!hasManyChat) {
    notifications.push({
      id: "dm-setup",
      type: "setup",
      platform: "instagram",
      message: "Connect ManyChat to enable auto-DM replies (set MANYCHAT_API_KEY)",
      priority: "info",
      ts: new Date().toISOString(),
    });
  }

  return NextResponse.json({
    notifications,
    connected: { manychat: hasManyChat, zernio: hasZernio, instagram: hasInstagram },
    queuedPosts: posts.length,
  });
}
