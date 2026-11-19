import fs from 'fs';

async function inspectFingerprint() {
  const res = await fetch('https://demo.1stake.app/js/app.js?8a0c4faa9771445189035ca844487507');
  const js = await res.text();

  const fpIdx = js.indexOf('fingerprint_enabled');
  if (fpIdx !== -1) {
    console.log('Context around fingerprint:');
    console.log(js.substring(Math.max(0, fpIdx - 300), Math.min(js.length, fpIdx + 600)));
  }
}

inspectFingerprint();
