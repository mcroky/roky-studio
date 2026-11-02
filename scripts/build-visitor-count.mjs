import { readFile, writeFile } from 'node:fs/promises';
import { buildVisitorSnapshot, getVisitorWindows, parseVisitorResponse } from './visitor-count-core.mjs';

const accountTag = process.env.CF_ACCOUNT_ID;
const apiToken = process.env.CF_ANALYTICS_TOKEN;
if (!accountTag || !apiToken) throw new Error('Cloudflare analytics credentials are not configured');

const historyUrl = new URL('../visitor-history.json', import.meta.url);
let history = JSON.parse(await readFile(historyUrl, 'utf8'));
const publishedHistory = await fetch(`https://mcroky.github.io/roky-studio/visitor-history.json?check=${Date.now()}`, {
  headers: { Accept: 'application/json' },
  signal: AbortSignal.timeout(15000),
});
if (publishedHistory.ok) {
  const previous = await publishedHistory.json();
  if (previous.method === 'daily') history = previous;
} else if (publishedHistory.status !== 404 || new Date().toISOString().slice(0, 10) > '2026-11-03') {
  throw new Error(`Published visitor history unavailable: HTTP ${publishedHistory.status}`);
}
const windows = getVisitorWindows(history);
const dailyFields = windows.dailyWindows.map((day, i) => `d${i}: rumPageloadEventsAdaptiveGroups(
        filter: { requestHost: "mcroky.github.io", requestPath_like: "/roky-studio/%", datetime_geq: "${day.start}", datetime_lt: "${day.end}" }
        limit: 1
      ) { sum { visits } }`).join('\n');
const query = `query VisitorCounts($accountTag: String!, $todayStart: Time!, $end: Time!) {
  viewer {
    accounts(filter: { accountTag: $accountTag }) {
      today: rumPageloadEventsAdaptiveGroups(
        filter: { requestHost: "mcroky.github.io", requestPath_like: "/roky-studio/%", datetime_geq: $todayStart, datetime_lt: $end }
        limit: 1
      ) { sum { visits } }
      ${dailyFields}
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
      todayStart: windows.todayStart,
      end: windows.end,
    },
  }),
  signal: AbortSignal.timeout(15000),
});
if (!response.ok) throw new Error(`Cloudflare analytics HTTP ${response.status}`);

const counts = parseVisitorResponse(await response.json(), windows);
const { history: nextHistory, snapshot } = buildVisitorSnapshot(history, counts, windows);
await writeFile(historyUrl, `${JSON.stringify(nextHistory, null, 2)}\n`, 'utf8');
await writeFile(new URL('../visitor-count.json', import.meta.url), `${JSON.stringify(snapshot)}\n`, 'utf8');
console.log(`Visitor snapshot generated through ${snapshot.lastObservedDate}; ${snapshot.totalVisits} cumulative visits`);
