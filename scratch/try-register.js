async function tryRegister() {
  const initRes = await fetch('https://demo.1stake.app/register', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const cookies = initRes.headers.get('set-cookie') || '';
  const xsrfMatch = cookies.match(/XSRF-TOKEN=([^;]+)/);
  const xsrfToken = xsrfMatch ? decodeURIComponent(xsrfMatch[1]) : '';
  const cookieHeader = cookies.split(',').map(c => c.split(';')[0]).join('; ');

  const rand = Math.floor(Math.random() * 100000);
  const email = `player${rand}@testmail.com`;
  const name = `Player${rand}`;
  const password = `TestPass123!`;

  console.log('Attempting register with:', email);
  const res = await fetch('https://demo.1stake.app/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-XSRF-TOKEN': xsrfToken,
      'Cookie': cookieHeader,
      'User-Agent': 'Mozilla/5.0'
    },
    body: JSON.stringify({
      name,
      email,
      password,
      password_confirmation: password
    })
  });

  console.log('Status:', res.status);
  const json = await res.json();
  console.log('Response:', JSON.stringify(json, null, 2));

  // If registered successfully, let's test launching the blackjack game!
  if (res.status === 200 || res.status === 201) {
    const authCookies = res.headers.get('set-cookie') || cookies;
    console.log('Auth cookies:', authCookies);
    const authHeader = authCookies.split(',').map(c => c.split(';')[0]).join('; ');
    const newXsrfMatch = authCookies.match(/XSRF-TOKEN=([^;]+)/);
    const newXsrf = newXsrfMatch ? decodeURIComponent(newXsrfMatch[1]) : xsrfToken;

    console.log('Calling POST /api/providers/jacktop/games/blackjack ...');
    const launchRes = await fetch('https://demo.1stake.app/api/providers/jacktop/games/blackjack', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-XSRF-TOKEN': newXsrf,
        'Cookie': authHeader,
        'User-Agent': 'Mozilla/5.0'
      },
      body: JSON.stringify({ is_mobile: false })
    });

    console.log('Launch status:', launchRes.status);
    const launchJson = await launchRes.json();
    console.log('LAUNCH RESULT:', JSON.stringify(launchJson, null, 2));
  }
}

tryRegister();
