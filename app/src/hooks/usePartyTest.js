import { useState, useEffect, useCallback } from 'react';
import { DJ_SCHEDULE } from '../data/schedule';
import { virtualTimeForStep } from '../lib/partyState';

const TOTAL = DJ_SCHEDULE.length;
const AUTO_MS = 5000;

// 가상 시각만 만든다. 시간표·방명록 데이터는 건드리지 않는다.
export function usePartyTest(paused) {
  const [on, setOn] = useState(false);
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(false);

  useEffect(() => {
    if (!on || !auto || paused) return;
    const id = setInterval(() => setStep(s => Math.min(s + 1, TOTAL)), AUTO_MS);
    return () => clearInterval(id);
  }, [on, auto, paused]);

  useEffect(() => {
    if (auto && step >= TOTAL) setAuto(false);
  }, [auto, step]);

  const enter = useCallback(() => { setStep(0); setAuto(false); setOn(true); }, []);
  const exit = useCallback(() => { setOn(false); setAuto(false); }, []);
  const prev = useCallback(() => { setAuto(false); setStep(s => Math.max(0, s - 1)); }, []);
  const next = useCallback(() => { setAuto(false); setStep(s => Math.min(TOTAL, s + 1)); }, []);
  const toggleAuto = useCallback(() => {
    if (auto) { setAuto(false); return; }
    if (step >= TOTAL) setStep(0);
    setAuto(true);
  }, [auto, step]);

  return {
    on, step, auto, total: TOTAL,
    testNow: on ? virtualTimeForStep(step) : null,
    enter, exit, prev, next, toggleAuto,
  };
}
