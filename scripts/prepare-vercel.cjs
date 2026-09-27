// Export tracked source into a clean directory without local environments/caches.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const target = process.argv[2];
if (!['web', 'api'].includes(target)) throw new Error('Usage: node scripts/prepare-vercel.cjs web|api');
const root = path.resolve(__dirname, '..');
const destination = path.join(root, '.deploy');
fs.mkdirSync(destination, { recursive: true });
const stage = fs.mkdtempSync(path.join(destination, `${target}-`));
const files = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
for (const name of files) {
  const backend = name.startsWith('backend/');
  if (target === 'api' ? !backend || name.startsWith('backend/tests/') : backend || /^(docs|tests|scripts)\//.test(name)) continue;
  const relative = target === 'api' ? name.slice('backend/'.length) : name;
  const output = path.join(stage, relative);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.copyFileSync(path.join(root, name), output);
}
console.log(stage);
