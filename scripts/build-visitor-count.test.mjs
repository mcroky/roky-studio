import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, rm } from 'node:fs/promises';

const output = new URL('../visitor-count.json', import.meta.url);
const originalFetch = globalThis.fetch;
const originalAccount = process.env.CF_ACCOUNT_ID;
const originalToken = process.env.CF_ANALYTICS_TOKEN;

test('the deployed snapshot contains validated counts and no API secret', async () => {
  process.env.CF_ACCOUNT_ID = 'test-account';
  process.env.CF_ANALYTICS_TOKEN = 'test-secret-never-publish';
  let request;
  globalThis.fetch = async (url, options) => {
    request = { url, options };
    return { ok: true, json: async () => ({ data: { viewer: { accounts: [{
      today: [{ sum: { visits: 3 } }],
      last7Days: [{ sum: { visits: 17 } }],
    }] } } }) };
  };

  try {
    await import('./build-visitor-count.mjs?test=valid');
    const contents = await readFile(output, 'utf8');
    const snapshot = JSON.parse(contents);
    assert.equal(snapshot.todayVisits, 3);
    assert.equal(snapshot.last7DaysVisits, 17);
    assert.equal(contents.includes('test-secret-never-publish'), false);
    assert.equal(request.url, 'https://api.cloudflare.com/client/v4/graphql');
    assert.equal(request.options.headers.Authorization, 'Bearer test-secret-never-publish');
    const body = JSON.parse(request.options.body);
    assert.equal(body.variables.siteTag, '09826592d2774b24b31f74a1ad6bc33b');
    assert.equal(body.variables.accountTag, 'test-account');
  } finally {
    globalThis.fetch = originalFetch;
    await rm(output, { force: true });
  }
});

test('a failed Cloudflare response leaves no public snapshot', async () => {
  process.env.CF_ACCOUNT_ID = 'test-account';
  process.env.CF_ANALYTICS_TOKEN = 'test-secret-never-publish';
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ errors: [{ message: 'forbidden' }] }) });

  try {
    await assert.rejects(import('./build-visitor-count.mjs?test=error'), /Cloudflare analytics query failed/);
    await assert.rejects(readFile(output, 'utf8'), { code: 'ENOENT' });
  } finally {
    globalThis.fetch = originalFetch;
    if (originalAccount === undefined) delete process.env.CF_ACCOUNT_ID;
    else process.env.CF_ACCOUNT_ID = originalAccount;
    if (originalToken === undefined) delete process.env.CF_ANALYTICS_TOKEN;
    else process.env.CF_ANALYTICS_TOKEN = originalToken;
    await rm(output, { force: true });
  }
});
