// 코인 위에 보여줄 글자: 메시지의 앞 두 단어. 코인 폭에 맞게 단어별로 줄이고 '…'을 붙인다.
const ELLIPSIS = 0.6;

const unit = ch => (ch.codePointAt(0) > 0x2000 ? 1 : 0.55);

function fit(word, maxUnits) {
  const total = [...word].reduce((sum, ch) => sum + unit(ch), 0);
  if (total <= maxUnits) return word;
  let used = 0;
  let out = '';
  for (const ch of word) {
    if (used + unit(ch) > maxUnits - ELLIPSIS) break;
    out += ch;
    used += unit(ch);
  }
  return `${out}…`;
}

export function coinLabel(message, words, maxUnits) {
  return message.trim().split(/\s+/).filter(Boolean).slice(0, words).map(w => fit(w, maxUnits));
}

// 크게 보기용: 메시지 전체를 상자(boxW x boxH) 안에 줄바꿈해 넣고, 들어가는 가장 큰 글자 크기를 고른다.
const MAX_SIZE = 5.4;
const MIN_SIZE = 2.2;
const LINE = 1.3;
const wide = ch => (ch.codePointAt(0) > 0x2000 ? 1 : 0.6);

function wrap(text, size, maxW) {
  const lines = [];
  let line = '';
  let used = 0;
  const push = () => { if (line.trim()) lines.push(line.trim()); line = ''; used = 0; };
  for (const word of text.trim().split(/\s+/)) {
    const wW = [...word].reduce((a, c) => a + wide(c) * size, 0);
    const sp = line ? 0.3 * size : 0;
    if (line && used + sp + wW <= maxW) { line += ' ' + word; used += sp + wW; continue; }
    push();
    if (wW <= maxW) { line = word; used = wW; continue; }
    for (const ch of word) {
      const cw = wide(ch) * size;
      if (used + cw > maxW) push();
      line += ch; used += cw;
    }
  }
  push();
  return lines;
}

export function fitMessage(message, boxW, boxH) {
  let size = MAX_SIZE;
  for (;;) {
    const lines = wrap(message, size, boxW);
    if (lines.length * size * LINE <= boxH || size <= MIN_SIZE) return { lines, size, gap: size * LINE };
    size = Math.round((size - 0.1) * 100) / 100;
  }
}
