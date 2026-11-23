import { useState } from 'react';

export default function GuestbookScreen({ onBack, onSubmit, submitting }) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const trimMsg = message.trim();
    if (!trimMsg) { setError('메시지를 입력해주세요.'); return; }
    if (trimMsg.length > 100) { setError('메시지는 100자 이내로 입력해주세요.'); return; }
    const result = await onSubmit(trimMsg);
    if (!result.success) {
      setError('등록에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="guestbook-screen">
      <button className="guestbook-back" onClick={onBack}>
        ← 메인으로 돌아가기
      </button>

      <div className="guestbook-heart-outer">
        {/* SVG heart outline as background */}
        <svg
          className="guestbook-heart-svg"
          viewBox="0 0 400 440"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <path
            d="M200 420 C100 340 10 270 10 170 10 90 55 30 110 30 145 30 170 50 200 85 230 50 255 30 290 30 345 30 390 90 390 170 390 270 300 340 200 420Z"
            fill="white"
            stroke="#2a777e"
            strokeWidth="3"
          />
        </svg>

        {/* Form positioned in center safe area */}
        <form className="guestbook-heart-form" onSubmit={handleSubmit}>
          <h2 className="guestbook-heart-title">메시지 남기기</h2>

          <label className="guestbook-label guestbook-label--grow">
            <span className="guestbook-label-text">메시지</span>
            <textarea
              className="guestbook-textarea"
              value={message}
              onChange={e => setMessage(e.target.value)}
              maxLength={100}
              placeholder="축하 메시지를 남겨주세요"
              rows={5}
              disabled={submitting}
            />
            <span className="guestbook-counter">{message.length}/100</span>
          </label>

          {error && <p className="guestbook-error">{error}</p>}

          <button
            className="guestbook-submit"
            type="submit"
            disabled={submitting}
          >
            {submitting ? '등록 중...' : '등록하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
