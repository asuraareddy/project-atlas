async function find9721() {
  const res = await fetch('https://demo.1stake.app/js/app.js?8a0c4faa9771445189035ca844487507');
  const js = await res.text();

  const target = '9721===e?';
  const idx = js.indexOf(target);
  if (idx !== -1) {
    console.log('Found 9721:', js.substring(idx, idx + 100));
  } else {
    const uIndex = js.indexOf('t.u=');
    const uStr = js.substring(uIndex, uIndex + 4000);
    const m = uStr.match(/9721[^\?]+\?[^:]+/);
    console.log('Match in t.u:', m ? m[0] : 'not found');
  }
}
find9721();
