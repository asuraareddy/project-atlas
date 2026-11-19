import fs from 'fs';

async function findGamePage() {
  const res = await fetch('https://demo.1stake.app/js/app.js?8a0c4faa9771445189035ca844487507');
  const js = await res.text();

  // Search for chunk containing resources/js/pages/games/index or 18672
  const target = 'resources/js/pages/games/index';
  let idx = js.indexOf(target);
  console.log('Index of target:', idx);
  if (idx !== -1) {
    console.log('Context around target:');
    console.log(js.substring(Math.max(0, idx - 200), Math.min(js.length, idx + 600)));
  }

  // Look for chunk mappings: 18672 or game-providers chunk
  // Look for webpack chunk loading
  const chunkRegex = /18672:\s*function|\"18672\":/g;
  console.log('18672 matches:', Array.from(js.matchAll(chunkRegex)));
}

findGamePage();
