import { useState } from 'react';

const PRESETS = [
  { label: 'D-30 (파티 전)', time: '2026-10-29T12:00:00+09:00' },
  { label: 'D-Day 첫 공연 전', time: '2026-11-28T18:30:00+09:00' },
  { label: 'DJ 01 공연 중', time: '2026-11-28T19:20:00+09:00' },
  { label: 'DJ 05 공연 중', time: '2026-11-28T22:00:00+09:00' },
  { label: 'DJ 08 자정 직전', time: '2026-11-28T23:50:00+09:00' },
  { label: 'DJ 09 자정 이후', time: '2026-11-29T00:40:00+09:00' },
  { label: 'DJ 14 마지막', time: '2026-11-29T04:00:00+09:00' },
  { label: '공연 종료', time: '2026-11-29T04:30:00+09:00' },
  { label: '현재 시간', time: null },
];

export default function DevControls({ onTimeChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="dev-controls">
      <button className="dev-toggle" onClick={() => setOpen(!open)}>
        {open ? '✕' : '⚙ DEV'}
      </button>
      {open && (
        <div className="dev-panel">
          <p className="dev-panel-title">시간 시뮬레이션 (테스트용)</p>
          {PRESETS.map(p => (
            <button
              key={p.label}
              className="dev-btn"
              onClick={() => onTimeChange(p.time ? new Date(p.time) : null)}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
