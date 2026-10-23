import assert from 'node:assert/strict';
import { readFile, writeFile, unlink, access } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { setTimeout as delay } from 'node:timers/promises';

// Temporary fixtures prove publication without publishing the author's drafts.
// Exclusive writes protect any pre-existing content with the same filename.
const fixtures = [
  new URL('../content/work/static-fixture.mdx', import.meta.url),
  new URL('../content/projects/static-fixture.mdx', import.meta.url),
];
const created = [];
const runBuild = async () => {
  const child = spawn('npm', ['run', 'build'], { stdio: 'inherit' });
  const [code] = await once(child, 'exit');
  assert.equal(code, 0, 'Static build failed');
};
let server;
try {
  const work = await readFile(new URL('../content/work/ai-assisted-delivery.mdx', import.meta.url), 'utf8');
  await writeFile(fixtures[0], work.replace('draft: true', 'draft: false'), { flag: 'wx' });
  created.push(fixtures[0]);
  await writeFile(fixtures[1], '---\ntitle: Minimal project rendering fixture\ndraft: false\n---\n\nOnly required fields.\n', { flag: 'wx' });
  created.push(fixtures[1]);
  await runBuild();

  const html = await readFile(new URL('../dist/client/work/static-fixture/index.html', import.meta.url), 'utf8');
  assert.match(html, /metric-strip/);
  assert.match(html, /35\/40/);
  assert.match(html, /Not zero human intervention/);
  const minimal = await readFile(new URL('../dist/client/projects/static-fixture/index.html', import.meta.url), 'utf8');
  assert.doesNotMatch(minimal, /class="(?:entry-meta|tags|entry-links)"/);
  for (const route of ['work/ai-assisted-delivery', 'projects/keel']) {
    await assert.rejects(access(new URL(`../dist/client/${route}/index.html`, import.meta.url)), { code: 'ENOENT' });
  }
  for (const route of ['', 'work/', 'projects/']) {
    const listing = await readFile(new URL(`../dist/client/${route}index.html`, import.meta.url), 'utf8');
    assert.doesNotMatch(listing, /href="\/(?:work\/ai-assisted-delivery|projects\/keel)\//);
  }

  // Keep a real local read API available so draft rejection cannot pass merely
  // because the production renderer failed to contact its CMS.
  server = spawn('npx', ['tinacms', 'dev', '-c', 'node dist/server/entry.mjs'], {
    env: { ...process.env, HOST: '127.0.0.1', PORT: '4323' }, stdio: 'inherit', detached: true,
  });
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    try { if ((await fetch('http://127.0.0.1:4323/')).ok) { ready = true; break; } } catch {}
    await delay(250);
  }
  assert.ok(ready, 'Preview server did not start');
  for (const route of ['/preview/work/ai-assisted-delivery/', '/preview/projects/keel/', '/work/ai-assisted-delivery/', '/projects/keel/']) {
    const response = await fetch(`http://127.0.0.1:4323${route}?tina-edit=1`, { headers: { Cookie: '__tina_edit=1', 'Sec-Fetch-Dest': 'iframe' } });
    assert.equal(response.status, 404, route);
  }
  const published = await fetch('http://127.0.0.1:4323/tina-island/work?path=static-fixture.mdx', {
    method: 'POST', headers: { 'Content-Type': 'application/x-tina-preview+json' },
  });
  assert.equal(published.status, 200, 'Published island must render with the CMS available');
  assert.match(await published.text(), /35\/40/);
  for (const [collection, path] of [['work', 'ai-assisted-delivery.mdx'], ['project', 'keel.mdx']]) {
    const response = await fetch(`http://127.0.0.1:4323/tina-island/${collection}?path=${path}&preview=1`, {
      method: 'POST', headers: { 'Content-Type': 'application/x-tina-preview+json', Cookie: '__tina_edit=1', 'Sec-Fetch-Dest': 'iframe' },
    });
    assert.ok(!response.ok, 'Production must not serve draft HTML even with a forged preview request');
    assert.doesNotMatch(await response.text(), /Delivery outcomes|explicit handoff/);
  }
  console.log('Static publication, minimal fields, metric rendering, and production draft exclusion passed.');
} finally {
  if (server) { process.kill(-server.pid, 'SIGTERM'); await once(server, 'exit'); }
  await Promise.all(created.map((file) => unlink(file)));
  // Ensure the final artifact cannot accidentally include the test fixtures.
  if (created.length) await runBuild();
}
