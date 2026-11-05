import assert from 'node:assert/strict';
import test from 'node:test';
import { VisitorLedger } from './index.mjs';
import { nextDate } from '../scripts/visitor-count-core.mjs';

function harness(initial) {
  let stored = initial;
  let writes = 0;
  return {
    ledger: new VisitorLedger({ storage: {
      get: async () => stored,
      put: async (_key, value) => { stored = value; writes += 1; },
    } }, { CF_ANALYTICS_TOKEN: 'test-token', CF_ACCOUNT_ID: 'test-account' }),
    read: () => stored,
    writes: () => writes,
  };
}

test('first visit seeds published archive, refreshes analytics, and caches the result', async (t) => {
  const utcToday = new Date().toISOString().slice(0, 10);
  const archiveDate = nextDate(utcToday, -5);
  const history = { method: 'daily', startDate: '2026-10-21', lastArchivedDate: archiveDate, archivedVisits: 213 };
  let historyCalls = 0;
  let analyticsCalls = 0;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    if (String(url).includes('visitor-history.json')) {
      historyCalls += 1;
      return Response.json(history);
    }
    analyticsCalls += 1;
    const query = JSON.parse(options.body).query;
    const daily = Object.fromEntries([...query.matchAll(/d(\d+): rumPageloadEventsAdaptiveGroups/g)]
      .map((match) => [`d${match[1]}`, [{ sum: { visits: 1 } }]]));
    return Response.json({ data: { viewer: { accounts: [{ today: [{ sum: { visits: 1 } }], ...daily }] } } });
  };
  t.after(() => { globalThis.fetch = originalFetch; });

  const { ledger, read, writes } = harness();
  const [first, second, third] = await Promise.all([ledger.fetch(), ledger.fetch(), ledger.fetch()]);
  assert.equal((await second.json()).totalVisits, 218);
  assert.equal((await third.json()).totalVisits, 218);
  const firstCounts = await first.json();
  assert.equal(firstCounts.totalVisits, 218);
  assert.equal(read().history.archivedVisits, 214);
  assert.equal(writes(), 1);
  assert.equal((await (await ledger.fetch()).json()).totalVisits, 218);
  assert.equal(historyCalls, 1);
  assert.equal(analyticsCalls, 1);
  assert.equal(writes(), 1);
});

test('failed refresh serves the last stored count without changing the archive', async (t) => {
  const today = new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10);
  const state = {
    history: { method: 'daily', startDate: '2026-10-21', lastArchivedDate: nextDate(new Date().toISOString().slice(0, 10), -5), archivedVisits: 213 },
    snapshot: { date: today, updatedAt: '2026-10-25T00:00:00.000Z', todayVisits: 3, totalVisits: 216, lastObservedDate: today },
  };
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('Cloudflare unavailable'); };
  t.after(() => { globalThis.fetch = originalFetch; });
  const { ledger, read, writes } = harness(state);
  const response = await ledger.fetch();
  assert.equal(response.status, 200);
  assert.equal((await response.json()).stale, true);
  assert.deepEqual(read(), state);
  assert.equal(writes(), 0);
});

test('temporary empty Cloudflare groups cannot replace a known higher snapshot', async (t) => {
  const utcToday = new Date().toISOString().slice(0, 10);
  const kstToday = new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10);
  const state = {
    history: { method: 'daily', startDate: '2026-10-21', lastArchivedDate: nextDate(utcToday, -4), archivedVisits: 236 },
    snapshot: { date: kstToday, updatedAt: '2026-11-05T00:00:00.000Z', todayVisits: 3, totalVisits: 352, lastObservedDate: utcToday },
  };
  let recovered = false;
  const originalFetch = globalThis.fetch;
  const originalError = console.error;
  console.error = () => {};
  globalThis.fetch = async (_url, options) => {
    const daily = Object.fromEntries([...JSON.parse(options.body).query.matchAll(/d(\d+): rumPageloadEventsAdaptiveGroups/g)]
      .map((match) => [`d${match[1]}`, recovered ? [{ sum: { visits: 30 } }] : []]));
    return Response.json({ data: { viewer: { accounts: [{ today: recovered ? [{ sum: { visits: 23 } }] : [], ...daily }] } } });
  };
  t.after(() => { globalThis.fetch = originalFetch; console.error = originalError; });

  const { ledger, read, writes } = harness(state);
  const rejected = await (await ledger.fetch()).json();
  assert.equal(rejected.stale, true);
  assert.equal(rejected.todayVisits, 3);
  assert.equal(rejected.totalVisits, 352);
  assert.deepEqual(read(), state);
  assert.equal(writes(), 0);

  recovered = true;
  const accepted = await (await ledger.fetch()).json();
  assert.equal(accepted.todayVisits, 23);
  assert.equal(accepted.totalVisits, 356);
  assert.equal(writes(), 1);
});

test('known daily counts survive a lower reading even while other days rise', async (t) => {
  const utcToday = new Date().toISOString().slice(0, 10);
  const kstToday = new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10);
  const knownDate = nextDate(utcToday, -2);
  const state = {
    history: { method: 'daily', startDate: '2026-10-21', lastArchivedDate: nextDate(utcToday, -3), archivedVisits: 236 },
    snapshot: { date: kstToday, updatedAt: '2026-11-05T00:00:00.000Z', todayVisits: 1, totalVisits: 256, lastObservedDate: knownDate },
    dailyVisits: { [knownDate]: 20 },
  };
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (_url, options) => {
    const aliases = [...JSON.parse(options.body).query.matchAll(/d(\d+): rumPageloadEventsAdaptiveGroups/g)];
    const daily = Object.fromEntries(aliases.map((match, index) => [`d${match[1]}`,
      index === aliases.length - 1 ? [{ sum: { visits: 30 } }] : []]));
    return Response.json({ data: { viewer: { accounts: [{ today: [{ sum: { visits: 2 } }], ...daily }] } } });
  };
  t.after(() => { globalThis.fetch = originalFetch; });

  const { ledger, read } = harness(state);
  const response = await (await ledger.fetch()).json();
  assert.equal(response.totalVisits, 286);
  assert.equal(read().dailyVisits[knownDate], 20);
});
