import { useCallback, useEffect, useRef, useState } from 'react';
import { getFeed, getMatches, postSwipe, resetDemo } from '../api.js';
import SwipeCard from './SwipeCard.jsx';
import MatchOverlay from './MatchOverlay.jsx';
import MatchesList from './MatchesList.jsx';

const EXIT_MS = 320;

export default function Discover({ active = true }) {
  const [view, setView] = useState('swipe'); // 'swipe' | 'matches'
  const [queue, setQueue] = useState(null); // null = loading
  const [matches, setMatches] = useState([]);
  const [exitDir, setExitDir] = useState(null);
  const [matchProfile, setMatchProfile] = useState(null);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const busy = useRef(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [feed, m] = await Promise.all([getFeed(), getMatches()]);
      setQueue(feed);
      setMatches(m);
    } catch (e) {
      setError(e.message || 'Could not load profiles');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1600);
    return () => clearTimeout(t);
  }, [toast]);

  const current = queue?.[0];

  const swipe = useCallback(
    async (action) => {
      if (!current || busy.current) return;
      busy.current = true;
      const profile = current;
      setExitDir(action);

      // Run the network call and the exit animation together.
      const [result] = await Promise.allSettled([
        postSwipe(profile.id, action),
        new Promise((r) => setTimeout(r, EXIT_MS)),
      ]).then((r) => [r[0]]);

      if (result.status === 'rejected') {
        // 409 means the server already has a swipe for this profile: drop it from the stack anyway.
        if (result.reason?.status === 409) {
          setQueue((q) => q.filter((p) => p.id !== profile.id));
        } else {
          setToast("Couldn't save that swipe. Try again.");
        }
        setExitDir(null);
        busy.current = false;
        return;
      }

      setQueue((q) => q.filter((p) => p.id !== profile.id));
      setExitDir(null);
      busy.current = false;

      if (result.value.match) {
        setMatchProfile(result.value.profile);
        setMatches((m) => [{ ...result.value.profile, matchedAt: Date.now() }, ...m]);
      } else {
        setToast(action === 'like' ? 'Liked ♥' : 'Passed');
      }
    },
    [current]
  );

  // Keyboard shortcuts for desktop.
  useEffect(() => {
    const onKey = (e) => {
      if (!active || view !== 'swipe' || matchProfile) return;
      if (e.key === 'ArrowRight') swipe('like');
      if (e.key === 'ArrowLeft') swipe('pass');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [swipe, view, matchProfile, active]);

  const startOver = async () => {
    try {
      await resetDemo();
      await load();
    } catch (e) {
      setToast(e.message);
    }
  };

  return (
    <section className="discover">
      <header className="discover-head">
        <h1>Discover</h1>
        <div className="seg" role="tablist" aria-label="Discover views">
          <button role="tab" aria-selected={view === 'swipe'} className={view === 'swipe' ? 'on' : ''} onClick={() => setView('swipe')}>
            Swipe
          </button>
          <button role="tab" aria-selected={view === 'matches'} className={view === 'matches' ? 'on' : ''} onClick={() => setView('matches')}>
            Matches{matches.length > 0 && <b className="count">{matches.length}</b>}
          </button>
        </div>
      </header>

      {view === 'matches' ? (
        <MatchesList matches={matches} onDiscover={() => setView('swipe')} />
      ) : error ? (
        <div className="state">
          <div className="state-emoji">📡</div>
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button className="btn primary" onClick={load}>Retry</button>
        </div>
      ) : queue === null ? (
        <div className="state"><div className="spinner" aria-label="Loading" /></div>
      ) : !current ? (
        <div className="state">
          <div className="state-emoji">✨</div>
          <h2>You're all caught up</h2>
          <p>No more profiles right now. Check back soon, or see who you've matched with.</p>
          <button className="btn primary" onClick={() => setView('matches')}>View matches</button>
          <button className="btn ghost" onClick={startOver}>Reset demo</button>
        </div>
      ) : (
        <>
          <div className="stack">
            {queue[1] && (
              <div className="card behind" aria-hidden="true">
                <img className="card-photo" src={queue[1].photo} alt="" draggable={false} />
              </div>
            )}
            <SwipeCard key={current.id} profile={current} exitDir={exitDir} interactive onSwipe={swipe} />
          </div>

          <div className="actions">
            <button className="round pass" aria-label="Pass" onClick={() => swipe('pass')}>✕</button>
            <button className="round like" aria-label="Like" onClick={() => swipe('like')}>♥</button>
          </div>
          <p className="hint">Drag the card, use the buttons, or press ← / →</p>
        </>
      )}

      {toast && <div className="toast" role="status">{toast}</div>}
      {matchProfile && <MatchOverlay profile={matchProfile} onClose={() => setMatchProfile(null)} onViewMatches={() => { setMatchProfile(null); setView('matches'); }} />}
    </section>
  );
}
