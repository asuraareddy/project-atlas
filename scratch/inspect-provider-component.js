import fs from 'fs';

async function inspectComponent() {
  const res = await fetch('https://demo.1stake.app/js/app.js?8a0c4faa9771445189035ca844487507');
  const js = await res.text();

  // Find occurrences of ":provider/games/:game"
  const target = ':provider/games/:game';
  let idx = 0;
  while ((idx = js.indexOf(target, idx)) !== -1) {
    console.log('=== MATCH AT INDEX', idx, '===');
    const start = Math.max(0, idx - 400);
    const end = Math.min(js.length, idx + 1200);
    console.log(js.substring(start, end));
    idx += target.length;
  }
}

inspectComponent();
