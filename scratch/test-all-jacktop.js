async function testAllJacktopGames() {
  const cookieJar = new Map();
  function storeCookies(res) {
    const headers = typeof res.headers.getSetCookie === 'function' ? res.headers.getSetCookie() : [res.headers.get('set-cookie')];
    for (const h of headers) {
      if (!h) continue;
      const firstSemi = h.indexOf(';');
      const pair = firstSemi !== -1 ? h.substring(0, firstSemi) : h;
      const eqIdx = pair.indexOf('=');
      if (eqIdx !== -1) {
        cookieJar.set(pair.substring(0, eqIdx).trim(), pair.substring(eqIdx + 1).trim());
      }
    }
  }

  function getCookieString() {
    return Array.from(cookieJar.entries()).map(([k, v]) => `${k}=${v}`).join('; ');
  }

  const initRes = await fetch('https://demo.1stake.app/login', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  storeCookies(initRes);

  const loginRes = await fetch('https://demo.1stake.app/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-XSRF-TOKEN': decodeURIComponent(cookieJar.get('XSRF-TOKEN') || ''),
      'Cookie': getCookieString(),
      'User-Agent': 'Mozilla/5.0',
      'Origin': 'https://demo.1stake.app',
      'Referer': 'https://demo.1stake.app/login'
    },
    body: JSON.stringify({
      email: 'demo@1stake.app',
      password: 'admin',
      fingerprint: 'fp-test-all-live'
    })
  });
  storeCookies(loginRes);

  const games = ['blackjack', 'roulette', 'baccarat', 'poker', 'blackjack-seven'];
  for (const g of games) {
    const res = await fetch(`https://demo.1stake.app/api/providers/jacktop/games/${g}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-XSRF-TOKEN': decodeURIComponent(cookieJar.get('XSRF-TOKEN') || ''),
        'Cookie': getCookieString(),
        'User-Agent': 'Mozilla/5.0',
        'Origin': 'https://demo.1stake.app',
        'Referer': `https://demo.1stake.app/providers/jacktop/games/${g}`
      },
      body: JSON.stringify({ is_mobile: false })
    });

    const data = await res.json();
    console.log(`[${g}]:`, res.status, data.url || data.message);
  }
}

testAllJacktopGames();
