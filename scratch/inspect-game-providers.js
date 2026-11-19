async function fetchGameProvidersBundle() {
  const url = 'https://demo.1stake.app/js/packages/game-providers-games-index-4df0ff6abf273e7cd96c.js';
  const res = await fetch(url);
  console.log('Status:', res.status);
  const js = await res.text();
  console.log('Length:', js.length);

  // Write it to scratch/game-providers-bundle.js so we can inspect it completely
  const fs = await import('fs');
  fs.writeFileSync('scratch/game-providers-bundle.js', js, 'utf8');
  console.log('Saved to scratch/game-providers-bundle.js');

  // Let's search for iframe, video, stream, jacktop, api in this bundle
  const endpoints = js.matchAll(/\/api\/[^\s"'`)]+/g);
  console.log('Endpoints:');
  for (const e of endpoints) {
    console.log(' -', e[0]);
  }

  // Look for iframe rendering
  const iframeMatch = js.match(/.{0,100}iframe.{0,100}/gi);
  if (iframeMatch) {
    console.log('Iframe snippets:');
    iframeMatch.slice(0, 5).forEach(m => console.log(' ->', m));
  }
}
fetchGameProvidersBundle();
