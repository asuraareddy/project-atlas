async function checkLogin() {
  const res = await fetch('https://demo.1stake.app/login');
  const html = await res.text();
  const cookies = res.headers.get('set-cookie');
  console.log('Set-Cookie:', cookies);

  // Extract csrf token from html
  const csrfMatch = html.match(/csrf-token.*?content=["']([^"']+)["']/i);
  console.log('CSRF Token:', csrfMatch ? csrfMatch[1] : null);

  // Let's see what inputs exist in the form
  const inputs = html.match(/<input[^>]+>/gi);
  console.log('Inputs:', inputs);

  // Check demo credentials in content or messages
  const storeMatch = html.match(/window\.store\s*=\s*(\{[\s\S]*?\});\s*<\/script>/);
  if (storeMatch) {
    const store = JSON.parse(storeMatch[1]);
    console.log('demo user in store:', store.user);
    if (store.content?.login) {
      console.log('Login content:', store.content.login);
    }
  }
}
checkLogin();
