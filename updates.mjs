// Read each project's public update data without executing fetched scripts.
export function parseLiteral(source, start) {
  let index = start;
  const skip = () => { while (/\s/.test(source[index] || '')) index++; };
  const string = () => {
    const quote = source[index++];
    let result = '';
    while (index < source.length) {
      const char = source[index++];
      if (char === quote) return result;
      if (char !== '\\') { result += char; continue; }
      const escaped = source[index++];
      if (escaped === 'u') {
        const code = source.slice(index, index + 4);
        if (!/^[0-9a-f]{4}$/i.test(code)) throw new Error('Invalid Unicode escape');
        result += String.fromCharCode(parseInt(code, 16)); index += 4;
      } else if (escaped === 'x') {
        const code = source.slice(index, index + 2);
        if (!/^[0-9a-f]{2}$/i.test(code)) throw new Error('Invalid hex escape');
        result += String.fromCharCode(parseInt(code, 16)); index += 2;
      } else {
        result += ({ n: '\n', r: '\r', t: '\t', b: '\b', f: '\f', v: '\v', '0': '\0' })[escaped] ?? escaped;
      }
    }
    throw new Error('Unclosed string');
  };
  const value = () => {
    skip();
    const char = source[index];
    if (char === '"' || char === "'") return string();
    if (char === '[') {
      index++;
      const values = [];
      skip();
      while (source[index] !== ']') {
        values.push(value()); skip();
        if (source[index] === ',') { index++; skip(); }
        else if (source[index] !== ']') throw new Error('Invalid array');
      }
      index++;
      return values;
    }
    if (char === '{') {
      index++;
      const object = Object.create(null);
      skip();
      while (source[index] !== '}') {
        let key;
        if (source[index] === '"' || source[index] === "'") key = string();
        else {
          const match = /^[\w$]+/.exec(source.slice(index));
          if (!match) throw new Error('Invalid object key');
          key = match[0]; index += key.length;
        }
        skip();
        if (source[index++] !== ':') throw new Error('Missing colon');
        object[key] = value(); skip();
        if (source[index] === ',') { index++; skip(); }
        else if (source[index] !== '}') throw new Error('Invalid object');
      }
      index++;
      return object;
    }
    const number = /^-?\d+(?:\.\d+)?/.exec(source.slice(index));
    if (number) { index += number[0].length; return Number(number[0]); }
    for (const word of ['true', 'false', 'null']) {
      if (source.startsWith(word, index)) { index += word.length; return JSON.parse(word); }
    }
    throw new Error('Unsupported update literal');
  };
  const result = value();
  return { value: result, end: index };
}

function assignedArray(source, name) {
  const match = new RegExp(`\\b(?:const|let|var)\\s+${name}\\s*=\\s*\\[`).exec(source);
  if (!match) throw new Error(`Missing ${name} updates`);
  return parseLiteral(source, match.index + match[0].length - 1).value;
}

function validRelease(entry) {
  return /^\d{4}-\d{2}-\d{2}$/.test(entry.date) && entry.title && Array.isArray(entry.changes);
}

