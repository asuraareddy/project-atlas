async function fetchChunk3102() {
  const url = 'https://demo.1stake.app/js/3102.js';
  const res = await fetch(url);
  console.log('Status for 3102.js:', res.status);
  const js = await res.text();
  console.log('3102.js length:', js.length);

  // Look for iframe or API calls in 3102.js
  console.log('First 500 chars:', js.substring(0, 500));

  // Search for iframe or url or src
  const matches = js.matchAll(/iframe[^>]{0,100}/gi);
  for (const m of matches) {
    console.log('Iframe in 3102:', m[0]);
  }

  // Search for fetch or axios or api
  const apiMatches = js.matchAll(/\/api\/[^"'\`\s]+/g);
  for (const a of apiMatches) {
    console.log('API endpoint in 3102:', a[0]);
  }

  // Look for query params or how game URL is obtained
  const urlPattern = js.match(/.{0,150}(url|gameUrl|launchUrl|iframe).{0,150}/gi);
  if (urlPattern) {
    console.log('URL patterns in 3102.js:');
    urlPattern.slice(0, 5).forEach(p => console.log(' ->', p));
  }
}
fetchChunk3102();
