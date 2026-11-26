import { DJ_SCHEDULE, PARTY_DATE } from '../data/schedule';

const SIZES = {
  large: { cover: 100, lp: 110, ig: 20 },
  normal: { cover: 70, lp: 77, ig: 15 },
  small: { cover: 52, lp: 57, ig: 12 },
};

const px = n => `calc(${n}px * var(--rec-scale, 1))`;
const LP_SHOW = 0.35;
const COVER_RATIO = 4 / 3; // 커버 이미지는 3:4 세로

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

const IG_PATH =
  'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zM7 4a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7z' +
  'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM17.5 5.2a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6z';

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

function RecordSet({ dj, size = 'normal', tag, label, isNow = false, timeText, width }) {
  const s = SIZES[size];
  const setWidth = width ?? px(s.cover + s.lp * LP_SHOW + 16);

  const art = (
    <>
      <div className="record-cover" style={{ width: px(s.cover), height: px(s.cover * COVER_RATIO) }}>
        <img className="cover-img" src={dj.cover} width="360" height="480" alt="" draggable="false" />
      </div>
      <div
        className="record-lp"
        style={{ width: px(s.lp), height: px(s.lp), marginLeft: px(-s.lp * (1 - LP_SHOW)) }}
      >
        <span className="lp-ring" />
        <span className="lp-hole" />
        {dj.instaUrl && (
          <svg
            className="record-ig"
            viewBox="0 0 24 24"
            aria-hidden="true"
            style={{ width: px(s.ig), height: px(s.ig), right: px(s.lp * ((1 - (1 - LP_SHOW)) / 2) - s.ig / 2) }}
          >
            <path fillRule="evenodd" d={IG_PATH} />
          </svg>
        )}
      </div>
    </>
  );

  return (
    <div className="record-set" style={{ width: setWidth, '--art-w': px(s.cover + s.lp * LP_SHOW) }}>
      {(tag || label) && (
        <div className="record-labels">
          {tag && <span className={`record-label record-tag${isNow ? ' is-now' : ''}`}>{tag}</span>}
          {label && <span className="record-label">{label}</span>}
        </div>
      )}
      {dj.instaUrl ? (
        <a
          className="record-art record-link"
          href={dj.instaUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${dj.djNo} ${dj.name} 인스타그램 열기 (새 탭)`}
        >
          {art}
        </a>
      ) : (
        <div className="record-art" role="img" aria-label={`${dj.djNo} ${dj.name}`}>{art}</div>
      )}
      {timeText && <span className="record-time">{timeText}</span>}
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

const orderLabel = dj => `#${dj.order} ${dj.name}`;

export default function RecordCake({ partyState }) {
  const { phase } = partyState;
  const all = DJ_SCHEDULE;
  const dDay = partyState.dDay ?? 0;

  if (phase === 'playing') {
    const { currentDJ, nextDJ } = partyState;
    const rest = all.filter(d => d.id !== currentDJ.id && d.id !== nextDJ?.id);
    return (
      <div className="record-cake">
        <Candles count={1} />
        <RecordSet dj={currentDJ} size="large" tag={<><span className="note-move" aria-hidden="true">♪</span> NOW</>} label={orderLabel(currentDJ)} isNow timeText={range(currentDJ)} />
        {nextDJ ? (
          <RecordSet dj={nextDJ} size="normal" tag="NEXT" label={orderLabel(nextDJ)} timeText={range(nextDJ)} />
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
        <Candles count={1} />
        <p className="pre-show-notice">
          {phase === 'gap' ? '다음 공연 대기 중' : '곧 공연이 시작됩니다!'}
        </p>
        <RecordSet
          dj={nextDJ}
          size="large"
          tag={phase === 'gap' ? 'NEXT' : 'FIRST'}
          label={orderLabel(nextDJ)}
          timeText={range(nextDJ)}
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
      {phase === 'ended' ? (
        <p className="end-notice">
          <span aria-hidden="true">🎉</span>
          <span>모든 공연이 끝났습니다. 감사합니다!</span>
          <span aria-hidden="true">🎉</span>
        </p>
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
