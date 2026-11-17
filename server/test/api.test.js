import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createApp } from '../src/app.js';
import { createStore } from '../src/store.js';
import { profiles } from '../src/seed.js';

const likers = profiles.filter((p) => p.likedMe);
const nonLikers = profiles.filter((p) => !p.likedMe);

let server, base, store;
const call = async (method, url, body) => {
  const res = await fetch(base + url, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, body: await res.json() };
};

function start(s) {
  return new Promise((resolve) => {
    server = createApp(s).listen(0, () => {
      base = `http://localhost:${server.address().port}`;
      resolve();
    });
  });
}

describe('seed data', () => {
  test('has >= 30 profiles with required fields, and some who liked the user', () => {
    assert.ok(profiles.length >= 30);
    for (const p of profiles) {
      for (const k of ['name', 'age', 'photo', 'bio', 'place']) assert.ok(p[k], `${p.id} missing ${k}`);
      assert.ok(p.interests.length > 0);
    }
    assert.ok(likers.length >= 5);
    assert.ok(nonLikers.length >= 5);
  });
});

describe('API', () => {
  before(async () => {
    store = createStore(null);
    await start(store);
  });
  after(() => server.close());

  test('GET /feed returns all profiles initially and never leaks who liked the user', async () => {
    const { status, body } = await call('GET', '/feed');
    assert.equal(status, 200);
    assert.equal(body.profiles.length, profiles.length);
    assert.ok(!JSON.stringify(body).toLowerCase().includes('likedme'));
    assert.ok(!JSON.stringify(body).toLowerCase().includes('likesme'));
  });

  test('liking someone who did NOT like you is not a match', async () => {
    const { status, body } = await call('POST', '/swipe', { profileId: nonLikers[0].id, action: 'like' });
    assert.equal(status, 200);
    assert.equal(body.match, false);
    assert.equal(body.profile, null);
  });

  test('passing never produces a match, even on someone who liked you', async () => {
    const { body } = await call('POST', '/swipe', { profileId: likers[0].id, action: 'pass' });
    assert.equal(body.match, false);
  });

  test('liking someone who liked you creates a match', async () => {
    const { body } = await call('POST', '/swipe', { profileId: likers[1].id, action: 'like' });
    assert.equal(body.match, true);
    assert.equal(body.profile.id, likers[1].id);
    assert.ok(!('likedMe' in body.profile));
  });

  test('swiped profiles disappear from /feed', async () => {
    const { body } = await call('GET', '/feed');
    const ids = body.profiles.map((p) => p.id);
    for (const id of [nonLikers[0].id, likers[0].id, likers[1].id]) assert.ok(!ids.includes(id));
    assert.equal(ids.length, profiles.length - 3);
  });

  test('/matches contains only mutual matches (not passes, not one-way likes)', async () => {
    const { body } = await call('GET', '/matches');
    assert.deepEqual(body.matches.map((m) => m.id), [likers[1].id]);
    assert.ok(!JSON.stringify(body).toLowerCase().includes('likedme'));
  });

  test('re-swiping is rejected, so a pass cannot be flipped into a like to probe', async () => {
    const { status } = await call('POST', '/swipe', { profileId: likers[0].id, action: 'like' });
    assert.equal(status, 409);
    const { body } = await call('GET', '/matches');
    assert.equal(body.matches.length, 1);
  });

  test('validates input', async () => {
    assert.equal((await call('POST', '/swipe', { profileId: 'nope', action: 'like' })).status, 404);
    assert.equal((await call('POST', '/swipe', { profileId: 'p1', action: 'superlike' })).status, 400);
    assert.equal((await call('POST', '/swipe', {})).status, 404);
    const bad = await fetch(base + '/swipe', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{oops' });
    assert.equal(bad.status, 400);
  });

  test('feed empties once everyone is swiped', async () => {
    const { body: feed } = await call('GET', '/feed');
    for (const p of feed.profiles) await call('POST', '/swipe', { profileId: p.id, action: 'pass' });
    const { body } = await call('GET', '/feed');
    assert.deepEqual(body.profiles, []);
  });
});

describe('persistence', () => {
  test('swipes and matches survive a restart (new store on same file)', async () => {
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'coy-')), 'db.json');
    await start(createStore(file));
    await call('POST', '/swipe', { profileId: likers[0].id, action: 'like' });
    server.close();

    await start(createStore(file));
    const { body: m } = await call('GET', '/matches');
    assert.deepEqual(m.matches.map((x) => x.id), [likers[0].id]);
    const { body: f } = await call('GET', '/feed');
    assert.ok(!f.profiles.some((p) => p.id === likers[0].id));
    server.close();
  });

  test('a corrupt db file does not crash the server', async () => {
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'coy-')), 'db.json');
    fs.writeFileSync(file, '{not json');
    await start(createStore(file));
    const { status, body } = await call('GET', '/feed');
    assert.equal(status, 200);
    assert.equal(body.profiles.length, profiles.length);
    server.close();
  });
});
