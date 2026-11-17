export default function MatchesList({ matches, onDiscover }) {
  if (matches.length === 0) {
    return (
      <div className="state">
        <div className="state-emoji">💌</div>
        <h2>No matches yet</h2>
        <p>Matches appear only when you both like each other. Keep swiping!</p>
        <button className="btn primary" onClick={onDiscover}>Start swiping</button>
      </div>
    );
  }
  return (
    <ul className="matches">
      {matches.map((m) => (
        <li key={m.id}>
          <img src={m.photo} alt="" />
          <div>
            <strong>{m.name}, {m.age}</strong>
            <span>{m.place}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
