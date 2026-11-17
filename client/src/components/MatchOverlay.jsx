export default function MatchOverlay({ profile, onClose, onViewMatches }) {
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="It's a match">
      <div className="confetti" aria-hidden="true">
        {Array.from({ length: 18 }, (_, i) => (
          <i key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 6) * 0.12}s` }} />
        ))}
      </div>
      <h2 className="match-title">It's a match!</h2>
      <p className="match-sub">You and {profile.name} liked each other.</p>
      <img className="match-photo" src={profile.photo} alt={profile.name} />
      <button className="btn primary" onClick={onViewMatches}>See all matches</button>
      <button className="btn ghost light" onClick={onClose}>Keep swiping</button>
    </div>
  );
}
