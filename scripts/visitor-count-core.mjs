const SEOUL_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export function getVisitorWindows(now = new Date()) {
  if (!Number.isFinite(now.getTime())) throw new TypeError('Invalid date');

  const seoulDay = new Date(now.getTime() + SEOUL_OFFSET_MS).toISOString().slice(0, 10);
  const todayStart = new Date(`${seoulDay}T00:00:00+09:00`);
  const weekStart = new Date(todayStart.getTime() - 6 * DAY_MS);

  return {
    date: seoulDay,
    todayStart: todayStart.toISOString(),
    weekStart: weekStart.toISOString(),
    end: now.toISOString(),
  };
}

function readVisits(groups, label) {
  if (!Array.isArray(groups) || groups.length > 1) throw new Error(`Invalid ${label} analytics groups`);
  if (groups.length === 0) return 0;

  const visits = groups[0]?.sum?.visits;
  if (typeof visits !== 'number' || !Number.isFinite(visits) || visits < 0) {
    throw new Error(`Invalid ${label} visits`);
  }
  return Math.round(visits);
}

export function parseVisitorResponse(payload) {
  if (payload?.errors?.length) throw new Error('Cloudflare analytics query failed');

  const accounts = payload?.data?.viewer?.accounts;
  if (!Array.isArray(accounts) || accounts.length !== 1) {
    throw new Error('Cloudflare analytics account not found');
  }

  return {
    todayVisits: readVisits(accounts[0].today, 'today'),
    last7DaysVisits: readVisits(accounts[0].last7Days, 'last7Days'),
  };
}