export function parseHero(source) {
  const matches = source.matchAll(/\[\s*\{\s*version\s*:\s*["']/g);
  for (const match of matches) {
    try {
      const releases = parseLiteral(source, match.index).value;
      if (!Array.isArray(releases) || !releases[0]?.title?.ko || !releases[0]?.changes?.ko) continue;
      return releases.map(item => ({ version: item.version, date: item.date, title: item.title.ko, changes: item.changes.ko })).filter(validRelease);
    } catch { /* Try the next array-shaped literal. */ }
  }
  throw new Error('Hero World releases not found');
}

export function parseTennis(source) {
  return assignedArray(source, 'releases').map(item => ({ date: item.date, title: item.title?.[0], changes: item.items?.map(text => text[0]) })).filter(validRelease);
}

export function parseStress(source) {
  return assignedArray(source, 'changelog').map(item => ({ version: item.version, date: item.date?.replaceAll('.', '-'), title: item.changes?.[0], changes: item.changes })).filter(validRelease);
}

async function fetchText(path) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(path, { cache: 'no-cache', signal: controller.signal });
    if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
    return await response.text();
  } finally { clearTimeout(timer); }
}

async function loadHero() {
  const homepage = new DOMParser().parseFromString(await fetchText('/hero-world-site/'), 'text/html');
  const script = homepage.querySelector('script[type="module"][src*="/assets/index-"]');
  if (!script) throw new Error('Hero World bundle not found');
  const scriptUrl = new URL(script.getAttribute('src'), 'https://mcroky.github.io/hero-world-site/');
  if (scriptUrl.origin !== 'https://mcroky.github.io' || !scriptUrl.pathname.startsWith('/hero-world-site/assets/')) throw new Error('Unexpected Hero World asset');
  return parseHero(await fetchText(scriptUrl.pathname));
}

async function loadWorkit() {
  const page = new DOMParser().parseFromString(await fetchText('/workit/updates/'), 'text/html');
  const releases = [...page.querySelectorAll('.updates-list > li')].map(item => ({
    date: item.querySelector('time')?.getAttribute('datetime') || item.querySelector('time')?.getAttribute('dateTime'),
    title: item.querySelector('h2')?.textContent?.trim(),
    changes: [...item.querySelectorAll('ul li')].map(change => change.textContent.trim()),
  })).filter(validRelease);
  if (!releases.length) throw new Error('Workit releases not found');
  return releases;
}

const loaders = {
  music: async () => { const data=JSON.parse(await fetchText('/music-diary/updates.json')); if(!Array.isArray(data)) throw new Error('Invalid music diary updates'); const releases=data.filter(validRelease); if(!releases.length) throw new Error('Empty music diary updates'); return releases; },
  origin: async () => { const data=JSON.parse(await fetchText('/origin-check/updates.json')); if(!Array.isArray(data)) throw new Error('Invalid origin updates'); const releases=data.filter(validRelease); if(!releases.length) throw new Error('Empty origin updates'); return releases; },
  court: async () => { const data=JSON.parse(await fetchText('/court-rush/updates.json')); if(!Array.isArray(data)) throw new Error('Invalid Court Rush updates'); const releases=data.filter(validRelease); if(!releases.length) throw new Error('Empty Court Rush updates'); return releases; },
  workit: loadWorkit,
  hero: loadHero,
  tennis: async () => parseTennis(await fetchText('/tomorrow-table-tennis/club-updates.js')),
  stress: async () => parseStress(await fetchText('/stress-break-3d/app.js')),
};

function renderCard(name, releases) {
  if (!releases.length) throw new Error(`Empty ${name} releases`);
  const card = document.querySelector(`.update-card-${name}`);
  if (!card) return;
  const latest = releases[0];
  const date = card.querySelector('.update-meta time');
  date.dateTime = latest.date;
  date.textContent = latest.date.replaceAll('-', '.');
  const heading = card.querySelector('.update-title');
  heading.replaceChildren(document.createTextNode(latest.title));
  if (latest.version) {
    const version = document.createElement('span');
    version.textContent = `v${latest.version}`;
    heading.append(' ', version);
  }
  card.querySelector('.update-body > p').textContent = latest.changes.slice(0, 2).join(' ');
  const history = card.querySelector('details.update-history');
  const list = history.querySelector('ol');
  list.replaceChildren();
  for (const release of releases.slice(1, 4)) {
    const item = document.createElement('li');
    const stamp = document.createElement('time');
    stamp.dateTime = release.date;
    stamp.textContent = release.version ? `v${release.version}` : release.date.slice(5).replace('-', '.');
    const description = document.createElement('span');
    description.textContent = release.title;
    item.append(stamp, description);
    list.append(item);
  }
  history.hidden = releases.length < 2;
}

function arrangeUpdates() {
  const latest = document.getElementById('updates-latest');
  const older = document.getElementById('updates-older');
  const cards = [...document.querySelectorAll('.update-card')];
  cards.sort((a, b) => b.querySelector('.update-meta time').dateTime.localeCompare(a.querySelector('.update-meta time').dateTime));
  cards.forEach((card, index) => (index < 3 ? latest : older).append(card));
  document.getElementById('updates-more').hidden = cards.length <= 3;
  document.getElementById('updates-more-count').textContent = `(${Math.max(0, cards.length - 3)})`;
}

async function syncUpdates() {
  arrangeUpdates();
  const status = document.getElementById('updates-sync-status');
  status.textContent = '각 프로젝트의 최신 업데이트를 확인하고 있습니다.';
  const results = await Promise.allSettled(Object.entries(loaders).map(async ([name, load]) => {
    const releases = await load();
    renderCard(name, releases);
    return releases[0].date;
  }));
  const dates = [...document.querySelectorAll('.update-card .update-meta time')].map(time => time.dateTime).filter(Boolean);
  arrangeUpdates();
  if (dates.length) document.getElementById('updates-as-of').textContent = `${dates.sort().at(-1).replaceAll('-', '.')} 기준`;
  status.textContent = results.every(result => result.status === 'fulfilled') ? '연결된 프로젝트의 최신 내역을 확인했습니다.' : '일부 프로젝트의 최신 기록을 불러오지 못해 기존 내역을 표시합니다.';
  for (const result of results) if (result.status === 'rejected') console.warn('Update sync failed:', result.reason);
}

if (typeof document !== 'undefined') syncUpdates();
