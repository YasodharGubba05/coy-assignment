async function request(path, options) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const getFeed = () => request('/feed').then((d) => d.profiles);
export const getMatches = () => request('/matches').then((d) => d.matches);
export const postSwipe = (profileId, action) =>
  request('/swipe', { method: 'POST', body: JSON.stringify({ profileId, action }) });
export const resetDemo = () => request('/reset', { method: 'POST' });
