async function findScripts() {
  const res = await fetch('https://demo.1stake.app/providers/jacktop/games/blackjack');
  const html = await res.text();
  const list = [];
  const matches = html.matchAll(/<script[^>]*src=["']([^"']+)["']/g);
  for (const m of matches) {
    list.push(m[1]);
  }
  console.log('Script URLs:', list);

  // Download and search within the main JS bundle
  for (const s of list) {
    if (s.includes('app') || s.includes('game-providers')) {
      const fullUrl = s.startsWith('http') ? s : 'https://demo.1stake.app' + (s.startsWith('/') ? '' : '/') + s;
      console.log('Fetching JS bundle:', fullUrl);
      const jsRes = await fetch(fullUrl);
      const js = await jsRes.text();
      console.log('JS length:', js.length);

      // Search for game launch or iframe logic
      const iframeMatches = js.match(/.{0,80}iframe.{0,80}/gi);
      if (iframeMatches) {
        console.log('Found iframe occurrences in JS:', iframeMatches.slice(0, 5));
      }

      // Search for providers launch endpoint
      const launchMatches = js.match(/.{0,80}\/api\/providers\/.{0,80}/gi);
      if (launchMatches) {
        console.log('Found /api/providers occurrences in JS:', launchMatches.slice(0, 5));
      }
    }
  }
}
findScripts();
