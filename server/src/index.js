import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { createStore } from './store.js';

const dir = path.dirname(fileURLToPath(import.meta.url));
const store = createStore(path.join(dir, '../data/db.json'));
const port = process.env.PORT || 4100;

createApp(store).listen(port, () => console.log(`Coy Discover API listening on http://localhost:${port}`));
