async function testFraming() {
  const urls = [
    {
      name: 'Azure Live Dealer Game',
      url: 'https://delightful-pebble-058f0fe03-partner.westeurope.1.azurestaticapps.net/init-game?lng=en&tokenAuth=ab301a75-dcb4-4584-bd27-43ca9deaf352&clientId=132&game_id=100101'
    },
    {
      name: 'Storybook Live Dealer Stream',
      url: 'https://test4-storybook.dev-lab.uk/iframe.html?globals=isBackgroundVisible%3A!false&args=&id=demostories-blackjack--primary&viewMode=story'
    }
  ];

  for (const item of urls) {
    console.log(`\nChecking [${item.name}]: ${item.url}`);
    try {
      const res = await fetch(item.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      console.log('HTTP Status:', res.status);
      console.log('X-Frame-Options:', res.headers.get('x-frame-options'));
      console.log('Content-Security-Policy:', res.headers.get('content-security-policy'));
      console.log('Access-Control-Allow-Origin:', res.headers.get('access-control-allow-origin'));
    } catch (e) {
      console.error('Error:', e.message);
    }
  }
}

testFraming();
