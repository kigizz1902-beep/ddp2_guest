// 하트 바구니·코인·팝업이 공유하는 좌표계. 모든 배치는 이 모듈에서 한 번만 계산된다.

import { BOX_IMG, BOX_SLOT, BOX_INNER } from './heartBoxShape';

// 하트 상자 이미지(heartbox.webp)를 viewBox 640 폭에 맞춰 그리고, 코인은 그 안쪽 흰 영역에만 쌓는다.
export const VIEW_W = 640;
const SCALE = VIEW_W / BOX_IMG.w;
export const VIEW_H = Math.round(BOX_IMG.h * SCALE);
export const SLOT_X = BOX_SLOT.x * SCALE;
export const SLOT_Y = BOX_SLOT.y * SCALE;
const CENTER_X = VIEW_W / 2;
export const COIN_COLORS = ['#f277ad', '#e8506e', '#fff0d9'];

export const BASKET_POLY = BOX_INNER.map(([x, y]) => [x * SCALE, y * SCALE]);
const POLY_Y0 = Math.min(...BASKET_POLY.map(p => p[1]));
const POLY_Y1 = Math.max(...BASKET_POLY.map(p => p[1]));
export const BASKET_MID_Y = (() => {
  let a = 0, cy = 0;
  for (let i = 0; i < BASKET_POLY.length; i++) {
    const [x1, y1] = BASKET_POLY[i];
    const [x2, y2] = BASKET_POLY[(i + 1) % BASKET_POLY.length];
    const c = x1 * y2 - x2 * y1;
    a += c;
    cy += (y1 + y2) * c;
  }
  return cy / (3 * a);
})();
const DIALOG_BOX = { x0: 8, x1: 392, y0: 8, y1: 372 };
export const DIALOG_VIEW = { w: 400, h: 380 };

// 메시지가 한 바구니(첫 단계) 용량을 넘으면 코인이 조금 작아지고(대신 서로 더 겹쳐 쌓이고) 글씨는 1단어로 줄어든다.
const TIERS = [
  { coinW: 64, rowH: 44, step: 55, margin: 5, font: 10, words: 2, maxUnits: 4.6, stroke: 1.5 },
  { coinW: 54, rowH: 31, step: 40, margin: 4, font: 9, words: 1, maxUnits: 3.8, stroke: 1.2 },
];

// ♡ 글리프처럼 둥근 두 봉우리와 부드러운 끝을 가진 하트 외곽선(윗면 가운데 파인 곳에서 시작해 오른쪽으로 돈다).
const OUTLINE = (() => {
  const R = 1;
  const c = 0.9;
  const P = 2.35;
  const cleftAngle = Math.atan2(-Math.sqrt(R * R - c * c), -c);
  const d = Math.hypot(c, P);
  const phi = Math.atan2(P, -c);
  const tangent = phi - Math.acos(R / d);
  const right = [];
  for (let i = 0; i <= 200; i++) {
    const a = cleftAngle + ((tangent - cleftAngle) * i) / 200;
    right.push([c + R * Math.cos(a), R * Math.sin(a)]);
  }
  const [tx, ty] = right[right.length - 1];
  for (let i = 1; i <= 60; i++) right.push([tx + ((0 - tx) * i) / 60, ty + ((P - ty) * i) / 60]);
  const left = right.slice(1, -1).reverse().map(([x, y]) => [-x, y]);
  let pts = [...right, ...left];
  for (let pass = 0; pass < 14; pass++) {
    pts = pts.map((p, i) => {
      const a = pts[(i + pts.length - 1) % pts.length];
      const b = pts[(i + 1) % pts.length];
      return [(a[0] + 2 * p[0] + b[0]) / 4, (a[1] + 2 * p[1] + b[1]) / 4];
    });
  }
  const cum = [0];
  for (let i = 1; i <= pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i % pts.length];
    cum.push(cum[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1]));
  }
  const total = cum[cum.length - 1];
  return { pts, cum, total };
})();

function rawHeart(t) {
  const { pts, cum, total } = OUTLINE;
  const target = ((t / (Math.PI * 2)) % 1) * total;
  let lo = 0;
  let hi = cum.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (cum[mid] <= target) lo = mid; else hi = mid;
  }
  const a = pts[lo];
  const b = pts[(lo + 1) % pts.length];
  const f = (target - cum[lo]) / (cum[hi] - cum[lo] || 1);
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
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

  // 맨 아래 코인이 상자 바닥(V자 끝)에 닿도록, 가운데에 똑바로 놓을 수 있는 가장 낮은 위치부터 쌓는다.
  let yBottom = POLY_Y1;
  while (yBottom > POLY_Y0 && !fits(CENTER_X, yBottom, 0)) yBottom -= 0.5;

  const slots = [];
  for (let r = 0; ; r++) {
    const y = yBottom - r * t.rowH;
    if (y < POLY_Y0 + 8) break;
    const primary = r % 2 ? t.step / 2 : 0;
    const buildRow = off => {
      const row = [];
      for (let k = -halfCols; k <= halfCols; k++) {
        const bx = CENTER_X + k * t.step + off;
        const seed = r * 31 + (k + halfCols) * 7 + 1;
        const rot = (rand(seed + 2) - 0.5) * 28;
        // 바닥 줄은 흔들림 없이 똑바로, 나머지 줄은 조금씩 어긋나게 놓는다.
        const tries = r === 0
          ? [[bx, y, 0]]
          : [
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
    row.sort((p, q) => Math.abs(p.x - CENTER_X) - Math.abs(q.x - CENTER_X));
    slots.push(...row);
  }

  return { ...t, slots, capacity: slots.length, yBottom, coinD: toPath(coinPolygon(64, t.coinW)) };
}

export const COIN_ASPECT = (RAW_Y1 - RAW_Y0) / (RAW_X1 - RAW_X0);

export const LAYOUTS = TIERS.map(buildLayout);

// 메시지 수에 맞는 배치. 첫 단계에 다 들어가면 큰 코인, 넘치면 작은 코인.
export function layoutFor(count) {
  return count <= LAYOUTS[0].capacity ? LAYOUTS[0] : LAYOUTS[1];
}
