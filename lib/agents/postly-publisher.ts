import type { AgentRunResult } from "@/lib/agents/runtime";
import { getDb } from "@/lib/data";

/**
 * Rider''s brand persona for content generation.
 * Used by the postly-publisher and dmflow-mcp agents.
 */
export const RIDER_PERSONA = {
  name: "Rider Mugunth Kumar",
  handles: {
    instagram: "@RiderMugu",
    x: "@RiderMugunthan",
    youtube: "@RiderMugunthKumar",
    facebook: "@RiderMugunthKumar",
  },
  niche: "Motorcycles, riding lifestyle, tech, and entrepreneurship",
  tone: "Energetic, authentic, community-driven, inspiring",
  hashtags: {
    core: ["#RiderMugu", "#RiderLife", "#BikerCommunity", "#MotoLife"],
    engagement: ["#Explore", "#RideOrDie", "#TwoWheels", "#MotorcycleLife"],
    tech: ["#TechFounder", "#FounderLife", "#BuildInPublic"],
  },
  contentPillars: [
    "Riding adventures and routes",
    "Motorcycle tips and reviews",
    "Founder journey and entrepreneurship",
    "Tech and AI insights",
    "Community and lifestyle",
  ],
};

/**
 * Generates a content idea for Rider''s social media.
 * Uses the brand persona to create on-brand post ideas
 * without requiring an external LLM when local is unavailable.
 */
export function generateContentIdea(pillarIndex?: number): {
  caption: string;
  hashtags: string;
  platform: string;
  pillar: string;
} {
  const p = RIDER_PERSONA;
  const pillar = p.contentPillars[pillarIndex ?? Math.floor(Math.random() * p.contentPillars.length)];
  const coreHashtags = p.hashtags.core.slice(0, 2).join(" ");
  const engHashtags = p.hashtags.engagement.slice(0, 2).join(" ");
  const hashtags = `${coreHashtags} ${engHashtags}`;

  const templates: Record<string, string[]> = {
    "Riding adventures and routes": [
      "Every road has a story. Which route changed yours? Drop it below 👇🏍️",
      "Not all those who wander are lost — some are just finding the best roads. 🛣️",
      "The best views come after the hardest turns. Keep riding. 🏔️",
    ],
    "Motorcycle tips and reviews": [
      "Pro tip: your bike talks to you. Are you listening? 🔧 Share your best riding hack below.",
      "3 things I wish I knew before my first long ride. Save this post! 📌",
      "Gear up or gear down — what''s your pre-ride ritual? 🪖",
    ],
    "Founder journey and entrepreneurship": [
      "Building LEO — my AI personal OS — because no founder should manage chaos alone. What are you building? 🤖",
      "Failure is just data. Collect enough and you''ll find the pattern. Keep going. 💡",
      "The best investment I made this year wasn''t in markets. It was in systems. 🧠",
    ],
    "Tech and AI insights": [
      "AI isn''t replacing founders. It''s replacing founders who don''t use AI. Are you using it? 🤖",
      "The gap between what AI can do and what most people use it for is enormous. Which side are you on?",
      "Hot take: your second brain matters more than your first. Build your knowledge system. 🧠",
    ],
    "Community and lifestyle": [
      "To every rider reading this — you''re not alone on this road. Tag a rider who''s always down to roll. 🏍️❤️",
      "Community > competition. Always. Who in your community deserves a shoutout today?",
      "This is your sign to stop overthinking and start moving. Ride. Build. Repeat. 🚀",
    ],
  };

  const pillarTemplates = templates[pillar] ?? templates["Community and lifestyle"];
  const caption = pillarTemplates[Math.floor(Math.random() * pillarTemplates.length)];

  return { caption, hashtags, platform: "instagram,x,facebook", pillar };
}

/**
 * The postly-publisher agent run function.
 * Checks the queue, optionally generates a post idea, and reports status.
 */
export async function postlyPublisherRun(): Promise<AgentRunResult> {
  const db = getDb();
  const queued = db.socialPosts.queued();
  const hasZernio = !!process.env.ZERNIO_API_KEY;

  // Generate a content idea to keep the queue stocked
  const idea = generateContentIdea();

  const status = hasZernio
    ? `Postly LIVE · ${queued.length} post${queued.length === 1 ? "" : "s"} in queue`
    : `Postly not connected (set ZERNIO_API_KEY) · ${queued.length} drafts staged`;

  return {
    ok: queued.length > 0 || hasZernio,
    summary: `${status} · Today''s content idea: "${idea.caption.slice(0, 80)}…" [${idea.pillar}]`,
    data: { queued: queued.length, hasZernio, latestIdea: idea },
  };
}
