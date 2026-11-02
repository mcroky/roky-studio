(() => {
  const counter = document.querySelector('.visitor-counter');
  if (!counter) return;

  const todayLabel = document.getElementById('visitor-today-label');
  const totalLabel = document.getElementById('visitor-total-label');
  const todayValue = document.getElementById('visitor-today');
  const totalValue = document.getElementById('visitor-total');
  const status = document.getElementById('visitor-counter-status');
  const words = {
    ko: { today: '오늘 방문', total: '전체 누적', waiting: '방문 횟수 집계 준비 중', updated: 'Cloudflare 방문 횟수 · {time} 확인', delayed: 'Cloudflare 집계 지연 · {date}까지 반영', dated: '{date} 방문', title: 'Roky Studio 방문 통계' },
    en: { today: 'Today', total: 'All-time visits', waiting: 'Visit counts are being prepared', updated: 'Cloudflare visits · checked {time}', delayed: 'Cloudflare data delayed · through {date}', dated: 'Visits on {date}', title: 'Roky Studio visit counts' },
    ja: { today: '今日の訪問', total: '累計訪問', waiting: '訪問回数を集計中', updated: 'Cloudflareの訪問回数 · {time}確認', delayed: 'Cloudflareの集計遅延 · {date}まで反映', dated: '{date}の訪問', title: 'Roky Studioの訪問回数' },
    zh: { today: '今日访问', total: '累计访问', waiting: '正在统计访问次数', updated: 'Cloudflare访问次数 · {time}确认', delayed: 'Cloudflare统计延迟 · 已统计至{date}', dated: '{date}访问', title: 'Roky Studio访问次数' },
  };
  let snapshot = null;

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
    todayValue.textContent = snapshot.lastObservedDate < seoulToday && snapshot.todayVisits === 0
      ? '—' : formatter.format(snapshot.todayVisits);
    totalValue.textContent = formatter.format(snapshot.totalVisits);
    const time = new Intl.DateTimeFormat(code, {
      timeZone: 'Asia/Seoul', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit',
    }).format(new Date(snapshot.updatedAt));
    status.textContent = snapshot.lastObservedDate < seoulToday
      ? copy.delayed.replace('{date}', snapshot.lastObservedDate)
      : copy.updated.replace('{time}', time);
    counter.dataset.ready = 'true';
  }

  window.addEventListener('roky:language', render);
  render();

  const url = new URL('visitor-count.json', document.baseURI);
  url.searchParams.set('hour', String(Math.floor(Date.now() / 3600000)));
  fetch(url, { cache: 'no-store' })
    .then((response) => {
      if (!response.ok) throw new Error('Visitor snapshot unavailable');
      return response.json();
    })
    .then((data) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date) || !Number.isFinite(Date.parse(data.updatedAt)) ||
          !Number.isInteger(data.todayVisits) || data.todayVisits < 0 ||
          !Number.isInteger(data.totalVisits) || data.totalVisits < 0 ||
          !/^\d{4}-\d{2}-\d{2}$/.test(data.lastObservedDate)) {
        throw new Error('Invalid visitor snapshot');
      }
      snapshot = data;
      render();
    })
    .catch(() => { /* Keep the honest 'preparing' state until a valid snapshot is deployed. */ });
})();
