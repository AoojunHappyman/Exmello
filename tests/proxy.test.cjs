const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function handler(fetch, env = { API_INTERNAL_URL: 'https://api.example.test', NODE_ENV: 'production' }) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync('src/app/api/[...path]/route.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  vm.runInNewContext(code, { exports, process: { env }, URL, Headers, Response, AbortSignal, fetch });
  return exports;
}
const context = (...path) => ({ params: Promise.resolve({ path }) });
test('proxy preserves authorization, query and body without forwarding browser cookies', async () => {
  const api = handler(async (url, init) => {
    assert.equal(url.href, 'https://api.example.test/api/checkins?limit=2');
    assert.equal(init.headers.get('Authorization'), 'Bearer test');
    assert.equal(init.headers.get('Cookie'), null);
    assert.equal(Buffer.from(init.body).toString(), '{"mood":"good"}');
    assert.equal(init.redirect, 'manual');
    return Response.json({ id: 1 });
  });
  const result = await api.POST(new Request('https://web.test/api/checkins?limit=2', {
    method: 'POST', headers: { Authorization: 'Bearer test', Cookie: 'private=1' }, body: '{"mood":"good"}',
  }), context('checkins'));
  assert.equal(result.status, 200);
  assert.equal(result.headers.get('Cache-Control'), 'no-store');
});
test('proxy preserves 401 and empty deletion responses', async () => {
  const denied = await handler(async () => new Response('unauthorized', { status: 401, headers: { 'WWW-Authenticate': 'Bearer' } }))
    .GET(new Request('https://web.test/api/me'), context('me'));
  assert.equal(denied.status, 401);
  assert.equal(denied.headers.get('WWW-Authenticate'), 'Bearer');
  const deleted = await handler(async () => new Response(null, { status: 204 }))
    .DELETE(new Request('https://web.test/api/me', { method: 'DELETE' }), context('me'));
  assert.equal(deleted.status, 204);
  assert.equal(await deleted.text(), '');
});
test('proxy rejects redirects, traversal and missing production configuration', async () => {
  const request = new Request('https://web.test/api/me');
  assert.equal((await handler(async () => Response.redirect('https://elsewhere.test')).GET(request, context('me'))).status, 502);
  const never = () => { throw Error('must not fetch'); };
  assert.equal((await handler(never).GET(request, context('..'))).status, 400);
  assert.equal((await handler(never, { NODE_ENV: 'production' }).GET(request, context('me'))).status, 503);
});
