import { useState, useCallback, useEffect, useRef } from 'react';
import { SAMPLE_MESSAGES } from '../data/sampleMessages';

const STORAGE_KEY = 'ddp_guestbook_messages';
const HEART_COLORS = ['#f277ad', '#e85d8a', '#f5c6d0'];

function loadMessages() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [...SAMPLE_MESSAGES];
}

function saveMessages(messages) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {}
}

export function useGuestbook() {
  const [messages, setMessages] = useState(loadMessages);
  const [submitting, setSubmitting] = useState(false);
  const [lastAdded, setLastAdded] = useState(null);
  const busyRef = useRef(false);

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  const addMessage = useCallback(async (message) => {
    if (busyRef.current) return { success: false, error: 'submitting' };
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

  return { messages, addMessage, submitting, lastAdded, clearLastAdded, HEART_COLORS };
}
