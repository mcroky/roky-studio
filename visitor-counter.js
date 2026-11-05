(() => {
  const counter = document.querySelector('.visitor-counter');
  if (!counter) return;

  const todayLabel = document.getElementById('visitor-today-label');
  const totalLabel = document.getElementById('visitor-total-label');
  const todayValue = document.getElementById('visitor-today');
  const totalValue = document.getElementById('visitor-total');
  const status = document.getElementById('visitor-counter-status');
  const words = {
    ko: { today: '오늘 방문', total: '전체 누적', waiting: '방문 횟수 집계 준비 중', updated: 'Cloudflare 방문 횟수 · {time} 확인', dated: '{date} 방문', title: 'Roky Studio 방문 통계' },
    en: { today: 'Today', total: 'All-time visits', waiting: 'Visit counts are being prepared', updated: 'Cloudflare visits · checked {time}', dated: 'Visits on {date}', title: 'Roky Studio visit counts' },
    ja: { today: '今日の訪問', total: '累計訪問', waiting: '訪問回数を集計中', updated: 'Cloudflareの訪問回数 · {time}確認', dated: '{date}の訪問', title: 'Roky Studioの訪問回数' },
    zh: { today: '今日访问', total: '累计访问', waiting: '正在统计访问次数', updated: 'Cloudflare访问次数 · {time}确认', dated: '{date}访问', title: 'Roky Studio访问次数' },
  };
  let snapshot = null;
  let apiEndpoint = null;
  let lastApiAttempt = 0;

  function language() {
    const code = (window.RokyI18n?.language || document.documentElement.lang || 'ko').slice(0, 2);
    return words[code] ? code : 'ko';
  }

  function render() {
    const code = language();
    const copy = words[code];
    counter.setAttribute('aria-label', copy.title);
    const seoulToday = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
    todayLabel.textContent = snapshot && snapshot.date !== seoulToday
      ? copy.dated.replace('{date}', snapshot.date)
      : copy.today;
    totalLabel.textContent = copy.total;

    if (!snapshot) {
      status.textContent = copy.waiting;
      return;
    }

    const formatter = new Intl.NumberFormat(code);
    todayValue.textContent = formatter.format(snapshot.todayVisits);
    totalValue.textContent = formatter.format(snapshot.totalVisits);
    const time = new Intl.DateTimeFormat(code, {
      timeZone: 'Asia/Seoul', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit',
    }).format(new Date(snapshot.updatedAt));
    status.textContent = copy.updated.replace('{time}', time);
    counter.dataset.ready = 'true';
  }

  window.addEventListener('roky:language', render);
  render();

  function valid(data) {
    return /^\d{4}-\d{2}-\d{2}$/.test(data?.date) && Number.isFinite(Date.parse(data.updatedAt)) &&
      Number.isSafeInteger(data.todayVisits) && data.todayVisits >= 0 &&
      Number.isSafeInteger(data.totalVisits) && data.totalVisits >= 0 &&
      /^\d{4}-\d{2}-\d{2}$/.test(data.lastObservedDate);
  }

  async function load(url) {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error('Visitor snapshot unavailable');
    const data = await response.json();
    if (!valid(data)) throw new Error('Invalid visitor snapshot');
    const countsDidNotRegress = !snapshot || (data.date >= snapshot.date &&
      data.totalVisits >= snapshot.totalVisits &&
      (data.date > snapshot.date || data.todayVisits >= snapshot.todayVisits));
    if (countsDidNotRegress && (!snapshot || Date.parse(data.updatedAt) >= Date.parse(snapshot.updatedAt))) {
      snapshot = data;
      render();
    }
  }

  async function refreshApi() {
    if (!apiEndpoint || document.hidden || Date.now() - lastApiAttempt < 60000) return;
    lastApiAttempt = Date.now();
    try { await load(apiEndpoint); } catch { /* Keep the latest verified snapshot. */ }
  }

  load(new URL('visitor-count.json', document.baseURI)).catch(() => {}).finally(() => {
    fetch(new URL('visitor-api.json', document.baseURI), { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : null)
      .then((config) => {
        if (!config?.endpoint) return;
        const endpoint = new URL(config.endpoint);
        if (endpoint.protocol !== 'https:' || !endpoint.hostname.endsWith('.workers.dev') || endpoint.pathname !== '/visits') return;
        apiEndpoint = endpoint.href;
        refreshApi();
        setInterval(refreshApi, 10 * 60 * 1000);
        document.addEventListener('visibilitychange', refreshApi);
      })
      .catch(() => {});
  });
})();
