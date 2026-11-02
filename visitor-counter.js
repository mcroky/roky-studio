(() => {
  const counter = document.querySelector('.visitor-counter');
  if (!counter) return;

  const todayLabel = document.getElementById('visitor-today-label');
  const weekLabel = document.getElementById('visitor-week-label');
  const todayValue = document.getElementById('visitor-today');
  const weekValue = document.getElementById('visitor-week');
  const status = document.getElementById('visitor-counter-status');
  const words = {
    ko: { today: '오늘 방문', week: '최근 7일', waiting: '방문 횟수 집계 준비 중', updated: 'Cloudflare 방문 횟수 · {time} 갱신', dated: '{date} 방문', title: 'Roky Studio 방문 통계' },
    en: { today: 'Today', week: 'Last 7 days', waiting: 'Visit counts are being prepared', updated: 'Cloudflare visits · updated {time}', dated: 'Visits on {date}', title: 'Roky Studio visit counts' },
    ja: { today: '今日の訪問', week: '過去7日間', waiting: '訪問回数を集計中', updated: 'Cloudflareの訪問回数 · {time}更新', dated: '{date}の訪問', title: 'Roky Studioの訪問回数' },
    zh: { today: '今日访问', week: '最近7天', waiting: '正在统计访问次数', updated: 'Cloudflare访问次数 · {time}更新', dated: '{date}访问', title: 'Roky Studio访问次数' },
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
    weekLabel.textContent = copy.week;

    if (!snapshot) {
      status.textContent = copy.waiting;
      return;
    }

    const formatter = new Intl.NumberFormat(code);
    todayValue.textContent = formatter.format(snapshot.todayVisits);
    weekValue.textContent = formatter.format(snapshot.last7DaysVisits);
    const time = new Intl.DateTimeFormat(code, {
      timeZone: 'Asia/Seoul', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit',
    }).format(new Date(snapshot.updatedAt));
    status.textContent = copy.updated.replace('{time}', time);
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
          !Number.isInteger(data.last7DaysVisits) || data.last7DaysVisits < 0) {
        throw new Error('Invalid visitor snapshot');
      }
      snapshot = data;
      render();
    })
    .catch(() => { /* Keep the honest 'preparing' state until a valid snapshot is deployed. */ });
})();
