const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\dell\\.gemini\\antigravity-ide\\brain\\ef9d13a3-0a71-425a-afa7-fd834a2a16c3\\.system_generated\\steps\\1373\\content.md', 'utf8');

const scripts = content.match(/<script[^>]*src="([^"]+)"/g) || [];
console.log('Scripts:', scripts);
const styles = content.match(/<link[^>]*href="([^"]+)"/g) || [];
console.log('Styles:', styles);

// Check if any router config or HTML template is inside
console.log('Length of HTML:', content.length);
const appDiv = content.indexOf('<div id="app">');
console.log('App div position:', appDiv);
console.log('Content around app div:', content.substring(appDiv - 100, appDiv + 300));
