async function inspectAzureGame() {
  const base = 'https://delightful-pebble-058f0fe03-partner.westeurope.1.azurestaticapps.net';
  const jsUrl = `${base}/assets/index-DD-qcvjP.js`;
  console.log('Fetching:', jsUrl);
  const res = await fetch(jsUrl);
  console.log('Status:', res.status);
  const js = await res.text();
  console.log('Length:', js.length);

  const fs = await import('fs');
  fs.writeFileSync('scratch/azure-game-bundle.js', js, 'utf8');
  console.log('Saved to scratch/azure-game-bundle.js');

  // Search for WebSocket URLs, video URLs, WebRTC, HLS, or API backends
  const urls = js.matchAll(/wss?:\/\/[^\s"'`)]+|https?:\/\/[^\s"'`)]+/gi);
  const uniqueUrls = new Set();
  for (const u of urls) {
    uniqueUrls.add(u[0]);
  }
  console.log('Unique URLs in Azure game bundle:');
  console.log(Array.from(uniqueUrls).slice(0, 30));

  // Search for video player or stream elements
  const videoMatches = js.match(/.{0,80}(video|webrtc|hls|stream|m3u8|live|player).{0,80}/gi);
  console.log('Media keywords match count:', videoMatches ? videoMatches.length : 0);
  if (videoMatches) {
    videoMatches.slice(0, 10).forEach(m => console.log(' ->', m));
  }
}

inspectAzureGame();
