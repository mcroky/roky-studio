const DAY_MS = 86400000;
const KST_MS = 9 * 3600000;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function nextDate(date, offset = 1) {
  if (!DATE_RE.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`))) throw new Error('Invalid archive date');
  return new Date(Date.parse(`${date}T00:00:00Z`) + offset * DAY_MS).toISOString().slice(0, 10);
}

export function validateHistory(history) {
  if (!history || history.method !== 'daily' || !DATE_RE.test(history.startDate) || !DATE_RE.test(history.lastArchivedDate) ||
      !Number.isSafeInteger(history.archivedVisits) || history.archivedVisits < 0) {
    throw new Error('Invalid visitor history');
  }
  if (history.startDate > nextDate(history.lastArchivedDate)) throw new Error('Visitor history has a gap');
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
  const dailyWindows = [];
  for (let day = queryDate; day <= now.toISOString().slice(0, 10); day = nextDate(day)) {
    const start = `${day}T00:00:00.000Z`;
    const next = `${nextDate(day)}T00:00:00.000Z`;
    dailyWindows.push({ date: day, start, end: next < now.toISOString() ? next : now.toISOString() });
  }
  return {
    date,
    queryDate,
    queryStart: `${queryDate}T00:00:00.000Z`,
    todayStart: new Date(`${date}T00:00:00+09:00`).toISOString(),
    end: now.toISOString(),
    dailyWindows,
  };
}

function validVisits(value) {
  return Number.isSafeInteger(value) && value >= 0;
}

export function retainVisitorCounts(previous, counts, windows) {
  const dailyVisits = {};
  for (const { date } of windows.dailyWindows) {
    const known = previous?.dailyVisits?.[date] ?? 0;
    const observed = counts.dailyVisits[date] ?? 0;
    if (!validVisits(known) || !validVisits(observed)) throw new Error('Invalid retained daily visits');
    const visits = Math.max(known, observed);
    if (visits > 0) dailyVisits[date] = visits;
  }
  const knownToday = previous?.snapshot?.date === windows.date ? previous.snapshot.todayVisits : 0;
  if (!validVisits(knownToday) || !validVisits(counts.todayVisits)) throw new Error('Invalid retained today visits');
  return { todayVisits: Math.max(knownToday, counts.todayVisits), dailyVisits };
}

export function parseVisitorResponse(payload, windows) {
  if (payload?.errors?.length) throw new Error('Cloudflare analytics query failed');
  const accounts = payload?.data?.viewer?.accounts;
  if (!Array.isArray(accounts) || accounts.length !== 1) throw new Error('Cloudflare analytics account not found');
  const account = accounts[0];
  const { today } = account;
  if (!Array.isArray(today) || today.length > 1) {
    throw new Error('Invalid analytics groups');
  }
  const todayVisits = today.length ? today[0]?.sum?.visits : 0;
  if (!validVisits(todayVisits)) throw new Error('Invalid today visits');
  const dailyVisits = {};
  for (let i = 0; i < windows.dailyWindows.length; i += 1) {
    const groups = account[`d${i}`];
    if (!Array.isArray(groups) || groups.length > 1) throw new Error('Invalid daily groups');
    const visits = groups.length ? groups[0]?.sum?.visits : 0;
    if (!validVisits(visits)) throw new Error('Invalid daily visits');
    if (visits > 0) dailyVisits[windows.dailyWindows[i].date] = visits;
  }
  return { todayVisits, dailyVisits };
}

export function buildVisitorSnapshot(history, counts, windows) {
  validateHistory(history);
  const archiveThrough = nextDate(windows.end.slice(0, 10), -4);
  let archivedVisits = history.archivedVisits;
  for (let date = windows.queryDate; date <= archiveThrough; date = nextDate(date)) {
    archivedVisits += counts.dailyVisits[date] ?? 0;
  }
  const lastArchivedDate = archiveThrough > history.lastArchivedDate ? archiveThrough : history.lastArchivedDate;
  const nextHistory = { method: 'daily', startDate: history.startDate, lastArchivedDate, archivedVisits };
  validateHistory(nextHistory);
  const totalVisits = archivedVisits +
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
