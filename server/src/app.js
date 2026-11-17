import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createService, HttpError } from './service.js';

export function createApp(store, { profiles, allowReset = true } = {}) {
  const service = createService(store, profiles);
  const api = express.Router();

  api.get('/feed', (_req, res) => res.json({ profiles: service.feed() }));

  api.post('/swipe', (req, res) => {
    const { profileId, action } = req.body ?? {};
    res.json(service.swipe(profileId, action));
  });

  api.get('/matches', (_req, res) => res.json({ matches: service.matches() }));

  // Demo helper: wipe swipes so the flow can be shown again.
  if (allowReset) {
    api.post('/reset', (_req, res) => {
      store.reset();
      res.json({ ok: true });
    });
  }

  const app = express();
  app.disable('x-powered-by');
  app.use(cors());
  app.use(express.json({ limit: '10kb' }));
  // Spec paths (/feed, /swipe, /matches) plus an /api prefix for the dev proxy.
  app.use('/api', api);
  app.use('/', api);

  // Serve the built client in production (`npm start`).
  const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist');
  if (fs.existsSync(dist)) {
    app.use(express.static(dist));
    app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
  }

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
    if (err?.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON' });
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
