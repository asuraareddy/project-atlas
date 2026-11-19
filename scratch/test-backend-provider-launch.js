async function testProviderLaunch(gameId = 'blackjack') {
  console.log(`--- Testing Provider Live Launch for ${gameId} ---`);

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

  // 1. Get initial cookie / XSRF
  const initRes = await fetch('https://demo.1stake.app/login', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  storeCookies(initRes);

  // 2. Login as demo@1stake.app
  const loginRes = await fetch('https://demo.1stake.app/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-XSRF-TOKEN': decodeURIComponent(cookieJar.get('XSRF-TOKEN') || ''),
      'Cookie': getCookieString(),
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Origin': 'https://demo.1stake.app',
      'Referer': 'https://demo.1stake.app/login'
    },
    body: JSON.stringify({
      email: 'demo@1stake.app',
      password: 'admin',
      fingerprint: 'fp-test-live-dealer'
    })
  });
  storeCookies(loginRes);

  if (loginRes.status !== 200) {
    throw new Error(`Login failed: ${loginRes.status}`);
  }
  console.log('✓ Successfully authenticated provider session');

  // 3. Post to game launch endpoint
  const launchEndpoint = `https://demo.1stake.app/api/providers/jacktop/games/${gameId}`;
  const launchRes = await fetch(launchEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-XSRF-TOKEN': decodeURIComponent(cookieJar.get('XSRF-TOKEN') || ''),
      'Cookie': getCookieString(),
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Origin': 'https://demo.1stake.app',
      'Referer': `https://demo.1stake.app/providers/jacktop/games/${gameId}`
    },
    body: JSON.stringify({ is_mobile: false })
  });

  const data = await launchRes.json();
  console.log('Launch response status:', launchRes.status);
  console.log('Launch URL:', data.url);
  return data;
}

testProviderLaunch('blackjack');
