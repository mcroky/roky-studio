const DAY_MS = 86400000;
const KST_MS = 9 * 3600000;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function nextDate(date, offset = 1) {
  if (!DATE_RE.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`))) throw new Error('Invalid archive date');
  return new Date(Date.parse(`${date}T00:00:00Z`) + offset * DAY_MS).toISOString().slice(0, 10);
}

export function validateHistory(history) {
  if (!history || !DATE_RE.test(history.startDate) || !DATE_RE.test(history.lastArchivedDate) ||
      typeof history.days !== 'object' || history.days === null || Array.isArray(history.days)) {
    throw new Error('Invalid visitor history');
  }
  if (history.startDate > nextDate(history.lastArchivedDate)) throw new Error('Visitor history has a gap');
  for (const [date, visits] of Object.entries(history.days)) {
    if (!DATE_RE.test(date) || date < history.startDate || date > history.lastArchivedDate ||
        !Number.isSafeInteger(visits) || visits < 0) throw new Error('Invalid archived visits');
  }
  for (let date = history.startDate; date <= history.lastArchivedDate; date = nextDate(date)) {
    if (!Object.hasOwn(history.days, date)) throw new Error('Visitor history has a gap');
  }
}

export function getVisitorWindows(history, now = new Date()) {
  if (!Number.isFinite(now.getTime())) throw new TypeError('Invalid date');
  validateHistory(history);
  const date = new Date(now.getTime() + KST_MS).toISOString().slice(0, 10);
  const queryDate = nextDate(history.lastArchivedDate);
  if (queryDate > now.toISOString().slice(0, 10)) throw new Error('Archive date is in the future');
  if (now.getTime() - Date.parse(`${queryDate}T00:00:00Z`) > 31 * DAY_MS) {
    throw new Error('Visitor history is too stale for one Cloudflare query');
  }
  return {
    date,
    queryDate,
    queryStart: `${queryDate}T00:00:00.000Z`,
    todayStart: new Date(`${date}T00:00:00+09:00`).toISOString(),
    end: now.toISOString(),
  };
}

function validVisits(value) {
  return Number.isSafeInteger(value) && value >= 0;
}

export function parseVisitorResponse(payload, windows) {
  if (payload?.errors?.length) throw new Error('Cloudflare analytics query failed');
  const accounts = payload?.data?.viewer?.accounts;
  if (!Array.isArray(accounts) || accounts.length !== 1) throw new Error('Cloudflare analytics account not found');
  const { today, days } = accounts[0];
  if (!Array.isArray(today) || today.length > 1 || !Array.isArray(days) || days.length > 32) {
    throw new Error('Invalid analytics groups');
  }
  const todayVisits = today.length ? today[0]?.sum?.visits : 0;
  if (!validVisits(todayVisits)) throw new Error('Invalid today visits');
  const dailyVisits = {};
  const nowDate = windows.end.slice(0, 10);
  for (const group of days) {
    const date = group?.dimensions?.date;
    const visits = group?.sum?.visits;
    if (!DATE_RE.test(date) || date < windows.queryDate || date > nowDate ||
        Object.hasOwn(dailyVisits, date) || !validVisits(visits)) throw new Error('Invalid daily visits');
    dailyVisits[date] = visits;
  }
  return { todayVisits, dailyVisits };
}

export function buildVisitorSnapshot(history, counts, windows) {
  validateHistory(history);
  const archiveThrough = nextDate(windows.end.slice(0, 10), -7);
  const days = { ...history.days };
  for (let date = windows.queryDate; date <= archiveThrough; date = nextDate(date)) {
    days[date] = counts.dailyVisits[date] ?? 0;
  }
  const lastArchivedDate = archiveThrough > history.lastArchivedDate ? archiveThrough : history.lastArchivedDate;
  const nextHistory = { startDate: history.startDate, lastArchivedDate, days };
  validateHistory(nextHistory);
  const totalVisits = Object.values(days).reduce((sum, value) => sum + value, 0) +
    Object.entries(counts.dailyVisits).reduce((sum, [date, value]) => sum + (date > lastArchivedDate ? value : 0), 0);
  if (!validVisits(totalVisits)) throw new Error('Invalid total visits');
  return {
    history: nextHistory,
    snapshot: {
      date: windows.date,
      updatedAt: windows.end,
      todayVisits: counts.todayVisits,
      totalVisits,
      lastObservedDate: Object.keys(counts.dailyVisits).sort().at(-1) || history.lastArchivedDate,
    },
  };
}
