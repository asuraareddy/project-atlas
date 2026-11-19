async function testRegisterLogin() {
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

  // 1. Init
  const initRes = await fetch('https://demo.1stake.app/login', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  storeCookies(initRes);

  // 2. Register
  const rand = Math.floor(Math.random() * 1000000);
  const email = `player${rand}@testmail.com`;
  const name = `Player${rand}`;
  const password = `TestPass123!`;

  console.log('Registering user:', email);
  const regRes = await fetch('https://demo.1stake.app/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-XSRF-TOKEN': decodeURIComponent(cookieJar.get('XSRF-TOKEN')),
      'Cookie': getCookieString(),
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Origin': 'https://demo.1stake.app',
      'Referer': 'https://demo.1stake.app/register'
    },
    body: JSON.stringify({
      name,
      email,
      password,
      password_confirmation: password,
      fingerprint: 'fp-' + rand
    })
  });
  storeCookies(regRes);
  console.log('Register status:', regRes.status);

  // 3. Login explicitly
  console.log('Logging in explicitly with new account...');
  const loginRes = await fetch('https://demo.1stake.app/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/plain, */*',
      'X-XSRF-TOKEN': decodeURIComponent(cookieJar.get('XSRF-TOKEN')),
      'Cookie': getCookieString(),
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Origin': 'https://demo.1stake.app',
      'Referer': 'https://demo.1stake.app/login'
    },
    body: JSON.stringify({
      email,
      password,
      fingerprint: 'fp-' + rand
    })
  });
  storeCookies(loginRes);
  console.log('Login status:', loginRes.status);
  const loginText = await loginRes.text();
  console.log('Login text preview:', loginText.substring(0, 300));

  // 4. Test authenticated user endpoint
  const meRes = await fetch('https://demo.1stake.app/api/user', {
    headers: {
      'Accept': 'application/json',
      'X-XSRF-TOKEN': decodeURIComponent(cookieJar.get('XSRF-TOKEN')),
      'Cookie': getCookieString(),
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  console.log('/api/user status:', meRes.status);
  const meText = await meRes.text();
  console.log('/api/user response:', meText.substring(0, 300));

  // 5. Now launch Jacktop Blackjack!
  console.log('\nLaunching Jacktop Blackjack with verified authenticated user session...');
  const launchRes = await fetch('https://demo.1stake.app/api/providers/jacktop/games/blackjack', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-XSRF-TOKEN': decodeURIComponent(cookieJar.get('XSRF-TOKEN')),
      'Cookie': getCookieString(),
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Origin': 'https://demo.1stake.app',
      'Referer': 'https://demo.1stake.app/providers/jacktop/games/blackjack'
    },
    body: JSON.stringify({ is_mobile: false })
  });

  console.log('Launch status:', launchRes.status);
  const launchText = await launchRes.text();
  console.log('LAUNCH RESULT:');
  console.log(launchText);

  try {
    const launchData = JSON.parse(launchText);
    if (launchData.url) {
      console.log('\n>>> EXACT LAUNCH URL <<<');
      console.log(launchData.url);
      const fs = await import('fs');
      fs.writeFileSync('scratch/live-jacktop-url.txt', launchData.url, 'utf8');
    }
  } catch {}
}

testRegisterLogin();
