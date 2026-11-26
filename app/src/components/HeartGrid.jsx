import { useRef, useState } from 'react';
import { COIN_COLORS, COIN_ASPECT, LAYOUTS } from '../lib/heartGeometry';
import { fitMessage } from '../lib/coinLabel';
import MessageDialog from './MessageDialog';

const PAD = 2;

export default function HeartGrid({ messages, status = 'ok' }) {
  const [selected, setSelected] = useState(null);
  const triggerRef = useRef(null);

  const layout = LAYOUTS[0];
  const w = layout.coinW;
  const h = w * COIN_ASPECT;
  const boxW = w * 0.7;
  const boxH = h * 0.52;
  const boxY = 0;

  const close = () => {
    setSelected(null);
    const el = triggerRef.current;
    requestAnimationFrame(() => {
      if (el && el.isConnected) el.focus({ preventScroll: true });
    });
  };

  if (messages.length === 0) {
    const text = status === 'loading' ? '하트를 불러오는 중…'
      : status === 'error' ? '하트를 불러오지 못했어요. 잠시 후 다시 시도할게요.'
      : '아직 메시지가 없어요. 첫 번째 하트를 남겨주세요.';
    return <p className="zoom-empty">{text}</p>;
  }

  return (
    <div className="heart-grid-wrap">
      <div className="heart-grid">
        {messages.map((msg, i) => {
          const { lines, size, gap } = fitMessage(msg.message, boxW, boxH);
          return (
            <button
              key={msg.id}
              type="button"
              className="heart-grid-item"
              aria-label={`메시지 ${i + 1}번 보기: ${lines.join(' ')}`}
              onClick={e => {
                triggerRef.current = e.currentTarget;
                setSelected(msg);
              }}
            >
              <svg
                viewBox={`${-w / 2 - PAD} ${-h / 2 - PAD} ${w + PAD * 2} ${h + PAD * 2}`}
                style={{ aspectRatio: (w + PAD * 2) / (h + PAD * 2) }}
                aria-hidden="true"
              >
                <path
                  d={layout.coinD}
                  fill={COIN_COLORS[msg.color % COIN_COLORS.length]}
                  stroke="#2a777e"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                  strokeLinejoin="round"
                />
                <text
                  className="grid-text"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={size}
                  fill="#0b2326"
                >
                  {lines.map((line, j) => (
                    <tspan key={j} x="0" y={boxY + (j - (lines.length - 1) / 2) * gap}>{line}</tspan>
                  ))}
                </text>
              </svg>
            </button>
          );
        })}
      </div>
      {selected && <MessageDialog msg={selected} onClose={close} />}
    </div>
  );
}
