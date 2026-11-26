import { useState, useCallback, useEffect } from 'react';
import EntranceScreen from './components/EntranceScreen';
import MainScreen from './components/MainScreen';
import GuestbookScreen from './components/GuestbookScreen';
import ZoomView from './components/ZoomView';
import CelebrationEffect from './components/CelebrationEffect';
import DevControls from './components/DevControls';
import { usePartyState } from './hooks/usePartyState';
import { usePartyTest } from './hooks/usePartyTest';
import { useGuestbook } from './hooks/useGuestbook';

export default function App() {
  const [screen, setScreen] = useState('entrance');
  const [overrideTime, setOverrideTime] = useState(null);
  const [showCeleb, setShowCeleb] = useState(false);
  const [basketPage, setBasketPage] = useState(null);

  const partyTest = usePartyTest(screen !== 'main');
  const partyState = usePartyState(partyTest.testNow ?? overrideTime);
  const exitTest = partyTest.exit;

  useEffect(() => {
    if (screen === 'entrance') exitTest();
  }, [screen, exitTest]);

  const handlePreset = useCallback((time) => {
    exitTest();
    setOverrideTime(time);
  }, [exitTest]);
  const { messages, status, addMessage, submitting, lastAdded, clearLastAdded } = useGuestbook();

  useEffect(() => {
    const handlePop = () => {
      const s = window.history.state?.screen;
      if (s) setScreen(s);
      else setScreen('entrance');
    };
    window.addEventListener('popstate', handlePop);
    window.history.replaceState({ screen: 'entrance' }, '');
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  const navigate = useCallback((target) => {
    setScreen(target);
    window.history.pushState({ screen: target }, '');
  }, []);

  const handleEnter = useCallback(() => navigate('main'), [navigate]);
  const handleGoEntrance = useCallback(() => { window.history.back(); }, []);
  const handleWrite = useCallback(() => navigate('guestbook'), [navigate]);
  const handleZoom = useCallback(() => navigate('zoom'), [navigate]);
  const handleBack = useCallback(() => {
    window.history.back();
  }, []);

  const handleSubmit = useCallback(async (message) => {
    const result = await addMessage(message);
    if (result.success) {
      setScreen('main');
      window.history.replaceState({ screen: 'main' }, '');
      setBasketPage(null);
      setShowCeleb(true);
    }
    return result;
  }, [addMessage]);

  const handleCelebDone = useCallback(() => {
    setShowCeleb(false);
    clearLastAdded();
  }, [clearLastAdded]);

  return (
    <div className="app">
      {screen === 'entrance' && (
        <EntranceScreen onEnter={handleEnter} />
      )}

      {screen === 'main' && (
        <MainScreen
          partyState={partyState}
          partyTest={partyTest}
          messages={messages}
          status={status}
          page={basketPage}
          onPageChange={setBasketPage}
          lastAdded={lastAdded}
          onWriteClick={handleWrite}
          onZoomClick={handleZoom}
          onTitleClick={handleGoEntrance}
        />
      )}

      {screen === 'guestbook' && (
        <GuestbookScreen
          onBack={handleBack}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      )}

      {screen === 'zoom' && (
        <ZoomView messages={messages} status={status} onClose={handleBack} />
      )}

      {showCeleb && (
        <div className="toast" role="status">메시지가 등록되었어요 ♥</div>
      )}

      {showCeleb && (
        <CelebrationEffect
          active={showCeleb}
          onDone={handleCelebDone}
        />
      )}

      {screen !== 'entrance' && (
        <DevControls onTimeChange={handlePreset} />
      )}
    </div>
  );
}
