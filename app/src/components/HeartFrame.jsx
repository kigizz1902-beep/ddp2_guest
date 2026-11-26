import HeartBasket from './HeartBasket';

function HeartOutlineIcon() {
  return (
    <svg className="pill-btn-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 20.4S3.6 15.3 3.6 9.3a4.6 4.6 0 0 1 8.4-2.6 4.6 4.6 0 0 1 8.4 2.6c0 6-8.4 11.1-8.4 11.1z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg className="pill-btn-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
        actions={(
          <div className="heart-frame-buttons">
            <button type="button" className="pill-btn pill-btn--primary" onClick={onWriteClick}>
              <HeartOutlineIcon />
              메시지 남기기
            </button>
            <button type="button" className="pill-btn pill-btn--outline" onClick={onZoomClick}>
              <ExpandIcon />
              크게 보기
            </button>
          </div>
        )}
      />
    </div>
  );
}
