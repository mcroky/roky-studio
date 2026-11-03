import { buildVisitorSnapshot, getVisitorWindows, parseVisitorResponse, validateHistory } from '../scripts/visitor-count-core.mjs';

const HOME_ORIGIN = 'https://mcroky.github.io';
const HISTORY_URL = `${HOME_ORIGIN}/roky-studio/visitor-history.json`;
const ANALYTICS_URL = 'https://api.cloudflare.com/client/v4/graphql';
const REFRESH_MS = 10 * 60 * 1000;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': HOME_ORIGIN,
      'Vary': 'Origin',
    },
  });
}

function isCurrent(snapshot, now) {
  return snapshot && snapshot.date === new Date(now.getTime() + 9 * 3600000).toISOString().slice(0, 10) &&
    now.getTime() - Date.parse(snapshot.updatedAt) < REFRESH_MS &&
    now.getTime() >= Date.parse(snapshot.updatedAt);
}

async function loadInitialHistory() {
  const response = await fetch(`${HISTORY_URL}?bootstrap=${Date.now()}`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`Published history unavailable: HTTP ${response.status}`);
  const history = await response.json();
  validateHistory(history);
  return history;
}

async function queryAnalytics(history, env, now) {
  if (!env.CF_ANALYTICS_TOKEN || !env.CF_ACCOUNT_ID) throw new Error('Analytics credentials are missing');
  const windows = getVisitorWindows(history, now);
  const dailyFields = windows.dailyWindows.map((day, i) => `d${i}: rumPageloadEventsAdaptiveGroups(
    filter: { requestHost: "mcroky.github.io", requestPath_like: "/roky-studio/%", datetime_geq: "${day.start}", datetime_lt: "${day.end}" }
    limit: 1
  ) { sum { visits } }`).join('\n');
  const query = `query VisitorCounts($accountTag: String!, $todayStart: Time!, $end: Time!) {
    viewer { accounts(filter: { accountTag: $accountTag }) {
      today: rumPageloadEventsAdaptiveGroups(
        filter: { requestHost: "mcroky.github.io", requestPath_like: "/roky-studio/%", datetime_geq: $todayStart, datetime_lt: $end }
        limit: 1
      ) { sum { visits } }
      ${dailyFields}
    } }
  }`;
  const response = await fetch(ANALYTICS_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.CF_ANALYTICS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { accountTag: env.CF_ACCOUNT_ID, todayStart: windows.todayStart, end: windows.end } }),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`Cloudflare analytics HTTP ${response.status}`);
  return buildVisitorSnapshot(history, parseVisitorResponse(await response.json(), windows), windows);
}

export class VisitorLedger {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
    this.inFlight = null;
  }

  async refresh(previous, now) {
    const history = previous?.history ?? await loadInitialHistory();
    const result = await queryAnalytics(history, this.env, now);
    const state = { history: result.history, snapshot: result.snapshot };
    await this.ctx.storage.put('ledger', state);
    return state;
  }

  async fetch() {
    const now = new Date();
    const previous = await this.ctx.storage.get('ledger');
    if (isCurrent(previous?.snapshot, now)) return json({ ...previous.snapshot, history: previous.history });
    if (!this.inFlight) {
      this.inFlight = this.refresh(previous, now).finally(() => { this.inFlight = null; });
    }
    try {
      const current = await this.inFlight;
      return json({ ...current.snapshot, history: current.history });
    } catch (error) {
      console.error('Visitor refresh failed', error);
      if (previous?.snapshot) return json({ ...previous.snapshot, history: previous.history, stale: true });
      return json({ error: 'Visitor count temporarily unavailable' }, 503);
    }
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method !== 'GET' || url.pathname !== '/visits') return json({ error: 'Not found' }, 404);
    const origin = request.headers.get('Origin');
    if (origin && origin !== HOME_ORIGIN) return json({ error: 'Forbidden' }, 403);
    const id = env.VISITOR_LEDGER.idFromName('roky-studio');
    return env.VISITOR_LEDGER.get(id).fetch(request);
  },
  async scheduled(_event, env) {
    const id = env.VISITOR_LEDGER.idFromName('roky-studio');
    await env.VISITOR_LEDGER.get(id).fetch('https://roky-studio-visits.internal/visits');
  },
};
