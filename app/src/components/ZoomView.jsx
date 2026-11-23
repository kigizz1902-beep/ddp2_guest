import HeartGrid from './HeartGrid';

export default function ZoomView({ messages, onClose }) {
  return (
    <div className="zoom-view">
      <div className="zoom-header">
        <h2>방명록 하트 모아보기</h2>
        <button type="button" className="zoom-close" onClick={onClose}>✕ 닫기</button>
      </div>
      <div className="zoom-body">
        <HeartGrid messages={messages} />
      </div>
    </div>
  );
}
