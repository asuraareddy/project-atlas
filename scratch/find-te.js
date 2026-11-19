async function findTe() {
  const res = await fetch('https://demo.1stake.app/js/app.js?8a0c4faa9771445189035ca844487507');
  const js = await res.text();

  // Search for .e =
  const eMatch = js.match(/.{0,50}\.e\s*=\s*.{0,150}/g);
  if (eMatch) {
    console.log('Chunk loading occurrences:', eMatch.slice(0, 5));
  }
}
findTe();
