async function testLaunch() {
  // First let's get cookies and CSRF
  const initRes = await fetch('https://demo.1stake.app/providers/jacktop/games/blackjack', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });

  const cookies = initRes.headers.get('set-cookie') || '';
  console.log('Cookies received:', cookies);

  // Parse XSRF-TOKEN
  const xsrfMatch = cookies.match(/XSRF-TOKEN=([^;]+)/);
  const xsrfToken = xsrfMatch ? decodeURIComponent(xsrfMatch[1]) : '';
  console.log('XSRF Token:', xsrfToken);

  const cookieHeader = cookies.split(',').map(c => c.split(';')[0]).join('; ');
  console.log('Cookie header:', cookieHeader);

  // Test endpoints
  const urls = [
    'https://demo.1stake.app/api/providers/jacktop/games/blackjack',
    'https://demo.1stake.app/api/providers/jacktop/games/blackjack/demo'
  ];

  for (const url of urls) {
    try {
      console.log('Testing POST to:', url);
      const postRes = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-XSRF-TOKEN': xsrfToken,
          'Cookie': cookieHeader,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        body: JSON.stringify({ is_mobile: false })
      });

      console.log('Status:', postRes.status);
      const json = await postRes.json();
      console.log('Response JSON:', JSON.stringify(json, null, 2));
    } catch (e) {
      console.error(url, 'error:', e.message);
    }
  }
}

testLaunch();
