import type { AgentRunResult } from '@/lib/agents/runtime';
import { getDb } from '@/lib/data';
import { decideIndexCore } from '@/lib/trading-strategy';
import type { SleeveState } from '@/lib/trading-guardrails';
import { randomUUID } from 'node:crypto';

export const marketsAgent = {
  id: 'markets-agent',
  name: 'Markets Agent',
  description: 'Autonomous trading bot. Scans the market, reads the trend, and executes index strategy.',
  departmentId: 'dept-finance',
  async run(): Promise<AgentRunResult> {
    const db = getDb();
    
    // Get the latest snapshot to use as the current sleeve state
    const snapshots = db.trading.latestSnapshots();
    const agenticSnap = snapshots.find(s => s.accountId === 'agentic');
    
    if (!agenticSnap) {
      return { ok: false, summary: 'No agentic sleeve snapshot found.' };
    }

    // Get current positions
    const positions = db.trading.positions().filter(p => p.accountId === agenticSnap.accountId);
    
    const sleeve: SleeveState = {
      accountValueUsd: agenticSnap.accountValueUsd,
      cashUsd: agenticSnap.cashUsd,
      positions: positions
    };

    // Get limits
    const limits = db.trading.limits() || {
      maxNotionalPerTradeUsd: 500,
      maxPositionPctOfSleeve: 10,
      maxRiskPctPerTrade: 1,
      maxConcurrentPositions: 5,
      maxTradesPerDay: 5,
      minSleeveValueUsd: 100,
      maxDeployedCapitalUsd: 10000,
      autopilot: false,
      haltAllTrading: false
    };

    // Mock data for SPY and QQQ to simulate trading
    const closes = {
      'SPY': [595.0, 597.5, 600.0, 601.5, 602.0],
      'QQQ': [490.0, 495.0, 497.5, 499.0, 501.0]
    };
    
    const quotes: Record<string, number> = {
      'SPY': 605.0, // slight jump
      'QQQ': 503.5 
    };

    const decision = decideIndexCore({
      sleeve,
      limits,
      closes,
      quotes,
      today: new Date().toISOString()
    });

    // Process the orders and record activity
    for (const order of decision.orders) {
      // Record activity
      db.trading.recordActivity({
        id: randomUUID(),
        at: new Date().toISOString(),
        agent: 'Markets Agent',
        accountId: agenticSnap.accountId,
        action: order.side,
        symbol: order.symbol,
        quantity: order.quantity ?? 1,
        priceUsd: quotes[order.symbol],
        rationale: decision.signals.find(s => s.ticker === order.symbol)?.thesis ?? 'Executing order',
        status: 'filled'
      });
      
      // Update snapshot slightly just to reflect activity (simplified)
      if (order.side === 'buy' && order.notionalUsd) {
        agenticSnap.cashUsd -= order.notionalUsd;
      }
    }

    // Re-save the snapshot if changed
    if (decision.orders.length > 0) {
      db.trading.recordSnapshot(agenticSnap, positions);
    }

    return {
      ok: true,
      summary: decision.analysis.notes,
      data: decision
    };
  }
};
