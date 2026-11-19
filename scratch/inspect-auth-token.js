import fs from 'fs';

async function inspectAuth() {
  const res = await fetch('https://demo.1stake.app/js/app.js?8a0c4faa9771445189035ca844487507');
  const js = await res.text();

  // Search for token storage (localStorage, cookies, or vuex/pinia)
  const tokenStorage = js.matchAll(/localStorage\.setItem\(["']([^"']+)["']/g);
  for (const t of tokenStorage) {
    console.log('localStorage.setItem key:', t[1]);
  }

  // Search for Authorization header
  const authHeader = js.matchAll(/Authorization["']?\s*:\s*[`"'][^`"']+[`"']/g);
  for (const a of authHeader) {
    console.log('Authorization header:', a[0]);
  }

  // Search for token in login response handling
  const loginHandling = js.match(/.{0,80}auth\.login.{0,150}/g);
  if (loginHandling) {
    console.log('Login handling:', loginHandling.slice(0, 3));
  }
}

inspectAuth();
