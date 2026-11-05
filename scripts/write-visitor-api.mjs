import { writeFile } from 'node:fs/promises';
import { validateHistory } from './visitor-count-core.mjs';

const url = process.env.VISITOR_WORKER_URL?.trim();
const endpoint = url && /^https:\/\/[a-z0-9.-]+\.workers\.dev\/?$/i.test(url)
  ? `${url.replace(/\/$/, '')}/visits`
  : null;
if (process.env.REQUIRE_VISITOR_WORKER === 'true' && !endpoint) throw new Error('Worker deployed without a usable URL');
if (endpoint) {
  const response = await fetch(endpoint, { signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`Visitor Worker HTTP ${response.status}`);
  const { history, stale, ...snapshot } = await response.json();
  validateHistory(history);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(snapshot.date) ||
      !Number.isFinite(Date.parse(snapshot.updatedAt)) ||
      !Number.isSafeInteger(snapshot.todayVisits) || snapshot.todayVisits < 0 ||
      !Number.isSafeInteger(snapshot.totalVisits) || snapshot.totalVisits < 0) {
    throw new Error('Visitor Worker returned an invalid snapshot');
  }
  if (stale) console.warn('Visitor Worker returned its last verified snapshot');
  await writeFile(new URL('../visitor-history.json', import.meta.url), `${JSON.stringify(history, null, 2)}\n`, 'utf8');
  await writeFile(new URL('../visitor-count.json', import.meta.url), `${JSON.stringify(snapshot)}\n`, 'utf8');
}
await writeFile(new URL('../visitor-api.json', import.meta.url), `${JSON.stringify({ endpoint })}\n`, 'utf8');
console.log(endpoint ? 'Visitor Worker endpoint configured' : 'Visitor Worker endpoint pending; static snapshot remains available');
