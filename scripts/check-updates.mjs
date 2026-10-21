import assert from 'node:assert/strict';
import { parseHero, parseTennis, parseStress } from '../updates.mjs';

const origin = 'https://mcroky.github.io';
async function read(path) {
  const response = await fetch(new URL(path, origin));
  assert.equal(response.status, 200, `${path} should be public`);
  return response.text();
}

const heroPage = await read('/hero-world-site/');
const heroAsset = heroPage.match(/src="\.\/assets\/(index-[^"/]+\.js)"/)?.[1];
assert.ok(heroAsset, 'Hero World bundle should be linked from its homepage');

const [hero, tennis, stress, workitPage] = await Promise.all([
  read(`/hero-world-site/assets/${heroAsset}`).then(parseHero),
  read('/tomorrow-table-tennis/club-updates.js').then(parseTennis),
  read('/stress-break-3d/app.js').then(parseStress),
  read('/workit/updates/'),
]);

for (const [name, releases] of Object.entries({ hero, tennis, stress })) {
  assert.ok(releases.length >= 2, `${name} should contain history`);
  assert.match(releases[0].date, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(releases[0].title && releases[0].changes.length);
  console.log(`${name}: ${releases[0].date} ${releases[0].title}`);
}
assert.match(workitPage, /class="updates-list"/);
assert.match(workitPage, /datetime="2026-10-21"|dateTime="2026-10-21"/);
console.log('workit: public update page available');
