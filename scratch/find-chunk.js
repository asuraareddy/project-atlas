import fs from 'fs';

async function findChunk() {
  const res = await fetch('https://demo.1stake.app/js/app.js?8a0c4faa9771445189035ca844487507');
  const js = await res.text();

  let idx = 0;
  while ((idx = js.indexOf('18672', idx)) !== -1) {
    console.log('18672 at index', idx);
    console.log(js.substring(Math.max(0, idx - 150), Math.min(js.length, idx + 250)));
    idx += 5;
  }
}

findChunk();
