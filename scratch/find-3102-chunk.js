async function find3102Chunk() {
  const res = await fetch('https://demo.1stake.app/js/app.js?8a0c4faa9771445189035ca844487507');
  const js = await res.text();

  const target = '3102===e?';
  const idx = js.indexOf(target);
  if (idx !== -1) {
    console.log('Found 3102===e:', js.substring(idx, idx + 100));
  } else {
    console.log('Not exact 3102===e, searching 3102 in t.u:');
    const uIndex = js.indexOf('t.u=');
    const endU = js.indexOf('};', uIndex);
    const uStr = js.substring(uIndex, endU);
    const match = uStr.match(/3102[^\?]+\?[^:]+/);
    console.log('Match in t.u:', match ? match[0] : 'not found');
  }
}
find3102Chunk();
