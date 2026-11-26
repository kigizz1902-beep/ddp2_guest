import { useState, useEffect } from 'react';
import { computePartyState } from '../lib/partyState';

export function usePartyState() {
  const [realNow, setRealNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setRealNow(new Date()), 30000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') setRealNow(new Date());
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return { ...computePartyState(realNow), now: realNow };
}
