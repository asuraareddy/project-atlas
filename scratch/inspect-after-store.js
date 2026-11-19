const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\dell\\.gemini\\antigravity-ide\\brain\\ef9d13a3-0a71-425a-afa7-fd834a2a16c3\\.system_generated\\steps\\1373\\content.md', 'utf8');

const storeIndex = content.indexOf('window.store = "');
const nextScript = content.indexOf('</script>', storeIndex);
console.log('window.store length:', nextScript - storeIndex);
console.log('After window.store script:', content.substring(nextScript, nextScript + 1000));
