const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

process.chdir(path.resolve(__dirname, '..'));

const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => {
  const full = path.join(d, e.name);
  return e.isDirectory() ? walk(full) : [full];
});

let pageCount = 0;
const htmlFiles = walk('.').filter(p => p.endsWith('.html') && !p.startsWith('node_modules'));

console.log(`Validating ${htmlFiles.length} HTML pages...`);

for (const p of htmlFiles) {
  const content = fs.readFileSync(p, 'utf8');

  // 1. No NUL characters
  assert(!content.includes('\x00'), `${p}: contains NUL character`);

  // 2. Strictly NO "number-protection" or "protection remove"
  assert(!content.includes('number-protection'), `${p}: contains forbidden 'number-protection' reference`);
  assert(!content.includes('call-bomber-protection-remove-apk'), `${p}: contains forbidden 'call-bomber-protection-remove-apk' reference`);

  // 3. Has Title, meta viewport, and proper doctype
  assert(/<title>.*?<\/title>/i.test(content), `${p}: missing <title>`);
  assert(/name="viewport"/i.test(content), `${p}: missing viewport meta`);
  assert(/<!DOCTYPE html>/i.test(content), `${p}: missing <!DOCTYPE html>`);

  // 4. Verify local asset links resolve correctly
  const assetMatches = content.matchAll(/(?:src|href)="([^"#?:]+)(?:#[^"]*)?"/g);
  for (const m of assetMatches) {
    const rawLink = m[1];
    // Skip external or protocol links
    if (rawLink.startsWith('http') || rawLink.startsWith('//') || rawLink.startsWith('mailto:')) continue;
    
    // Resolve relative to the HTML file's directory
    const dir = path.dirname(p);
    let target = path.resolve(dir, rawLink);
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
      target = path.join(target, 'index.html');
    }
    assert(fs.existsSync(target), `${p}: broken local link -> ${rawLink} (resolved to ${target})`);
  }

  pageCount++;
}

// 5. Validate Sitemap
assert(fs.existsSync('sitemap.xml'), 'sitemap.xml is missing');
const sitemap = fs.readFileSync('sitemap.xml', 'utf8');
assert(!sitemap.includes('number-protection'), 'sitemap.xml contains forbidden number-protection reference');
assert(!sitemap.includes('call-bomber-protection-remove-apk'), 'sitemap.xml contains forbidden protection-remove reference');

// 6. Validate .nojekyll
assert(fs.existsSync('.nojekyll'), '.nojekyll missing for GitHub Pages compatibility');

// 7. Validate JavaScript files
const jsFiles = walk('assets').filter(p => p.endsWith('.js'));
for (const js of jsFiles) {
  const jsContent = fs.readFileSync(js, 'utf8');
  assert(!jsContent.includes('\x00'), `${js}: contains NUL character`);
  assert(!jsContent.includes('number-protection'), `${js}: contains number-protection reference`);
}

console.log(`✅ SUCCESS: ${pageCount} pages verified!`);
console.log(`✅ GitHub Pages ready: .nojekyll present, all relative asset links intact.`);
console.log(`✅ Number-protection successfully excluded from entire codebase and sitemap.`);
