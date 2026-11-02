import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, rm, writeFile } from 'node:fs/promises';

const output = new URL('../visitor-count.json', import.meta.url);
const historyUrl = new URL('../visitor-history.json', import.meta.url);
const originalHistory = await readFile(historyUrl, 'utf8');
const originalFetch = globalThis.fetch;
const originalAccount = process.env.CF_ACCOUNT_ID;
const originalToken = process.env.CF_ANALYTICS_TOKEN;

test('the deployed snapshot contains validated counts and no API secret', async () => {
  process.env.CF_ACCOUNT_ID = 'test-account';
  process.env.CF_ANALYTICS_TOKEN = 'test-secret-never-publish';
  let request;
  globalThis.fetch = async (url, options) => {
    if (String(url).includes('visitor-history.json')) return {
      ok: true,
      json: async () => ({ startDate: '2026-10-21', lastArchivedDate: '2026-10-26', days: {} }),
    };
    request = { url, options };
    const aliases = [...JSON.parse(options.body).query.matchAll(/\bd(\d+): rumPageloadEventsAdaptiveGroups/g)].map((match) => `d${match[1]}`);
    const days = Object.fromEntries(aliases.map((alias) => [alias, []]));
    days[aliases.at(-1)] = [{ sum: { visits: 17 } }];
    return { ok: true, json: async () => ({ data: { viewer: { accounts: [{
      today: [{ sum: { visits: 3 } }],
      ...days,
    }] } } }) };
  };

  try {
    await import('./build-visitor-count.mjs?test=valid');
    const contents = await readFile(output, 'utf8');
    const snapshot = JSON.parse(contents);
    assert.equal(snapshot.todayVisits, 3);
    assert.equal(snapshot.totalVisits, 17);
    assert.equal(contents.includes('test-secret-never-publish'), false);
    assert.equal(request.url, 'https://api.cloudflare.com/client/v4/graphql');
    assert.equal(request.options.headers.Authorization, 'Bearer test-secret-never-publish');
    const body = JSON.parse(request.options.body);
    assert.match(body.query, /requestPath_like: "\/roky-studio\/%"/);
    assert.match(body.query, /datetime_geq: "2026-10-21T00:00:00.000Z"/);
    assert.equal(body.variables.accountTag, 'test-account');
  } finally {
    globalThis.fetch = originalFetch;
    await writeFile(historyUrl, originalHistory);
    await rm(output, { force: true });
  }
});

test('a failed Cloudflare response leaves no public snapshot', async () => {
  process.env.CF_ACCOUNT_ID = 'test-account';
  process.env.CF_ANALYTICS_TOKEN = 'test-secret-never-publish';
  globalThis.fetch = async (url) => String(url).includes('visitor-history.json')
    ? { ok: true, json: async () => JSON.parse(originalHistory) }
    : { ok: true, json: async () => ({ errors: [{ message: 'forbidden' }] }) };

  try {
    await assert.rejects(import('./build-visitor-count.mjs?test=error'), /Cloudflare analytics query failed/);
    await assert.rejects(readFile(output, 'utf8'), { code: 'ENOENT' });
  } finally {
    globalThis.fetch = originalFetch;
    await writeFile(historyUrl, originalHistory);
    if (originalAccount === undefined) delete process.env.CF_ACCOUNT_ID;
    else process.env.CF_ACCOUNT_ID = originalAccount;
    if (originalToken === undefined) delete process.env.CF_ANALYTICS_TOKEN;
    else process.env.CF_ANALYTICS_TOKEN = originalToken;
    await rm(output, { force: true });
  }
});
