import HeartBasket from './HeartBasket';

export default function ZoomView({ messages, page, onPageChange, lastAdded, onClose }) {
  return (
    <div className="zoom-view">
      <div className="zoom-header">
        <h2>방명록 하트 바구니</h2>
        <button type="button" className="zoom-close" onClick={onClose}>✕ 닫기</button>
      </div>
      <div className="zoom-basket-wrap">
        <HeartBasket
          messages={messages}
          page={page}
          onPageChange={onPageChange}
          lastAdded={lastAdded}
          size="large"
        />
      </div>
    </div>
  );
}
