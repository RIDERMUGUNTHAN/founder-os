import { getDb } from '../lib/data';
import { randomUUID } from 'crypto';

const db = getDb();

const posts = [
  {
    id: randomUUID(),
    caption: '🚀 Just deployed LEO to run my entire backend. Fully autonomous, handles my DMs, schedules my calendar, and auto-generates content. The AI revolution isn’t coming, it’s already here. \n\nWhat are you still doing manually? 👇',
    mediaUrl: null,
    platforms: ['twitter', 'linkedin'] as any,
    status: 'queued' as const,
    scheduledFor: new Date(Date.now() + 3600000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: randomUUID(),
    caption: 'AD CREATIVE CONCEPT (App Promo):\n\n[Visual: Fast-paced montage of a chaotic inbox turning into a clean, zero-unread dashboard with LEO sorting everything]\n\n"Tired of drowning in DMs and tasks? Meet LEO. Your autonomous AI agent that lives on your devices and handles the busywork so you can focus on building."\n\nDownload now and get your time back. ⏱️',
    mediaUrl: null,
    platforms: ['instagram', 'tiktok', 'twitter'] as any,
    status: 'queued' as const,
    scheduledFor: new Date(Date.now() + 7200000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: randomUUID(),
    caption: 'If you are still managing your social media queue manually in 2026, you are wasting 10 hours a week.\n\nLEO drafts my content, optimizes the hooks, and queues it up across 5 platforms while I sleep. Work smarter. 🧠',
    mediaUrl: null,
    platforms: ['youtube', 'twitter'] as any,
    status: 'queued' as const,
    scheduledFor: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date().toISOString(),
  }
];

for (const p of posts) {
  db.socialPosts.enqueue(p);
}
console.log('Successfully injected 3 high-converting drafts and ad concepts into LEO queue!');
