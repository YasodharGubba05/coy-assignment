import { profiles as defaultProfiles, toPublic } from './seed.js';

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/**
 * All matching rules live here, free of Express, so they are easy to test.
 *
 * Privacy invariant: whether someone liked the user (`likedMe`) is only ever
 * consulted inside `swipe()` at the instant the user likes them back. It is
 * never included in /feed, never in swipe responses for passes, and /matches
 * only ever contains people the user has also liked.
 */
export function createService(store, profiles = defaultProfiles, now = () => Date.now()) {
  const byId = new Map(profiles.map((p) => [p.id, p]));

  function feed() {
    return profiles.filter((p) => !store.getSwipe(p.id)).map(toPublic);
  }

  function swipe(profileId, action) {
    if (typeof profileId !== 'string' || !byId.has(profileId)) {
      throw new HttpError(404, 'Profile not found');
    }
    if (action !== 'like' && action !== 'pass') {
      throw new HttpError(400, "action must be 'like' or 'pass'");
    }

    const existing = store.getSwipe(profileId);
    if (existing) {
      // A profile can only be swiped once; never allow flipping a pass into a like
      // (or re-rolling a like) to probe whether someone liked the user.
      throw new HttpError(409, 'Already swiped on this profile');
    }

    const profile = byId.get(profileId);
    const isMatch = action === 'like' && profile.likedMe === true;
    store.saveSwipe(profileId, { action, matched: isMatch, at: now() });

    return { match: isMatch, profile: isMatch ? toPublic(profile) : null };
  }

  function matches() {
    return Object.entries(store.allSwipes())
      .filter(([, s]) => s.action === 'like' && s.matched === true)
      .sort(([, a], [, b]) => b.at - a.at)
      .map(([id, s]) => ({ ...toPublic(byId.get(id)), matchedAt: s.at }));
  }

  return { feed, swipe, matches };
}
