import { useState } from 'react';
import Discover from './components/Discover.jsx';

const TABS = [
  { id: 'home', label: 'Home', icon: '⌂' },
  { id: 'discover', label: 'Discover', icon: '♥' },
];

export default function App() {
  const [tab, setTab] = useState('discover');

  return (
    <div className="app">
      <main className="screen">
        {/* Home is intentionally blank: it stands in for Coy's existing experience. */}
        {tab === 'home' && <div className="home-placeholder" aria-label="Home (placeholder)" />}
        {/* Discover stays mounted so swipe state survives tab switches. */}
        <div hidden={tab !== 'discover'} className="screen-fill">
          <Discover active={tab === 'discover'} />
        </div>
      </main>

      <nav className="tabbar" role="tablist" aria-label="Main">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <span className="tab-icon" aria-hidden="true">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
