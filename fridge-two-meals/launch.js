const direct = document.querySelector('#direct');
const healthUrl = new URL('/healthz', direct.href);
const status = document.querySelector('#status');
const activity = document.querySelector('#activity');
const retry = document.querySelector('#retry');
const waitLimit = 90_000;
const probeLimit = 24_000;
const retryDelay = 2_000;
let checking = false;

async function isReady(timeout) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(healthUrl, {
      cache: 'no-store',
      credentials: 'omit',
      redirect: 'error',
      headers: { Accept: 'text/plain' },
      signal: controller.signal
    });
    return response.ok && response.headers.get('content-type')?.split(';')[0] === 'text/plain' &&
      (await response.text()).trim() === 'ok';
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

async function openApp() {
  if (checking) return;
  checking = true;
  retry.hidden = true;
  activity.hidden = false;
  status.textContent = '앱을 깨우는 중이에요.';
  const deadline = performance.now() + waitLimit;
  const slow = setTimeout(() => {
    status.textContent = '아직 준비 중이에요. 연결을 계속 확인하고 있어요.';
  }, 20_000);
  try {
    while (performance.now() < deadline) {
      const ready = await isReady(Math.min(probeLimit, deadline - performance.now()));
      if (ready && performance.now() < deadline) {
        status.textContent = '준비가 끝났어요. 앱으로 이동해요.';
        window.location.replace(direct.href);
        return;
      }
      const remaining = deadline - performance.now();
      if (remaining > 0) await new Promise(resolve => setTimeout(resolve, Math.min(retryDelay, remaining)));
    }
    status.textContent = '연결을 확인하지 못했어요. 다시 확인하거나 앱을 직접 열 수 있어요.';
    activity.hidden = true;
    retry.hidden = false;
  } finally {
    clearTimeout(slow);
    checking = false;
  }
}

document.querySelector('#connection').hidden = false;
retry.addEventListener('click', openApp);
void openApp();
