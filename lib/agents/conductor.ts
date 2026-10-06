/**
 * Conductor routing. A message can name its target explicitly with a leading
 * `@<agentId|name>`; otherwise the model picks the best-fit agent from the
 * roster. Either way the Conductor delegates to that agent's chat (with its
 * tools) and returns `{ routedTo, ...chat }`. Routing never throws on a bad
 * `@name` — it falls back to model routing.
 */
import { chat as llmChat } from '@/lib/connectors/llm';
import { chatWithAgent, type ChatResult } from '@/lib/agents/chat';
import type { LEODb } from '@/lib/db';
import type { RuntimeAgent } from '@/lib/agents/runtime';

export type ConductorResult = ChatResult & { routedTo: string };

const AT_PREFIX = /^@(\S+)\s*/;

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function matchAgent(agents: RuntimeAgent[], token: string): RuntimeAgent | undefined {
  const t = slug(token);
  return agents.find((a) => a.id === token || a.id === t || slug(a.name) === t);
}

import { CONDUCTOR_ROUTER_PROMPT } from '@/lib/prompts/founder-prompts';

/** Ask the model for the single best-fit agent id; fall back to the first agent. */
async function pickAgent(routable: RuntimeAgent[], message: string): Promise<string> {
  const roster = routable.map((a) => `- ${a.id}: ${a.name} — ${a.description}`).join('\n');
  const system = `${CONDUCTOR_ROUTER_PROMPT}\n\nAVAILABLE AGENT ROSTER:\n${roster}`;
  const res = await llmChat({ system, messages: [{ role: 'user', content: message }] });
  const picked = (res.text.trim().split(/\s+/)[0] ?? '').replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
  const found = routable.find((a) => a.id.toLowerCase() === picked);
  return (found ?? routable[0]).id;
}

export async function routeConductorMessage(
  db: LEODb,
  agents: RuntimeAgent[],
  message: string,
  opts: { screenContext?: string } = {},
): Promise<ConductorResult> {
  const routable = agents.filter((a) => a.id !== 'conductor');
  let targetId: string | undefined;
  let delivered = message;

  const at = message.match(AT_PREFIX);
  if (at) {
    const explicit = matchAgent(routable, at[1]);
    if (explicit) {
      targetId = explicit.id;
      delivered = message.replace(AT_PREFIX, '').trim() || message;
    }
    // unknown @name → fall through to model routing (never throw)
  }

  if (!targetId) targetId = await pickAgent(routable, message);

  const result = await chatWithAgent(db, agents, targetId, delivered, opts);
  return { routedTo: targetId, ...result };
}
