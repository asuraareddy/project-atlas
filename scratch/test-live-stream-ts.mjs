import { fetchLiveDealerStreamUrl } from '../src/domain/games/casino/live-stream.ts';

async function test() {
  console.log('Testing fetchLiveDealerStreamUrl for blackjack...');
  const url = await fetchLiveDealerStreamUrl('blackjack');
  console.log('Stream URL obtained:', url);
  if (!url.startsWith('https://')) {
    throw new Error('Invalid URL returned');
  }
  console.log('✓ SUCCESS: Valid live dealer stream URL retrieved!');
}

test();
