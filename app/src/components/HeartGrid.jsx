import { useRef, useState } from 'react';
import { COIN_COLORS, COIN_ASPECT, layoutFor } from '../lib/heartGeometry';
import { coinLabel } from '../lib/coinLabel';
import MessageDialog from './MessageDialog';

const PAD = 2;

export default function HeartGrid({ messages }) {
  const [selected, setSelected] = useState(null);
  const triggerRef = useRef(null);

  const layout = layoutFor(messages.length);
  const w = layout.coinW;
  const h = w * COIN_ASPECT;
  const lineGap = layout.font * 1.22;

  const close = () => {
    setSelected(null);
    const el = triggerRef.current;
    requestAnimationFrame(() => {
      if (el && el.isConnected) el.focus({ preventScroll: true });
    });
  };

  if (messages.length === 0) {
    return <p className="zoom-empty">아직 메시지가 없어요. 첫 번째 하트를 남겨주세요.</p>;
  }

  return (
    <div className="heart-grid-wrap">
      <div className="heart-grid">
        {messages.map((msg, i) => {
          const lines = coinLabel(msg.message, layout.words, layout.maxUnits);
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
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={layout.font}
                  fontWeight="700"
                  fill="#0b2326"
                >
                  {lines.map((line, j) => (
                    <tspan key={j} x="0" y={-layout.font / 3 + (j - (lines.length - 1) / 2) * lineGap}>{line}</tspan>
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
