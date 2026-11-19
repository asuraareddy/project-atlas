async function inspectStorybookContent() {
  const url = 'https://test4-storybook.dev-lab.uk/iframe.html?globals=isBackgroundVisible%3A!false&args=&id=demostories-blackjack--primary&viewMode=story';
  const res = await fetch(url);
  const html = await res.text();
  console.log('HTML length:', html.length);

  // Extract script tags
  const scripts = Array.from(html.matchAll(/<script[^>]*src=["']([^"']+)["']/gi)).map(m => m[1]);
  console.log('Storybook scripts:', scripts);

  for (const s of scripts) {
    const sUrl = s.startsWith('http') ? s : 'https://test4-storybook.dev-lab.uk/' + s.replace(/^\.\//, '');
    console.log('Fetching script:', sUrl);
    const jsRes = await fetch(sUrl);
    const js = await jsRes.text();
    console.log(`Script ${s} length:`, js.length);

    // Look for video, stream, wss, or dealer references
    const videoMatches = js.match(/.{0,80}(m3u8|webrtc|wss:\/\/|video|stream|dealer).{0,80}/gi);
    if (videoMatches) {
      console.log(`Matches in ${s}: count =`, videoMatches.length);
      videoMatches.slice(0, 5).forEach(m => console.log(' ->', m));
    }
  }
}

inspectStorybookContent();
