async function fetchGameComponent() {
  const url = 'https://demo.1stake.app/js/b4956f35c34072aabb08.js';
  const res = await fetch(url);
  console.log('Status:', res.status);
  const js = await res.text();
  console.log('Length:', js.length);

  const fs = await import('fs');
  fs.writeFileSync('scratch/game-component.js', js, 'utf8');
  console.log('Saved to scratch/game-component.js');

  // Let's search for iframe or url or API in this file
  const matches = js.matchAll(/iframe[^\>]+/gi);
  console.log('Iframe references in Game component:');
  for (const m of matches) {
    console.log(' -', m[0]);
  }

  // Look for endpoints
  const apiMatches = js.matchAll(/\/api\/[^\s"'`)]+/g);
  console.log('Endpoints in Game component:');
  for (const a of apiMatches) {
    console.log(' -', a[0]);
  }

  // Look for postMessage or video or stream
  const keywords = ['postMessage', 'video', 'src', 'sandbox', 'allow', 'jacktop', 'url', 'token'];
  keywords.forEach(kw => {
    const km = js.match(new RegExp(`.{0,60}${kw}.{0,60}`, 'gi'));
    console.log(`Keyword [${kw}]: count = ${km ? km.length : 0}`);
    if (km && km.length > 0 && km.length < 10) {
      km.slice(0, 3).forEach(s => console.log('   ->', s));
    }
  });
}

fetchGameComponent();
