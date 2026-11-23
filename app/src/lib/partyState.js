import { DJ_SCHEDULE, PARTY_DATE } from '../data/schedule';

const seoulDay = date => date.toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });
const dayNumber = ymd => {
  const [y, m, d] = ymd.split('-').map(Number);
  return Date.UTC(y, m - 1, d) / 86400000;
};

export function getDDay(now) {
  return dayNumber(PARTY_DATE) - dayNumber(seoulDay(now));
}

// 실제 서비스와 테스트 모드가 함께 쓰는 단일 NOW·NEXT 판정 로직.
export function computePartyState(now, schedule = DJ_SCHEDULE) {
  const t = now.getTime();
  const ms = iso => new Date(iso).getTime();
  const dDay = getDDay(now);

  if (t < ms(schedule[0].startTime)) {
    return dDay > 0
      ? { phase: 'before', dDay }
      : { phase: 'day-before-start', dDay, nextDJ: schedule[0] };
  }

  if (t >= ms(schedule[schedule.length - 1].endTime)) {
    return { phase: 'ended', dDay };
  }

  const i = schedule.findIndex(dj => t >= ms(dj.startTime) && t < ms(dj.endTime));
  if (i >= 0) {
    return {
      phase: 'playing',
      dDay,
      currentIndex: i,
      currentDJ: schedule[i],
      nextDJ: schedule[i + 1] ?? null,
    };
  }

  const next = schedule.findIndex(dj => t < ms(dj.startTime));
  return { phase: 'gap', dDay, nextDJ: schedule[next] };
}

// 테스트 단계: 0..N-1은 해당 DJ 시작 시각, N은 마지막 공연 종료 시각(종료 상태).
export function virtualTimeForStep(step, schedule = DJ_SCHEDULE) {
  return step >= schedule.length
    ? new Date(schedule[schedule.length - 1].endTime)
    : new Date(schedule[step].startTime);
}
