import { DJ_SCHEDULE, PARTY_DATE, IS_SAMPLE_SCHEDULE } from '../data/schedule';

const SIZES = {
  large: { cover: 100, lp: 90, font: 14 },
  normal: { cover: 70, lp: 60, font: 11 },
  small: { cover: 52, lp: 44, font: 10 },
};

const px = n => `calc(${n}px * var(--rec-scale, 1))`;
const LP_SHOW = 0.35;

const hm = iso =>
  new Date(iso).toLocaleTimeString('ko-KR', {
    timeZone: 'Asia/Seoul',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });

const range = dj => `${hm(dj.startTime)}~${hm(dj.endTime)}`;

const chunk = (list, n) =>
  Array.from({ length: Math.ceil(list.length / n) }, (_, i) => list.slice(i * n, i * n + n));

function Candle() {
  return (
    <pre className="ascii-candle" aria-hidden="true">
      {'    '}<b className="candle-flame">*</b>{'\n   ( )\n  [___]\n\n  |   |\n  |   |\n  |___|'}
    </pre>
  );
}

function Candles({ count = 5 }) {
  return (
    <div className="candle-row">
      {Array.from({ length: count }, (_, i) => <Candle key={i} />)}
    </div>
  );
}

function RecordSet({ dj, size = 'normal', label, isNow = false, timeText, width }) {
  const s = SIZES[size];
  const setWidth = width ?? px(s.cover + s.lp * LP_SHOW + 16);

  return (
    <div className="record-set" style={{ width: setWidth }}>
      {label && <span className={`record-label${isNow ? ' is-now' : ''}`}>{label}</span>}
      <div className="record-art" aria-hidden="true">
        <div className="record-cover" style={{ width: px(s.cover), height: px(s.cover) }}>
          <span className="cover-name" style={{ fontSize: px(s.font) }}>{dj.name}</span>
          {size === 'large' && <span className="cover-time">{range(dj)}</span>}
        </div>
        <div
          className="record-lp"
          style={{ width: px(s.lp), height: px(s.lp), marginLeft: px(-s.lp * (1 - LP_SHOW)) }}
        >
          <span className="lp-ring" />
          <span className="lp-hole" />
        </div>
      </div>
      <span className="visually-hidden">{dj.name}</span>
      {timeText && <span className="record-time">{timeText}</span>}
      {dj.instaHandle && (
        dj.instaUrl
          ? <a className="record-insta" href={dj.instaUrl} target="_blank" rel="noopener noreferrer">{dj.instaHandle}</a>
          : <span className="record-insta">{dj.instaHandle}</span>
      )}
    </div>
  );
}

function CakeRow({ djs, size = 'normal', labelFn, timeFn }) {
  return (
    <div className="cake-row">
      {djs.map(dj => (
        <RecordSet
          key={dj.id}
          dj={dj}
          size={size}
          width="25%"
          label={labelFn?.(dj)}
          timeText={timeFn?.(dj)}
        />
      ))}
    </div>
  );
}

function DateStrip({ dDay }) {
  const text = dDay > 0 ? `D-${dDay}` : dDay === 0 ? 'D-Day' : '';
  return (
    <div className="date-strip">
      <span className="date-strip-text">
        {PARTY_DATE.replace(/-/g, '.')}
        {text && <span className="date-strip-dday"> {text}</span>}
      </span>
    </div>
  );
}

function TestBanner({ test }) {
  if (!test) return null;
  const when = test.now.toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  return (
    <p className="test-banner" role="status">
      테스트 중 · 가상 시각 {when}{IS_SAMPLE_SCHEDULE ? ' · 샘플 시간표' : ''}
    </p>
  );
}

const orderLabel = dj => `#${dj.order}`;

export default function RecordCake({ partyState, test }) {
  const { phase } = partyState;
  const all = DJ_SCHEDULE;
  const dDay = partyState.dDay ?? 0;

  if (phase === 'playing') {
    const { currentDJ, nextDJ } = partyState;
    const rest = all.filter(d => d.id !== currentDJ.id && d.id !== nextDJ?.id);
    return (
      <div className="record-cake">
        <TestBanner test={test} />
        <Candles count={1} />
        <RecordSet dj={currentDJ} size="large" label="♪ NOW" isNow />
        {nextDJ ? (
          <RecordSet dj={nextDJ} size="normal" label="NEXT" timeText={range(nextDJ)} />
        ) : (
          <p className="pre-show-notice">마지막 공연 · 다음 공연 없음</p>
        )}
        {chunk(rest, 4).map((row, i) => (
          <CakeRow
            key={i}
            djs={row}
            size="small"
            labelFn={orderLabel}
            timeFn={dj => hm(dj.startTime)}
          />
        ))}
        <DateStrip dDay={0} />
      </div>
    );
  }

  if (phase === 'day-before-start' || phase === 'gap') {
    const { nextDJ } = partyState;
    const rest = all.filter(d => d.id !== nextDJ.id);
    return (
      <div className="record-cake">
        <TestBanner test={test} />
        <Candles count={1} />
        <p className="pre-show-notice">
          {phase === 'gap' ? '다음 공연 대기 중' : '곧 공연이 시작됩니다!'}
        </p>
        <RecordSet
          dj={nextDJ}
          size="large"
          label={phase === 'gap' ? 'NEXT' : 'FIRST'}
        />
        {chunk(rest, 4).map((row, i) => (
          <CakeRow
            key={i}
            djs={row}
            size="small"
            labelFn={orderLabel}
            timeFn={dj => hm(dj.startTime)}
          />
        ))}
        <DateStrip dDay={0} />
      </div>
    );
  }

  const cakeRows = [all.slice(0, 2), all.slice(2, 6), all.slice(6, 10), all.slice(10, 14)];

  return (
    <div className="record-cake">
      <TestBanner test={test} />
      {phase === 'ended' ? (
        <p className="pre-show-notice">모든 공연이 끝났습니다. 감사합니다!</p>
      ) : (
        <Candles count={1} />
      )}
      {cakeRows.map((row, i) => (
        <CakeRow key={i} djs={row} size="normal" labelFn={orderLabel} />
      ))}
      <DateStrip dDay={dDay} />
    </div>
  );
}
