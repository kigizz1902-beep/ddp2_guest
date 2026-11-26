import { useRef, useState } from 'react';
import {
  COIN_COLORS, layoutFor,
  VIEW_W, VIEW_H, SLOT_X, SLOT_Y, BASKET_MID_Y,
} from '../lib/heartGeometry';
import { coinLabel } from '../lib/coinLabel';
import MessageDialog from './MessageDialog';

const HINT_TOP = '。　♡ 。　　♡。　　♡\n♡。　＼　　｜　　／。　♡';
const HINT_BOTTOM = '♡。　／　　｜　　＼。　♡\n。　♡。 　　。　　♡。';

// 분홍 화살표는 두 하트 사이 V자 틈 안, 투입구 바로 위에 둔다.
const ARROW_Y = 36;

export default function HeartBasket({ messages, status = 'ok', page, onPageChange, lastAdded, size = 'main', actions = null }) {
  const [selected, setSelected] = useState(null);
  const triggerRef = useRef(null);

  const layout = layoutFor(messages.length);
  const { slots, capacity } = layout;
  const pageCount = Math.max(1, Math.ceil(messages.length / capacity));
  const current = Math.min(page ?? pageCount - 1, pageCount - 1);
  const pageMessages = messages.slice(current * capacity, (current + 1) * capacity);

  const open = (msg, el) => {
    triggerRef.current = el;
    setSelected(msg);
  };

  const close = () => {
    setSelected(null);
    const el = triggerRef.current;
    requestAnimationFrame(() => {
      if (el && el.isConnected) el.focus({ preventScroll: true });
    });
  };

  const onKeyDown = (e, msg) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      open(msg, e.currentTarget);
    } else if (e.key === ' ') {
      e.preventDefault();
    }
  };

  const onKeyUp = (e, msg) => {
    if (e.key === ' ') open(msg, e.currentTarget);
  };

  return (
    <div className={`basket basket--${size}`}>
      <div className="basket-stage">
      <div className="basket-hint" role="note" aria-label="메세지를 남겨 하트를 채워주세요">
        <pre className="hint-art" aria-hidden="true">{HINT_TOP}</pre>
        <p className="hint-text" aria-hidden="true">메세지를 남겨 하트를 채워주세요</p>
        <pre className="hint-art" aria-hidden="true">{HINT_BOTTOM}</pre>
      </div>
      {actions}
      <svg
        className="basket-svg"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}
        role="group"
        aria-label={`하트 방명록 바구니, 메시지 ${messages.length}개`}
      >
        <image href="/images/heartbox.webp" x="0" y="0" width={VIEW_W} height={VIEW_H} preserveAspectRatio="none" />

        <g className="basket-coins">
          {pageMessages.map((msg, i) => {
            const slot = slots[i];
            const isNew = msg.id === lastAdded;
            const lines = coinLabel(msg.message, layout.words, layout.maxUnits);
            return (
              <g
                key={msg.id}
                className={`basket-coin${isNew ? ' coin-new' : ''}`}
                transform={`translate(${slot.x.toFixed(1)} ${slot.y.toFixed(1)})`}
                role="button"
                tabIndex={0}
                aria-label={`메시지 ${current * capacity + i + 1}번 보기: ${lines.join(' ')}`}
                onClick={e => open(msg, e.currentTarget)}
                onKeyDown={e => onKeyDown(e, msg)}
                onKeyUp={e => onKeyUp(e, msg)}
              >
                <g
                  className={isNew ? 'coin-fall' : undefined}
                  style={isNew ? { '--dx': `${SLOT_X - slot.x}px`, '--dy': `${SLOT_Y - slot.y}px` } : undefined}
                >
                  <g transform={`rotate(${slot.rot.toFixed(1)})`}>
                    <path
                      className="coin-shape"
                      d={layout.coinD}
                      fill={COIN_COLORS[msg.color % COIN_COLORS.length]}
                      stroke="#2a777e"
                      strokeWidth={layout.stroke}
                      strokeLinejoin="round"
                    />
                  </g>
                  <text
                    className="coin-text"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={layout.font}
                    fill="#0b2326"
                    pointerEvents="none"
                    aria-hidden="true"
                  >
                    {lines.map((line, j) => (
                      <tspan key={j} x="0" y={0 + (j - (lines.length - 1) / 2) * 11}>{line}</tspan>
                    ))}
                  </text>
                </g>
              </g>
            );
          })}
        </g>

        <g aria-hidden="true" pointerEvents="none">
          <path className="basket-arrow" d={`M${SLOT_X - 7} ${ARROW_Y}h14l-7 9z`} fill="#f277ad" />
        </g>

        {messages.length === 0 && (
          <text
            x={SLOT_X}
            y={BASKET_MID_Y}
            textAnchor="middle"
            fontSize="26"
            fill="#2a777e"
            pointerEvents="none"
          >
            {status === 'loading' ? (
              <tspan x={SLOT_X} dy="0">하트를 불러오는 중…</tspan>
            ) : status === 'error' ? (
              <>
                <tspan x={SLOT_X} dy="0">하트를 불러오지 못했어요</tspan>
                <tspan x={SLOT_X} dy="36">잠시 후 다시 시도할게요</tspan>
              </>
            ) : (
              <>
                <tspan x={SLOT_X} dy="0">아직 메시지가 없어요</tspan>
                <tspan x={SLOT_X} dy="36">첫 번째 하트를 남겨주세요</tspan>
              </>
            )}
          </text>
        )}
      </svg>
      </div>
      <p className="basket-note">하트를 누르면 메세지를 읽을 수 있어요.</p>

      {pageCount > 1 && (
        <nav className="basket-pager" aria-label="바구니 페이지">
          <button
            type="button"
            onClick={() => onPageChange(current - 1)}
            disabled={current === 0}
            aria-label="이전 바구니"
          >
            ‹
          </button>
          <span aria-live="polite">바구니 {current + 1} / {pageCount}</span>
          <button
            type="button"
            onClick={() => onPageChange(current + 1)}
            disabled={current === pageCount - 1}
            aria-label="다음 바구니"
          >
            ›
          </button>
        </nav>
      )}

      {selected && <MessageDialog msg={selected} onClose={close} />}
    </div>
  );
}
