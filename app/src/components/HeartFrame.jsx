import HeartBasket from './HeartBasket';

function HeartButton({ label, filled, onClick }) {
  const stroke = filled ? '#f277ad' : '#2a777e';
  return (
    <button type="button" className="heart-shape-btn" onClick={onClick}>
      <svg width="140" height="60" viewBox="0 0 140 60" aria-hidden="true">
        <path
          d="M70 55 C40 40 5 30 5 18 5 8 18 2 30 2 42 2 55 8 70 20 85 8 98 2 110 2 122 2 135 8 135 18 135 30 100 40 70 55Z"
          fill={filled ? '#f277ad' : '#ffffff'}
          stroke={stroke}
          strokeWidth="2"
        />
      </svg>
      <span className={`heart-shape-btn-label${filled ? ' is-filled' : ''}`}>{label}</span>
    </button>
  );
}

export default function HeartFrame({ messages, status, page, onPageChange, lastAdded, onWriteClick, onZoomClick }) {
  return (
    <div className="heart-frame-container">
      <HeartBasket
        messages={messages}
        status={status}
        page={page}
        onPageChange={onPageChange}
        lastAdded={lastAdded}
      />
      <div className="heart-frame-buttons">
        <HeartButton label="메시지 남기기" filled onClick={onWriteClick} />
        <HeartButton label="확대하기" filled={false} onClick={onZoomClick} />
      </div>
    </div>
  );
}
