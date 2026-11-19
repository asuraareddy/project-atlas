import fs from 'fs';

async function searchRouter() {
  const res = await fetch('https://demo.1stake.app/js/app.js?8a0c4faa9771445189035ca844487507');
  const js = await res.text();

  // Find all vue-router route definitions
  // e.g. path: "/providers/:provider/games/:id" or similar
  const routeMatches = js.matchAll(/path:\s*["']([^"']+)["']/g);
  const paths = new Set();
  for (const m of routeMatches) {
    paths.add(m[1]);
  }
  console.log('All router paths in app.js:');
  console.log(Array.from(paths));

  // Find where game iframe or launch url is generated
  // Look for iframe in components
  const iframeComponent = js.matchAll(/<iframe[^>]+>/gi);
  for (const ifr of iframeComponent) {
    console.log('Found iframe template:', ifr[0]);
  }

  // Look for :src= or src= on iframe
  const iframeSrc = js.matchAll(/iframe[^>]{0,100}src[^>]{0,100}/gi);
  for (const s of iframeSrc) {
    console.log('Iframe src snippet:', s[0]);
  }
}

searchRouter();
