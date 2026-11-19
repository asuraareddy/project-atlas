import fs from 'fs';

async function searchDemoHtml() {
  const res = await fetch('https://demo.1stake.app/providers/jacktop/games/blackjack', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });

  const html = await res.text();
  console.log('HTML size:', html.length);

  // Search for any URLs in html
  const urls = html.matchAll(/https?:\/\/[^\s"'<>\\]+/gi);
  const found = new Set();
  for (const u of urls) {
    if (!u[0].includes('w3.org') && !u[0].includes('google') && !u[0].includes('facebook')) {
      found.add(u[0]);
    }
  }

  console.log('URLs in initial HTML:');
  console.log(Array.from(found));
}

searchDemoHtml();
