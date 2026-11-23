// 하트 바구니·코인·팝업이 공유하는 좌표계. 모든 배치는 이 모듈에서 한 번만 계산된다.

export const VIEW_W = 640;
export const VIEW_H = 720;
export const SLOT_X = VIEW_W / 2;
export const SLOT_Y = 34;
export const COIN_COLORS = ['#f277ad', '#e8506e', '#fff0d9'];

const BASKET_BOX = { x0: 14, x1: VIEW_W - 14, y0: 66, y1: 678 };
export const BASKET_BOTTOM = BASKET_BOX.y1;
export const BASKET_MID_Y = (BASKET_BOX.y0 + BASKET_BOX.y1) / 2;
const DIALOG_BOX = { x0: 8, x1: 392, y0: 8, y1: 372 };
export const DIALOG_VIEW = { w: 400, h: 380 };

// 메시지가 한 바구니(첫 단계) 용량을 넘으면 코인이 작아지고 글씨는 1단어로 줄어든다.
const TIERS = [
  { coinW: 60, rowH: 42, step: 52, margin: 5, edge: 28, font: 9, words: 2, maxUnits: 4.6, stroke: 1.5 },
  { coinW: 44, rowH: 31, step: 38, margin: 4, edge: 20, font: 8, words: 1, maxUnits: 3.4, stroke: 1.2 },
];

function rawHeart(t) {
  const x = 16 * Math.sin(t) ** 3;
  const f = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  return [x, -f];
}

const RAW = Array.from({ length: 720 }, (_, i) => rawHeart((i / 720) * Math.PI * 2));
const RAW_X0 = Math.min(...RAW.map(p => p[0]));
const RAW_X1 = Math.max(...RAW.map(p => p[0]));
const RAW_Y0 = Math.min(...RAW.map(p => p[1]));
const RAW_Y1 = Math.max(...RAW.map(p => p[1]));

function heartPolygon(n, box) {
  return Array.from({ length: n }, (_, i) => {
    const [x, y] = rawHeart((i / n) * Math.PI * 2);
    return [
      box.x0 + ((x - RAW_X0) / (RAW_X1 - RAW_X0)) * (box.x1 - box.x0),
      box.y0 + ((y - RAW_Y0) / (RAW_Y1 - RAW_Y0)) * (box.y1 - box.y0),
    ];
  });
}

function toPath(pts) {
  return `M${pts.map(p => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('L')}Z`;
}

function inside(pt, poly) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

function distToEdges(pt, poly) {
  let best = Infinity;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [ax, ay] = poly[j];
    const [bx, by] = poly[i];
    const dx = bx - ax;
    const dy = by - ay;
    const len2 = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((pt[0] - ax) * dx + (pt[1] - ay) * dy) / len2));
    best = Math.min(best, Math.hypot(pt[0] - (ax + t * dx), pt[1] - (ay + t * dy)));
  }
  return best;
}

export const BASKET_POLY = heartPolygon(240, BASKET_BOX);
export const BASKET_D = toPath(BASKET_POLY);
export const DIALOG_D = toPath(heartPolygon(240, DIALOG_BOX));

function coinPolygon(n, coinW) {
  const scale = coinW / (RAW_X1 - RAW_X0);
  const cy = (RAW_Y0 + RAW_Y1) / 2;
  return Array.from({ length: n }, (_, i) => {
    const [x, y] = rawHeart((i / n) * Math.PI * 2);
    return [x * scale, (y - cy) * scale];
  });
}

const rand = seed => {
  const v = Math.sin(seed * 12.9898) * 43758.5453;
  return v - Math.floor(v);
};

function buildLayout(t) {
  const test = coinPolygon(28, t.coinW);
  const halfCols = Math.ceil(VIEW_W / 2 / t.step) + 1;

  const fits = (x, y, rot) => {
    const a = (rot * Math.PI) / 180;
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    return test.every(([px, py]) => {
      const pt = [x + px * cos - py * sin, y + px * sin + py * cos];
      return inside(pt, BASKET_POLY) && distToEdges(pt, BASKET_POLY) >= t.margin;
    });
  };

  const slots = [];
  for (let r = 0; ; r++) {
    const y = BASKET_BOX.y1 - t.edge - r * t.rowH;
    if (y < BASKET_BOX.y0 + 8) break;
    const primary = r % 2 ? t.step / 2 : 0;
    const buildRow = off => {
      const row = [];
      for (let k = -halfCols; k <= halfCols; k++) {
        const bx = SLOT_X + k * t.step + off;
        const seed = r * 31 + (k + halfCols) * 7 + 1;
        const rot = (rand(seed + 2) - 0.5) * 28;
        const tries = [
          [bx + (rand(seed) - 0.5) * 8, y + (rand(seed + 1) - 0.5) * 6, rot],
          [bx, y, rot * 0.3],
          [bx, y, 0],
        ];
        const hit = tries.find(([tx, ty, tr]) => fits(tx, ty, tr));
        if (hit) row.push({ x: hit[0], y: hit[1], rot: hit[2] });
      }
      return row;
    };
    let row = buildRow(primary);
    if (row.length === 0) row = buildRow(t.step / 2 - primary);
    row.sort((p, q) => Math.abs(p.x - SLOT_X) - Math.abs(q.x - SLOT_X));
    slots.push(...row);
  }

  return { ...t, slots, capacity: slots.length, coinD: toPath(coinPolygon(64, t.coinW)) };
}

export const LAYOUTS = TIERS.map(buildLayout);

// 메시지 수에 맞는 배치. 첫 단계에 다 들어가면 큰 코인, 넘치면 작은 코인.
export function layoutFor(count) {
  return count <= LAYOUTS[0].capacity ? LAYOUTS[0] : LAYOUTS[1];
}
