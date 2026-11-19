async function loginWithCreds() {
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

  // 1. Initial GET to obtain session and XSRF-TOKEN
  console.log('1. Connecting to demo.1stake.app/login ...');
  const initRes = await fetch('https://demo.1stake.app/login', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  storeCookies(initRes);
  console.log('Initial cookies:', Array.from(cookieJar.keys()));

  // 2. Perform Login with demo@1stake.app / admin
  console.log('2. Authenticating demo@1stake.app ...');
  const loginRes = await fetch('https://demo.1stake.app/api/auth/login', {
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
      email: 'demo@1stake.app',
      password: 'admin',
      fingerprint: '3b89fa12e9b89710f6c2'
    })
  });
  storeCookies(loginRes);
  console.log('Login HTTP status:', loginRes.status);
  const loginData = await loginRes.json();
  console.log('Logged in user info:', {
    name: loginData.name,
    email: loginData.email,
    is_admin: loginData.is_admin,
    account: loginData.account
  });

  // 3. Launch Jacktop Blackjack
  console.log('3. Requesting game launch URL for Jacktop Live Blackjack ...');
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

  console.log('Launch HTTP status:', launchRes.status);
  const launchData = await launchRes.json();
  console.log('\n======================================================');
  console.log('OFFICIAL GAME LAUNCH DATA:');
  console.log(JSON.stringify(launchData, null, 2));
  console.log('======================================================\n');

  if (launchData.url) {
    const fs = await import('fs');
    fs.writeFileSync('scratch/live-jacktop-url.txt', launchData.url, 'utf8');

    // 4. Inspect the exact stream iframe page
    console.log('4. Fetching the real dealer stream iframe HTML from:', launchData.url);
    const iframeRes = await fetch(launchData.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://demo.1stake.app/'
      }
    });
    console.log('Iframe HTTP status:', iframeRes.status);
    const iframeHtml = await iframeRes.text();
    fs.writeFileSync('scratch/live-jacktop-iframe.html', iframeHtml, 'utf8');
    console.log('Saved live dealer stream iframe HTML to scratch/live-jacktop-iframe.html (size:', iframeHtml.length, 'bytes)');

    // Look for video tags, hls m3u8, webrtc, or scripts inside the iframe
    const videos = iframeHtml.match(/<video[^>]*>/gi);
    console.log('Video tags in iframe:', videos);

    const streamMatches = iframeHtml.match(/https?:\/\/[^\s"'<>\\]+(\.m3u8|\.mp4|webrtc|wss:\/\/|stream)[^\s"'<>\\]*/gi);
    console.log('Stream/Media URLs in iframe:', streamMatches);
  }
}

loginWithCreds();
