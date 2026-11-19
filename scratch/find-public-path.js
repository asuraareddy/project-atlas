async function findPublicPath() {
  const res = await fetch('https://demo.1stake.app/js/app.js?8a0c4faa9771445189035ca844487507');
  const js = await res.text();

  // Search for t.p or __webpack_require__.p
  const pMatch = js.match(/.{0,50}\.p\s*=\s*["'][^"']+["'].{0,50}/);
  console.log('Public path:', pMatch ? pMatch[0] : 'not found');

  // Search for chunk loading function (e.g. t.u = ...)
  const uMatch = js.match(/.{0,50}\.u\s*=\s*function\(e\)\{.{0,100}\}/);
  console.log('Chunk filename function:', uMatch ? uMatch[0] : 'not found');
}
findPublicPath();
