// One-time development helper: copies current frontend guide content into a backend seed file.
// The API reads PostgreSQL; it does not load frontend source at runtime.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ts = require('../../node_modules/typescript');

const source = fs.readFileSync(path.join(__dirname, '../../src/lib/mock-data.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const context = { exports: {} };
vm.runInNewContext(compiled, context, { timeout: 1000 });
const output = path.join(__dirname, '../data/resources.json');
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify(context.exports.MOCK_RESOURCES, null, 2) + '\n');
console.log(`Exported ${context.exports.MOCK_RESOURCES.length} resources to ${output}`);
