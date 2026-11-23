import { DJ_SCHEDULE } from '../data/schedule';

export default function PartyTestControls({ test }) {
  const { on, step, auto, total } = test;
  const ended = step >= total;
  const status = ended ? '공연 종료' : `공연 ${step + 1} / ${total} · ${DJ_SCHEDULE[step].name}`;

  return (
    <div className="party-test">
      <button
        type="button"
        className={`party-test-main${on ? ' is-on' : ''}`}
        onClick={on ? test.exit : test.enter}
      >
        {on ? '테스트 종료 · 현재 시간으로' : '파티 당일 모드 (테스트)'}
      </button>

      {on && (
        <div className="party-test-ops" role="group" aria-label="테스트 조작">
          <p className="party-test-status" aria-live="polite">{status}</p>
          <div className="party-test-row">
            <button type="button" onClick={test.prev} disabled={step === 0}>◀ 이전 공연</button>
            <button type="button" onClick={test.next} disabled={ended}>다음 공연 ▶</button>
            <button type="button" onClick={test.toggleAuto} aria-pressed={auto}>
              {auto ? '■ 자동 진행 정지' : '▶ 자동 진행 시작'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
