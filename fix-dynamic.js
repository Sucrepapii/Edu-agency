const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('route.ts')) results.push(file);
    }
  });
  return results;
}

const routes = walk(path.join(__dirname, 'src', 'app', 'api'));
let modifiedCount = 0;

for (const file of routes) {
  let content = fs.readFileSync(file, 'utf8');
  
  if (content.includes('export async function GET') && !content.includes('force-dynamic')) {
    // Add it after the imports
    const lines = content.split('\n');
    const lastImportIndex = lines.findLastIndex(l => l.startsWith('import '));
    
    lines.splice(lastImportIndex + 1, 0, '\nexport const dynamic = \'force-dynamic\';');
    
    fs.writeFileSync(file, lines.join('\n'));
    console.log(`Added force-dynamic to ${file}`);
    modifiedCount++;
  }
}

console.log(`Done. Modified ${modifiedCount} files.`);
