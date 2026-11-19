async function sessionLaunch() {
  const cookieJar = {};

  function updateCookies(res) {
    const raw = res.headers.getSetCookie ? res.headers.getSetCookie() : [res.headers.get('set-cookie')];
    raw.forEach(header => {
      if (!header) return;
      header.split(',').forEach(c => {
        const parts = c.trim().split(';')[0].split('=');
        if (parts.length >= 2) {
          const k = parts[0].trim();
          const v = parts.slice(1).join('=').trim();
          if (k && !k.toLowerCase().includes('expires') && !k.toLowerCase().includes('path')) {
            cookieJar[k] = v;
          }
        }
      });
    });
  }

  function getCookieHeader() {
    return Object.entries(cookieJar).map(([k, v]) => `${k}=${v}`).join('; ');
  }

  // 1. Initial GET
  const initRes = await fetch('https://demo.1stake.app/register', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  updateCookies(initRes);
  console.log('Cookies after init:', Object.keys(cookieJar));

  // 2. Register
  const rand = Math.floor(Math.random() * 100000);
  const email = `player${rand}@testmail.com`;
  const name = `Player${rand}`;
  const password = `TestPass123!`;

  const regRes = await fetch('https://demo.1stake.app/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-XSRF-TOKEN': decodeURIComponent(cookieJar['XSRF-TOKEN']),
      'Cookie': getCookieHeader(),
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    },
    body: JSON.stringify({
      name,
      email,
      password,
      password_confirmation: password
    })
  });
  updateCookies(regRes);
  console.log('Registration status:', regRes.status);
  console.log('Cookies after register:', Object.keys(cookieJar));

  // 3. Launch game
  console.log('Attempting game launch for Jacktop Blackjack...');
  const launchRes = await fetch('https://demo.1stake.app/api/providers/jacktop/games/blackjack', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-XSRF-TOKEN': decodeURIComponent(cookieJar['XSRF-TOKEN']),
      'Cookie': getCookieHeader(),
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    },
    body: JSON.stringify({ is_mobile: false })
  });

  console.log('Launch status:', launchRes.status);
  const launchJson = await launchRes.json();
  console.log('=== EXACT JACKTOP GAME LAUNCH RESPONSE ===');
  console.log(JSON.stringify(launchJson, null, 2));

  if (launchJson.url) {
    console.log('\n>>> EXACT LIVE DEALER STREAM / IFRAME URL: <<<');
    console.log(launchJson.url);

    // Let's inspect the HTML of that URL to see how the video stream is delivered!
    const gamePageRes = await fetch(launchJson.url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    console.log('Game page status:', gamePageRes.status);
    const gameHtml = await gamePageRes.text();
    console.log('Game page length:', gameHtml.length);
    console.log('Game page preview (first 1000 chars):', gameHtml.substring(0, 1000));

    // Save to scratch/jacktop-game-page.html
    const fs = await import('fs');
    fs.writeFileSync('scratch/jacktop-game-page.html', gameHtml, 'utf8');
    console.log('Saved to scratch/jacktop-game-page.html');
  }
}

sessionLaunch();
