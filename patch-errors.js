const fs = require('fs');
const glob = require('glob');
const cp = require('child_process');

try {
  let files = cp.execSync('npx glob "src/modules/**/*.tsx"').toString().trim().split('\n');
  files.forEach(f => {
    f = f.trim();
    if (!f) return;
    let content = fs.readFileSync(f, 'utf8');
    let replaced = content.replace(/catch\s*\((.*?)\)\s*\{[\s\S]*?set(.*?Error)\((.*?)\);?\s*\}/g, (match, errVar, errorType, errorExpr) => {
      return \catch (\) {
      console.error("Error in \SalesPage.tsx:", \);
      set\(typeof \ === 'string' ? \ : \ instanceof Error ? \.message : "Error");
    }\;
    });
    if (content !== replaced) {
      fs.writeFileSync(f, replaced, 'utf8');
      console.log('Patched ' + f);
    }
  });
} catch(e) { console.error(e); }
