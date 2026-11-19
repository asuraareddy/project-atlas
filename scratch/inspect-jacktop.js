async function inspectJacktop() {
  try {
    const url = 'https://demo.1stake.app/providers/jacktop/games/blackjack';
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    console.log('HTTP Status:', res.status);
    const html = await res.text();
    console.log('HTML size:', html.length);

    // Let's check window.store inside the HTML
    const storeMatch = html.match(/window\.store\s*=\s*(\{[\s\S]*?\});\s*<\/script>/);
    if (storeMatch) {
      console.log('Found window.store in HTML!');
      const storeJson = JSON.parse(storeMatch[1]);
      console.log('Store keys:', Object.keys(storeJson));
      if (storeJson.routes) {
        console.log('Routes in store:', storeJson.routes);
      }
    } else {
      console.log('No inline store match, scanning for JSON or API endpoints...');
    }

    // Look for jacktop in HTML
    const jacktopMatches = html.match(/.{0,100}jacktop.{0,100}/gi);
    if (jacktopMatches) {
      console.log('Jacktop occurrences:', jacktopMatches.slice(0, 5));
    }

  } catch (e) {
    console.error('Error:', e);
  }
}

inspectJacktop();
