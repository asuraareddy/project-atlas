const fs = require('fs');
const json = JSON.parse(fs.readFileSync('scratch/1stake-demo-store.json', 'utf8'));

console.log('--- CONFIG.SETTINGS ---');
console.log('App:', json.config?.app);
console.log('Settings:', json.config?.settings);
console.log('Colors:', json.config?.settings?.theme?.colors);
console.log('Template:', json.config?.settings?.template);
console.log('Theme default:', json.config?.settings?.theme?.default);
console.log('Fonts:', json.config?.settings?.fonts);
console.log('--- MODELS ---');
console.log('Currencies:', json.models?.currencies);
console.log('Social Networks:', json.models?.socialNetworks);
console.log('Bonus Cards:', json.models?.bonusCards);
console.log('Slides:', json.models?.slides);
console.log('--- GAMES ---');
console.log('Game keys:', Object.keys(json.games || {}));
console.log('Packages:', Object.keys(json.packages || {}));
