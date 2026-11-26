import { useMemo } from 'react';
import HeartGrid from './HeartGrid';

// 최신 글이 맨 앞. 시각이 같거나 읽을 수 없으면 들어온 순서의 반대로 둔다.
const newestFirst = list => list
  .map((m, i) => ({ m, i, t: Date.parse(m.createdAt) || 0 }))
  .sort((a, b) => b.t - a.t || b.i - a.i)
  .map(x => x.m);

export default function ZoomView({ messages, status, onClose }) {
  const sorted = useMemo(() => newestFirst(messages), [messages]);
  return (
    <div className="zoom-view">
      <div className="zoom-header">
        <h2>방명록 하트 모아보기</h2>
        <button type="button" className="zoom-close" onClick={onClose}>✕ 닫기</button>
      </div>
      <div className="zoom-body">
        <HeartGrid messages={sorted} status={status} />
      </div>
    </div>
  );
}
