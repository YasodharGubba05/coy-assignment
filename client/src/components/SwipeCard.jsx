import { useRef, useState } from 'react';

const THRESHOLD = 110; // px of horizontal drag needed to commit a swipe
const FLY_DISTANCE = 1.4; // multiples of window width

function initials(name) {
  return name.slice(0, 1).toUpperCase();
}

/**
 * Presentational, draggable card. It never decides anything: on release it
 * reports 'like' | 'pass' through onSwipe, and the parent drives the exit
 * animation via `exitDir`.
 */
export default function SwipeCard({ profile, onSwipe, exitDir, interactive }) {
  const start = useRef(null);
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false });
  const [imgFailed, setImgFailed] = useState(false);

  const onPointerDown = (e) => {
    if (!interactive || exitDir) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY };
    setDrag({ x: 0, y: 0, active: true });
  };

  const onPointerMove = (e) => {
    if (!start.current) return;
    setDrag({ x: e.clientX - start.current.x, y: (e.clientY - start.current.y) * 0.4, active: true });
  };

  const end = () => {
    if (!start.current) return;
    start.current = null;
    if (Math.abs(drag.x) >= THRESHOLD) {
      onSwipe(drag.x > 0 ? 'like' : 'pass');
    } else {
      setDrag({ x: 0, y: 0, active: false }); // snap back
    }
  };

  let x = drag.x;
  let y = drag.y;
  let rot = drag.x / 18;
  let transition = drag.active ? 'none' : 'transform 0.3s cubic-bezier(.2,.8,.2,1), opacity 0.3s';
  let opacity = 1;

  if (exitDir) {
    x = (exitDir === 'like' ? 1 : -1) * window.innerWidth * FLY_DISTANCE;
    rot = exitDir === 'like' ? 24 : -24;
    opacity = 0;
    transition = 'transform 0.32s ease-in, opacity 0.32s ease-in';
  }

  const likeOpacity = exitDir === 'like' ? 1 : Math.min(Math.max(drag.x / THRESHOLD, 0), 1);
  const passOpacity = exitDir === 'pass' ? 1 : Math.min(Math.max(-drag.x / THRESHOLD, 0), 1);

  return (
    <div
      className="card"
      style={{
        transform: `translate(${x}px, ${y}px) rotate(${rot}deg)`,
        transition,
        opacity,
        cursor: interactive ? (drag.active ? 'grabbing' : 'grab') : 'default',
        pointerEvents: interactive ? 'auto' : 'none',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={end}
      onPointerCancel={end}
    >
      {imgFailed ? (
        <div className="card-photo fallback" aria-hidden="true">{initials(profile.name)}</div>
      ) : (
        <img
          className="card-photo"
          src={profile.photo}
          alt={`${profile.name}`}
          draggable={false}
          onError={() => setImgFailed(true)}
        />
      )}

      <div className="stamp like" style={{ opacity: likeOpacity }}>LIKE</div>
      <div className="stamp pass" style={{ opacity: passOpacity }}>NOPE</div>

      <div className="card-info">
        <h2>
          {profile.name}, <span>{profile.age}</span>
        </h2>
        <p className="place">📍 {profile.place}</p>
        <p className="bio">{profile.bio}</p>
        <ul className="chips">
          {profile.interests.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
