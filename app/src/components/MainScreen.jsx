import RecordCake from './RecordCake';
import PartyTestControls from './PartyTestControls';
import HeartFrame from './HeartFrame';

export default function MainScreen({
  partyState, partyTest, messages, page, onPageChange, lastAdded,
  onWriteClick, onZoomClick, onTitleClick,
}) {
  return (
    <div className="main-screen">
      <header className="main-header">
        <span className="header-deco" aria-hidden="true">✦ · ─ · ✦</span>
        <h1 className="main-title" style={{ cursor: 'pointer' }} onClick={onTitleClick}>First Anniversary</h1>
        <span className="header-deco" aria-hidden="true">✦ · ─ · ✦</span>
      </header>

      <main className="main-content">
        <section className="main-left">
          <div className="cake-group">
            <RecordCake
              partyState={partyState}
              test={partyTest.on ? { now: partyState.now } : null}
            />
            <PartyTestControls test={partyTest} />
          </div>
        </section>

        <section className="main-right">
          <HeartFrame
            messages={messages}
            page={page}
            onPageChange={onPageChange}
            lastAdded={lastAdded}
            onWriteClick={onWriteClick}
            onZoomClick={onZoomClick}
          />
        </section>
      </main>
    </div>
  );
}
