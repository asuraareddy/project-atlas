async function check455() {
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
  const initRes = await fetch('https://demo.1stake.app/register', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  storeCookies(initRes);

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
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
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

  // 3. Let's see what happens if we claim the faucet or check user account balance
  const userRes = await fetch('https://demo.1stake.app/api/user', {
    headers: {
      'Accept': 'application/json',
      'X-XSRF-TOKEN': decodeURIComponent(cookieJar.get('XSRF-TOKEN')),
      'Cookie': getCookieString(),
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  console.log('User status:', userRes.status);
  const userData = await userRes.json();
  console.log('User balance:', userData.account?.balance, userData.account?.currency_code);

  // 4. Test other games in Jacktop: roulette, baccarat, poker
  const jacktopGames = ['blackjack', 'roulette', 'baccarat', 'poker', 'blackjack-seven'];
  for (const g of jacktopGames) {
    const launchRes = await fetch(`https://demo.1stake.app/api/providers/jacktop/games/${g}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-XSRF-TOKEN': decodeURIComponent(cookieJar.get('XSRF-TOKEN')),
        'Cookie': getCookieString(),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify({ is_mobile: false })
    });
    console.log(`Game [${g}] launch status:`, launchRes.status);
    const text = await launchRes.text();
    console.log(` -> Body:`, text);
  }
}

check455();
