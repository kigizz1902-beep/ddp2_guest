import { useEffect, useState } from 'react';

const HEART_COLORS = ['#f277ad', '#e8506e', '#fff0d9', '#ff9ec4', '#f5c6d0'];
const HEART_PATH = 'M18 32 C10 24 2 18 2 11 2 5 7 2 12 2 15 2 17 4 18 6 19 4 21 2 24 2 29 2 34 5 34 11 34 18 26 24 18 32Z';
const LAND_DELAY = 450;

function randomHearts(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 200,
    y: -(Math.random() * 150 + 50),
    size: 10 + Math.random() * 14,
    color: HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)],
    delay: Math.random() * 200,
    rotation: Math.random() * 360,
  }));
}

// 새로 들어온 코인이 정착할 자리(화면 좌표)를 찾는다. 없으면 바구니 중앙.
function findOrigin() {
  const svg = document.querySelector('.basket-svg');
  if (!svg) return null;
  const coin = svg.querySelector('.coin-new');
  const ctm = svg.getScreenCTM();
  if (coin && ctm) {
    const m = coin.transform.baseVal.consolidate()?.matrix;
    if (m) {
      const p = new DOMPoint(m.e, m.f).matrixTransform(ctm);
      return { x: p.x, y: p.y };
    }
  }
  const r = svg.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height * 0.6 };
}

export default function CelebrationEffect({ active, onDone }) {
  const [hearts, setHearts] = useState([]);
  const [origin, setOrigin] = useState(null);
  const [visible, setVisible] = useState(false);
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!active) return;
    if (reducedMotion) {
      const t = setTimeout(() => onDone?.(), 2500);
      return () => clearTimeout(t);
    }

    const count = window.innerWidth < 600 ? 10 : 18;
    const start = setTimeout(() => {
      setOrigin(findOrigin());
      setHearts(randomHearts(count));
      setVisible(true);
    }, LAND_DELAY);
    const end = setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, LAND_DELAY + 1200);
    return () => {
      clearTimeout(start);
      clearTimeout(end);
    };
  }, [active]);

  if (!visible || reducedMotion || !origin) return null;

  return (
    <div
      className="celebration-effect"
      style={{
        position: 'fixed',
        left: origin.x,
        top: origin.y,
        pointerEvents: 'none',
        zIndex: 700,
      }}
      aria-hidden="true"
    >
      {hearts.map(h => (
        <svg
          key={h.id}
          width={h.size}
          height={h.size}
          viewBox="0 0 36 36"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            animation: `celebHeart 1s ease-out ${h.delay}ms forwards`,
            '--cx': `${h.x}px`,
            '--cy': `${h.y}px`,
            '--cr': `${h.rotation}deg`,
          }}
        >
          <path d={HEART_PATH} fill={h.color} />
        </svg>
      ))}
    </div>
  );
}
