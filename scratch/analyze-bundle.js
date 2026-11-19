async function analyze() {
  const res = await fetch('https://demo.1stake.app/js/app.js?8a0c4faa9771445189035ca844487507');
  const js = await res.text();

  // Search for routes matching providers/:provider/games/:id
  const routeRegex = /path:\s*["'][^"']*providers[^"']*["']/gi;
  const matches = js.match(routeRegex);
  console.log('Provider routes found:', matches);

  // Search for 'game-providers' components
  const provMatches = js.match(/.{0,100}providers\/\{provider\}\/games\/\{id\}.{0,100}/g);
  console.log('Endpoint occurrences:', provMatches);

  // Let's search for how the game URL is fetched
  const getUrlMatches = js.match(/.{0,120}\/api\/providers\/\$\{[^}]+\}\/games\/\$\{[^}]+\}.{0,120}/g);
  console.log('API call matches:', getUrlMatches);

  // Search for JackTop specific logic or BetGames / TVBET / Pragmatic / Evolution stream URLs
  const keywords = ['jacktop', 'betgames', 'tvbet', 'creedroomz', 'superlotto', 'hls', 'm3u8', 'webrtc', 'stream', 'video'];
  keywords.forEach(kw => {
    const kwMatches = js.match(new RegExp(`.{0,50}${kw}.{0,50}`, 'gi'));
    console.log(`Keyword [${kw}]: count = ${kwMatches ? kwMatches.length : 0}`);
    if (kwMatches && kwMatches.length > 0 && kwMatches.length < 10) {
      console.log(`  Samples:`, kwMatches.slice(0, 3));
    }
  });
}
analyze();
