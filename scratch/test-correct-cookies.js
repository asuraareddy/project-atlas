async function testWithProperCookies() {
  const cookieJar = new Map();

  function storeCookies(res) {
    let headers = [];
    if (typeof res.headers.getSetCookie === 'function') {
      headers = res.headers.getSetCookie();
    } else {
      const h = res.headers.get('set-cookie');
      if (h) headers = [h];
    }

    for (const h of headers) {
      if (!h) continue;
      // The cookie pair is before the first semicolon
      const firstSemi = h.indexOf(';');
      const pair = firstSemi !== -1 ? h.substring(0, firstSemi) : h;
      const eqIdx = pair.indexOf('=');
      if (eqIdx !== -1) {
        const key = pair.substring(0, eqIdx).trim();
        const val = pair.substring(eqIdx + 1).trim();
        cookieJar.set(key, val);
      }
    }
  }

  function getCookieString() {
    const parts = [];
    for (const [k, v] of cookieJar.entries()) {
      parts.push(`${k}=${v}`);
    }
    return parts.join('; ');
  }

  // 1. Init
  const initRes = await fetch('https://demo.1stake.app/register', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  storeCookies(initRes);
  console.log('Init cookies:', Array.from(cookieJar.keys()));

  // 2. Register
  const rand = Math.floor(Math.random() * 1000000);
  const email = `player${rand}@testmail.com`;
  const name = `Player${rand}`;
  const password = `TestPass123!`;

  const regRes = await fetch('https://demo.1stake.app/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-XSRF-TOKEN': decodeURIComponent(cookieJar.get('XSRF-TOKEN')),
      'Cookie': getCookieString(),
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'https://demo.1stake.app/register',
      'Origin': 'https://demo.1stake.app'
    },
    body: JSON.stringify({
      name,
      email,
      password,
      password_confirmation: password,
      fingerprint: 'demo-fp-' + rand
    })
  });

  storeCookies(regRes);
  console.log('Registration status:', regRes.status);
  const regData = await regRes.json();
  console.log('User registered:', regData.name, regData.email);
  console.log('Cookies after register:', Array.from(cookieJar.keys()));

  // 3. Launch game!
  console.log('Launching Jacktop Blackjack...');
  const launchRes = await fetch('https://demo.1stake.app/api/providers/jacktop/games/blackjack', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-XSRF-TOKEN': decodeURIComponent(cookieJar.get('XSRF-TOKEN')),
      'Cookie': getCookieString(),
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'https://demo.1stake.app/providers/jacktop/games/blackjack',
      'Origin': 'https://demo.1stake.app'
    },
    body: JSON.stringify({ is_mobile: false })
  });

  console.log('Launch status:', launchRes.status);
  const launchData = await launchRes.json();
  console.log('LAUNCH DATA:', JSON.stringify(launchData, null, 2));

  if (launchData.url) {
    console.log('\n=============================================');
    console.log('SUCCESS! LAUNCH URL FOUND:');
    console.log(launchData.url);
    console.log('=============================================\n');

    const fs = await import('fs');
    fs.writeFileSync('scratch/live-jacktop-launch.json', JSON.stringify(launchData, null, 2), 'utf8');

    // Fetch the launch URL!
    const pageRes = await fetch(launchData.url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    console.log('Game page status:', pageRes.status);
    const pageHtml = await pageRes.text();
    fs.writeFileSync('scratch/live-stream-page.html', pageHtml, 'utf8');
    console.log('Saved page HTML to scratch/live-stream-page.html (size:', pageHtml.length, ')');
  }
}

testWithProperCookies();
