import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { COIN_COLORS, DIALOG_D, DIALOG_VIEW } from '../lib/heartGeometry';

function formatTime(iso) {
  return new Date(iso).toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export default function MessageDialog({ msg, onClose }) {
  const closeRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  const onKeyDown = e => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== 'Tab') return;
    const stops = [scrollRef.current, closeRef.current].filter(Boolean);
    const i = stops.indexOf(document.activeElement);
    const next = e.shiftKey ? (i <= 0 ? stops.length - 1 : i - 1) : (i + 1) % stops.length;
    e.preventDefault();
    stops[next].focus();
  };

  return createPortal(
    <div
      className="heart-dialog-backdrop"
      onClick={e => {
        e.stopPropagation();
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={onKeyDown}
    >
      <div
        className="heart-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="메시지"
        onClick={e => e.stopPropagation()}
      >
        <svg
          className="heart-dialog-shape"
          viewBox={`0 0 ${DIALOG_VIEW.w} ${DIALOG_VIEW.h}`}
          aria-hidden="true"
        >
          <path
            d={DIALOG_D}
            fill={COIN_COLORS[msg.color % COIN_COLORS.length]}
            stroke="#2a777e"
            strokeWidth="4"
            strokeLinejoin="round"
          />
        </svg>
        <div className="heart-dialog-content">
          <div
            ref={scrollRef}
            className="heart-dialog-message"
            tabIndex={0}
            role="region"
            aria-label="메시지 내용"
          >
            {msg.message}
          </div>
          <p className="heart-dialog-time">{formatTime(msg.createdAt)}</p>
        </div>
      </div>
      <button ref={closeRef} type="button" className="heart-dialog-close" onClick={onClose}>
        닫기
      </button>
    </div>,
    document.body,
  );
}
