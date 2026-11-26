import RecordCake from './RecordCake';
import HeartFrame from './HeartFrame';

export default function MainScreen({
  partyState, messages, status, page, onPageChange, lastAdded,
  onWriteClick, onZoomClick, onTitleClick,
}) {
  return (
    <div className="main-screen">
      <header className="main-header">
        <img className="main-logo main-logo--side" src="/images/logo_ddp.png" width="529" height="155" alt="DDP" draggable="false" />
        <h1 className="main-title">
          <button type="button" className="main-title-btn" onClick={onTitleClick} aria-label="First Anniversary, 처음 화면으로">
            <img className="main-logo main-logo--center" src="/images/logo_anniversary.png" width="420" height="71" alt="" draggable="false" />
          </button>
        </h1>
        <img className="main-logo main-logo--side" src="/images/logo_year.png" width="529" height="155" alt="돌잔치" draggable="false" />
      </header>

      <p className="main-invite">
        <span aria-hidden="true">♪</span> <strong>D.D.P 돌잔치</strong>에 축하 메세지를 남겨주세요 <span aria-hidden="true">♪</span>
      </p>

      <main className="main-content">
        <section className="main-left">
          <div className="cake-group">
            <RecordCake partyState={partyState} />
          </div>
        </section>

        <section className="main-right">
          <HeartFrame
            messages={messages}
            status={status}
            page={page}
            onPageChange={onPageChange}
            lastAdded={lastAdded}
            onWriteClick={onWriteClick}
            onZoomClick={onZoomClick}
          />
        </section>
      </main>

      <footer className="main-footer">
        D.D.P.(Designer DJ Party) 1주년 기념 파티
      </footer>
    </div>
  );
}
