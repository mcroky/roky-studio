import { readFile, writeFile } from 'node:fs/promises';
import { getVisitorWindows, parseVisitorResponse } from './visitor-count-core.mjs';

const accountTag = process.env.CF_ACCOUNT_ID;
const apiToken = process.env.CF_ANALYTICS_TOKEN;
if (!accountTag || !apiToken) throw new Error('Cloudflare analytics credentials are not configured');

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const beacon = html.match(/data-cf-beacon='([^']+)'/);
if (!beacon) throw new Error('Cloudflare beacon is missing from index.html');
const siteTag = JSON.parse(beacon[1]).token;
if (!/^[a-f0-9]{32}$/i.test(siteTag)) throw new Error('Invalid Cloudflare site tag');

const windows = getVisitorWindows();
const query = `query VisitorCounts($accountTag: String!, $siteTag: String!, $todayStart: Time!, $weekStart: Time!, $end: Time!) {
  viewer {
    accounts(filter: { accountTag: $accountTag }) {
      today: rumPageloadEventsAdaptiveGroups(
        filter: { siteTag: $siteTag, datetime_geq: $todayStart, datetime_lt: $end }
        limit: 1
      ) { sum { visits } }
      last7Days: rumPageloadEventsAdaptiveGroups(
        filter: { siteTag: $siteTag, datetime_geq: $weekStart, datetime_lt: $end }
        limit: 1
      ) { sum { visits } }
    }
  }
}`;

const response = await fetch('https://api.cloudflare.com/client/v4/graphql', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${apiToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query,
    variables: {
      accountTag,
      siteTag,
      todayStart: windows.todayStart,
      weekStart: windows.weekStart,
      end: windows.end,
    },
  }),
  signal: AbortSignal.timeout(15000),
});
if (!response.ok) throw new Error(`Cloudflare analytics HTTP ${response.status}`);

const counts = parseVisitorResponse(await response.json());
const snapshot = {
  date: windows.date,
  updatedAt: windows.end,
  ...counts,
};
await writeFile(new URL('../visitor-count.json', import.meta.url), `${JSON.stringify(snapshot)}\n`, 'utf8');
console.log(`Visitor snapshot generated for ${snapshot.date}`);
