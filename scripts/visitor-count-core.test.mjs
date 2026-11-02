import test from 'node:test';
import assert from 'node:assert/strict';
import { buildVisitorSnapshot, getVisitorWindows, parseVisitorResponse } from './visitor-count-core.mjs';

const history = { startDate: '2026-10-21', lastArchivedDate: '2026-10-20', days: {} };
const now = new Date('2026-11-02T09:00:00Z');
const windows = getVisitorWindows(history, now);

test('Korean today and UTC archive query have distinct boundaries', () => {
  assert.equal(windows.date, '2026-11-02');
  assert.equal(windows.todayStart, '2026-11-01T15:00:00.000Z');
  assert.equal(windows.queryStart, '2026-10-21T00:00:00.000Z');
});

test('bootstrap archives old days and counts recent days once', () => {
  const counts = parseVisitorResponse({ data: { viewer: { accounts: [{
    today: [{ sum: { visits: 2 } }],
    days: [
      { dimensions: { date: '2026-10-22' }, sum: { visits: 10 } },
      { dimensions: { date: '2026-10-31' }, sum: { visits: 7 } },
      { dimensions: { date: '2026-11-02' }, sum: { visits: 2 } },
    ],
  }] } } }, windows);
  const first = buildVisitorSnapshot(history, counts, windows);
  assert.equal(first.history.lastArchivedDate, '2026-10-26');
  assert.equal(first.history.days['2026-10-21'], 0);
  assert.equal(first.history.days['2026-10-22'], 10);
  assert.equal(first.snapshot.totalVisits, 19);

  const secondWindows = getVisitorWindows(first.history, now);
  const second = buildVisitorSnapshot(first.history, {
    todayVisits: 2, dailyVisits: { '2026-10-31': 7, '2026-11-02': 2 },
  }, secondWindows);
  assert.equal(second.snapshot.totalVisits, 19);

  const nextDay = getVisitorWindows(first.history, new Date('2026-11-03T09:00:00Z'));
  const advanced = buildVisitorSnapshot(first.history, {
    todayVisits: 0, dailyVisits: { '2026-10-27': 5, '2026-10-31': 7, '2026-11-02': 2 },
  }, nextDay);
  assert.equal(advanced.history.lastArchivedDate, '2026-10-27');
  assert.equal(advanced.snapshot.totalVisits, 24);
});

test('invalid or stale Cloudflare data cannot replace a snapshot', () => {
  assert.throws(() => parseVisitorResponse({ errors: [{ message: 'Forbidden' }] }, windows));
  assert.throws(() => parseVisitorResponse({ data: { viewer: { accounts: [] } } }, windows));
  assert.throws(() => parseVisitorResponse({ data: { viewer: { accounts: [{ today: [], days: [
    { dimensions: { date: '2026-10-22' }, sum: { visits: -1 } },
  ] }] } } }, windows));
  assert.throws(() => getVisitorWindows(history, new Date('2027-01-01T00:00:00Z')), /too stale/);
});
