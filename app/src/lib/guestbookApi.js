// 구글시트(Apps Script 웹 앱) 연결. 주소가 없으면 REMOTE=false 이고 로컬 저장 모드로 동작한다.
const URL_BASE = (import.meta.env.VITE_GUESTBOOK_URL || '').trim();
const TIMEOUT_MS = 15000;

export const REMOTE = URL_BASE.length > 0;

async function request(init) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(URL_BASE, { ...init, signal: ctrl.signal, cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

export function normalize(m) {
  return {
    id: String(m.id),
    message: String(m.message),
    createdAt: String(m.createdAt),
    color: Number(m.color) || 0,
  };
}

export async function fetchMessages() {
  const data = await request({ method: 'GET' });
  if (!data || data.ok !== true || !Array.isArray(data.messages)) throw new Error('bad response');
  return data.messages.map(normalize);
}

// text/plain 으로 보내야 브라우저가 사전 요청(CORS preflight) 없이 Apps Script 에 전달한다.
export async function postMessage({ message, requestId, clientId }) {
  return request({
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ message, requestId, clientId, website: '' }),
  });
}
