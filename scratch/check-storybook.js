async function checkStorybook() {
  const url = 'https://test4-storybook.dev-lab.uk/iframe.html?globals=isBackgroundVisible%3A!false&args=&id=demostories-blackjack--primary&viewMode=story';
  console.log('Testing Storybook URL:', url);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    console.log('HTTP Status:', res.status);
    const html = await res.text();
    console.log('HTML length:', html.length);
    console.log('Preview:', html.substring(0, 1000));
  } catch (e) {
    console.error('Fetch error:', e.message);
  }
}

checkStorybook();
