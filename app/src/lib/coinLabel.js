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
