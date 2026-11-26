import { useState, useCallback, useEffect, useRef } from 'react';
import { SAMPLE_MESSAGES } from '../data/sampleMessages';
import { REMOTE, fetchMessages, postMessage, normalize } from '../lib/guestbookApi';

const LOCAL_KEY = 'ddp_guestbook_messages';
const CACHE_KEY = 'ddp_guestbook_cache';
const CLIENT_KEY = 'ddp_client_id';
const HEART_COLORS = ['#f277ad', '#e85d8a', '#f5c6d0'];
export const POLL_MS = 10000;

const uuid = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;

function readJson(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function getClientId() {
  try {
    let id = localStorage.getItem(CLIENT_KEY);
    if (!id) {
      id = uuid();
      localStorage.setItem(CLIENT_KEY, id);
    }
    return id;
  } catch {
    return uuid();
  }
}

// ---- 구글시트 모드: 시트가 원본. 10초마다 새로 불러온다. ----
function useRemoteGuestbook() {
  const [messages, setMessages] = useState(() => (readJson(CACHE_KEY) || []).map(normalize));
  const [status, setStatus] = useState(() => (readJson(CACHE_KEY)?.length ? 'ok' : 'loading'));
  const [submitting, setSubmitting] = useState(false);
  const [lastAdded, setLastAdded] = useState(null);

  const busyRef = useRef(false);
  const fetchingRef = useRef(false);
  const hasDataRef = useRef(status === 'ok');
  const mineRef = useRef(new Map());
  const lastRequestRef = useRef(null);

  const refresh = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const server = await fetchMessages();
      const ids = new Set(server.map(m => m.id));
      for (const id of [...mineRef.current.keys()]) if (ids.has(id)) mineRef.current.delete(id);
      // 방금 내가 등록했지만 아직 목록에 안 실린 글은 잠시 유지한다.
      setMessages([...server, ...mineRef.current.values()]);
      writeJson(CACHE_KEY, server);
      hasDataRef.current = true;
      setStatus('ok');
    } catch {
      if (!hasDataRef.current) setStatus('error');
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    refresh();
    const tick = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    const id = setInterval(tick, POLL_MS);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [refresh]);

  const addMessage = useCallback(async (message) => {
    if (busyRef.current) return { success: false, reason: 'busy' };
    busyRef.current = true;
    setSubmitting(true);
    try {
      // 실패 뒤 같은 글을 다시 보내면 같은 요청 번호를 써서 서버가 중복 저장하지 않게 한다.
      const prev = lastRequestRef.current;
      const requestId = prev && prev.message === message ? prev.requestId : uuid();
      lastRequestRef.current = { message, requestId };

      const res = await postMessage({ message, requestId, clientId: getClientId() });
      if (!res || res.ok !== true) return { success: false, reason: res?.error || 'failed' };

      lastRequestRef.current = null;
      const saved = normalize(res.message);
      mineRef.current.set(saved.id, saved);
      setMessages(list => (list.some(m => m.id === saved.id) ? list : [...list, saved]));
      setLastAdded(saved.id);
      return { success: true, id: saved.id };
    } catch {
      return { success: false, reason: 'network' };
    } finally {
      busyRef.current = false;
      setSubmitting(false);
    }
  }, []);

  const clearLastAdded = useCallback(() => setLastAdded(null), []);
  return { messages, status, addMessage, submitting, lastAdded, clearLastAdded };
}

// ---- 데모 모드: 주소가 없을 때. 이 브라우저(localStorage)에만 저장한다. ----
function useLocalGuestbook() {
  const [messages, setMessages] = useState(() => readJson(LOCAL_KEY) || [...SAMPLE_MESSAGES]);
  const [submitting, setSubmitting] = useState(false);
  const [lastAdded, setLastAdded] = useState(null);
  const busyRef = useRef(false);

  useEffect(() => {
    writeJson(LOCAL_KEY, messages);
  }, [messages]);

  const addMessage = useCallback(async (message) => {
    if (busyRef.current) return { success: false, reason: 'busy' };
    busyRef.current = true;
    setSubmitting(true);

    await new Promise(r => setTimeout(r, 600));

    const newMsg = {
      id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      message: message.trim(),
      createdAt: new Date().toISOString(),
      color: Math.floor(Math.random() * HEART_COLORS.length),
    };

    setMessages(prev => [...prev, newMsg]);
    setLastAdded(newMsg.id);
    setSubmitting(false);
    busyRef.current = false;
    return { success: true, id: newMsg.id };
  }, []);

  const clearLastAdded = useCallback(() => setLastAdded(null), []);
  return { messages, status: 'ok', addMessage, submitting, lastAdded, clearLastAdded };
}

export const useGuestbook = REMOTE ? useRemoteGuestbook : useLocalGuestbook;
