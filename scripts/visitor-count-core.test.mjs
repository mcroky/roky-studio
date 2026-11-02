import test from 'node:test';
import assert from 'node:assert/strict';
import { getVisitorWindows, parseVisitorResponse } from './visitor-count-core.mjs';

test('Korean day starts at 00:00 KST and seven days include today', () => {
  const windows = getVisitorWindows(new Date('2026-11-01T15:20:00Z'));
  assert.equal(windows.date, '2026-11-02');
  assert.equal(windows.todayStart, '2026-11-01T15:00:00.000Z');
  assert.equal(windows.weekStart, '2026-10-26T15:00:00.000Z');
});

test('an empty analytics group is a real zero', () => {
  assert.deepEqual(parseVisitorResponse({ data: { viewer: { accounts: [{ today: [], last7Days: [] }] } } }), {
    todayVisits: 0,
    last7DaysVisits: 0,
  });
});

test('valid visits are read from the two Cloudflare groups', () => {
  assert.deepEqual(parseVisitorResponse({ data: { viewer: { accounts: [{
    today: [{ sum: { visits: 7 } }],
    last7Days: [{ sum: { visits: 25 } }],
  }] } } }), { todayVisits: 7, last7DaysVisits: 25 });
});

test('API errors and malformed counts never become published zeroes', () => {
  assert.throws(() => parseVisitorResponse({ errors: [{ message: 'Forbidden' }] }));
  assert.throws(() => parseVisitorResponse({ data: { viewer: { accounts: [] } } }));
  assert.throws(() => parseVisitorResponse({ data: { viewer: { accounts: [{ today: [{ sum: {} }], last7Days: [] }] } } }));
  assert.throws(() => parseVisitorResponse({ data: { viewer: { accounts: [{ today: [{ sum: { visits: -1 } }], last7Days: [] }] } } }));
});
