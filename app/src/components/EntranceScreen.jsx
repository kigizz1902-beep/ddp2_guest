const OBJECTS = [
  {
    id: 'banana',
    ascii: `  _\n //\n//\n\\\\  \n \\\\_`,
    style: { top: '10%', left: '8%' },
    animClass: 'dance-bounce-slow',
  },
  {
    id: 'eyeball',
    ascii: ` .-"""-.\n/  o O  \\\n|  (_)  |\n\\       /\n '-...-'`,
    style: { top: '15%', right: '10%' },
    animClass: 'dance-sway',
  },
  {
    id: 'gummy-bear',
    ascii: ` /\\_/\\\n( o.o )\n > ^ <\n/|   |\\\n\\_____/`,
    style: { bottom: '25%', left: '5%' },
    animClass: 'dance-wiggle',
  },
  {
    id: 'pottery',
    ascii: `  ___\n /   \\\n|     |\n|     |\n \\___/\n  |_|`,
    style: { top: '55%', right: '8%' },
    animClass: 'dance-tilt',
  },
  {
    id: 'snake',
    ascii: `  __\n~(  )~~~\n  \\(\n   \\>`,
    style: { bottom: '15%', right: '20%' },
    animClass: 'dance-slither',
  },
  {
    id: 'spider',
    ascii: ` /\\ /\\\n{  ' '  }\n \\/|\\/\n   |`,
    style: { top: '8%', left: '45%' },
    animClass: 'dance-dangle',
  },
  {
    id: 'norigae',
    ascii: `  *\n )|(\n/ | \\\n| | |\n\\ | /\n )|(\n  |\n /|\\\n/ | \\`,
    style: { bottom: '30%', right: '35%' },
    animClass: 'dance-pendulum',
  },
];

export default function EntranceScreen({ onEnter }) {
  return (
    <div className="entrance-screen">
      {OBJECTS.map(obj => (
        <pre
          key={obj.id}
          className={`entrance-object ${obj.animClass}`}
          style={obj.style}
          aria-hidden="true"
        >
          {obj.ascii}
        </pre>
      ))}

      <span className="entrance-note dance-bounce-slow" style={{ top: '20%', left: '30%' }} aria-hidden="true">♪</span>
      <span className="entrance-note dance-sway" style={{ top: '40%', right: '25%' }} aria-hidden="true">♫</span>
      <span className="entrance-note dance-wiggle" style={{ bottom: '20%', left: '25%' }} aria-hidden="true">♬</span>
      <span className="entrance-note dance-tilt" style={{ top: '70%', left: '60%' }} aria-hidden="true">✦</span>

      <div className="entrance-center">
        <p className="entrance-ascii-deco" aria-hidden="true">✦ · ─ ♪ ─ · ✦</p>
        <h1 className="entrance-title">DDP</h1>
        <p className="entrance-subtitle">2nd Anniversary DJ Party</p>
        <p className="entrance-ascii-deco" aria-hidden="true">✦ · ─ ♫ ─ · ✦</p>
        <button className="entrance-enter-btn" onClick={onEnter}>
          ENTER
        </button>
      </div>
    </div>
  );
}
