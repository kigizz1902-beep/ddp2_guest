// d = 포스터(1620x2160) 기준 [가로 중심 %, 세로 중심 %, 이미지 폭 %]. 포스터에서 실제 보이는 영역에 맞춰 계산한 값.
// 모든 화면이 같은 값을 쓰고, 무대 크기만 화면에 맞춰 달라진다.
const OBJECTS = [
  { id: 'banana', w: 511,  h: 639, d: [7.34, 22.58, 30.82], anim: 'dance-tilt',        dur: '4.6s', delay: '-1.5s' },
  { id: 'eye',    w: 201,  h: 188, d: [31.34, 16.76, 12.24],  anim: 'dance-sway',        dur: '3.6s', delay: '-0.5s' },
  { id: 'objet',  w: 430,  h: 492, d: [79.91, 21.48, 26.17], anim: 'dance-sway',        dur: '5.4s', delay: '-2.2s' },
  { id: 'jelly',  w: 442,  h: 411, d: [22.77, 32.11, 27.12],   anim: 'dance-wiggle',      dur: '2.8s', delay: '-0.9s' },
  { id: 'phone',  w: 341,  h: 510, d: [94.63, 39.32, 20.28], anim: 'dance-wiggle',      dur: '3.1s', delay: '-0.2s' },
  { id: 'pin',    w: 343,  h: 193, d: [78.81, 38.1, 20.99], anim: 'dance-tilt',        dur: '3.8s', delay: '-2.4s' },
  { id: 'spider', w: 640,  h: 800, d: [68.74, 56.15, 45.16], anim: 'dance-dangle',      dur: '3.2s', delay: '-1.1s' },
  { id: 'snake',  w: 497,  h: 470, d: [32.33, 50.9, 30.42], anim: 'dance-slither',     dur: '4.2s', delay: '-0.8s' },
  { id: 'star',   w: 168,  h: 120, d: [3.01, 50.49, 10.27],  anim: 'dance-bounce-slow', dur: '2.6s', delay: '-1.6s' },
  { id: 'leaf',   w: 640,  h: 800, d: [18.22, 65.33, 24.61], anim: 'dance-sway',        dur: '5.2s', delay: '-2s' },
  { id: 'closs',  w: 181,  h: 226, d: [45.32, 69.8, 11.12],  anim: 'dance-pendulum',    dur: '3.4s', delay: '-1.3s' },
  { id: 'candy',  w: 320,  h: 409, d: [58.59, 82.32, 19.6], anim: 'dance-pendulum',    dur: '4.4s', delay: '-0.6s' },
  { id: 'gold',   w: 1100, h: 618, d: [27.88, 85.43, 45.86],  anim: 'dance-bounce-slow', dur: '6s',   delay: '-0.3s' },
  { id: 'acc',    w: 620,  h: 793, d: [80.76, 81.65, 38.15], anim: 'dance-pendulum',    dur: '6.4s', delay: '-1.8s' },
];

export default function EntranceScreen({ onEnter }) {
  return (
    <div className="entrance-screen">
      <div className="entrance-frame">
        <h1 className="visually-hidden">DDP 돌잔치 · First Anniversary</h1>

        <header className="entrance-header">
          <img src="/images/logo_ddp.png" width="529" height="155" alt="" draggable="false" />
          <img src="/images/logo_year.png" width="529" height="155" alt="" draggable="false" />
        </header>


        <div className="entrance-stage">
          <div className="entrance-center">
            <button className="entrance-enter-btn" onClick={onEnter}>
              <span className="entrance-cd" aria-hidden="true">💿</span>
              <span className="entrance-info entrance-enter-label">입장하기</span>
            </button>
          </div>
          {OBJECTS.map(o => (
            <div
              key={o.id}
              className="entrance-obj"
              aria-hidden="true"
              style={{ '--x': `${o.d[0]}%`, '--y': `${o.d[1]}%`, '--w': `${o.d[2]}%` }}
            >
              <img
                className={o.anim}
                style={{ animationDuration: o.dur, animationDelay: o.delay }}
                src={`/images/main/${o.id}.webp`}
                width={o.w}
                height={o.h}
                alt=""
                draggable="false"
              />
            </div>
          ))}
        </div>

        <footer className="entrance-footer">
          <p className="entrance-info entrance-info--place">@LVHS (이태원로 23길 6)</p>
          <div className="entrance-footer-center">
            <img src="/images/logo_anniversary.png" width="420" height="71" alt="" draggable="false" />
            <p className="entrance-info entrance-info--date">26. 11. 28. SAT.</p>
          </div>
          <p className="entrance-info entrance-info--time">10PM - 3AM</p>
        </footer>
      </div>
    </div>
  );
}
