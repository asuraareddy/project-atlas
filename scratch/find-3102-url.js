async function findChunkUrl() {
  const res = await fetch('https://demo.1stake.app/js/app.js?8a0c4faa9771445189035ca844487507');
  const js = await res.text();

  const uIndex = js.indexOf('t.u=');
  console.log('t.u definition:');
  console.log(js.substring(uIndex, uIndex + 1500));
}
findChunkUrl();
