import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const source = await readFile(new URL('../visitor-counter.js', import.meta.url), 'utf8');
const today = new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10);
const previous = { date: today, updatedAt: '2026-11-05T00:42:59Z', todayVisits: 3, totalVisits: 352, lastObservedDate: today };

async function displayedAfter(workerSnapshot) {
  const nodes = Object.fromEntries(['visitor-today-label', 'visitor-total-label', 'visitor-today',
    'visitor-total', 'visitor-counter-status'].map((id) => [id, { textContent: '' }]));
  const counter = { dataset: {}, setAttribute() {} };
  let workerCalls = 0;
  const context = {
    document: {
      baseURI: 'https://mcroky.github.io/roky-studio/',
      documentElement: { lang: 'ko' },
      hidden: false,
      querySelector: () => counter,
      getElementById: (id) => nodes[id],
      addEventListener() {},
    },
    window: { addEventListener() {} },
    fetch: async (url) => {
      const path = String(url);
      if (path.includes('visitor-count.json')) {
        await new Promise((resolve) => setTimeout(resolve, 5));
        return Response.json(previous);
      }
      if (path.includes('visitor-api.json')) return Response.json({ endpoint: 'https://roky-studio-visits.example.workers.dev/visits' });
      workerCalls += 1;
      return Response.json(workerSnapshot);
    },
    URL, Date, Intl, Number, setInterval() {},
  };
  runInNewContext(source, context);
  await new Promise((resolve) => setTimeout(resolve, 20));
  return { today: nodes['visitor-today'].textContent, total: nodes['visitor-total'].textContent, workerCalls };
}

test('a newer but lower Worker result cannot replace the displayed 3 / 352', async () => {
  const result = await displayedAfter({ ...previous, updatedAt: '2026-11-05T02:07:00Z', todayVisits: 0, totalVisits: 276 });
  assert.equal(result.workerCalls, 1);
  assert.equal(result.today, '3');
  assert.equal(result.total, '352');
});

test('a higher Worker result replaces the older snapshot', async () => {
  const result = await displayedAfter({ ...previous, updatedAt: '2026-11-05T02:11:00Z', todayVisits: 26, totalVisits: 375 });
  assert.equal(result.today, '26');
  assert.equal(result.total, '375');
});
