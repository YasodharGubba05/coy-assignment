import fs from 'node:fs';
import path from 'node:path';

const EMPTY = () => ({ swipes: {} });

/**
 * Tiny JSON-file store. Swipes are keyed by profile id, which makes
 * "one swipe per profile" a structural guarantee rather than a check.
 * Writes are atomic (temp file + rename) so a crash cannot corrupt the file.
 * Pass `filePath = null` for a pure in-memory store (used in tests).
 */
export function createStore(filePath) {
  let state = EMPTY();

  if (filePath) {
    try {
      const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (parsed && typeof parsed.swipes === 'object') state = { swipes: parsed.swipes };
    } catch {
      // Missing or corrupt file: start fresh.
    }
  }

  function persist() {
    if (!filePath) return;
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    const tmp = `${filePath}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
    fs.renameSync(tmp, filePath);
  }

  return {
    getSwipe: (profileId) => state.swipes[profileId] ?? null,
    allSwipes: () => ({ ...state.swipes }),
    saveSwipe(profileId, swipe) {
      state.swipes[profileId] = swipe;
      persist();
    },
    reset() {
      state = EMPTY();
      persist();
    },
  };
}
