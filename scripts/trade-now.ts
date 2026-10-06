import { marketsAgent } from '../lib/agents/markets-agent';

async function main() {
  console.log('Running markets agent...');
  const result = await marketsAgent.run();
  console.log('Result:', result.summary);
}

main().catch(console.error);
