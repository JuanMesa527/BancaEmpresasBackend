import path from 'node:path';
import { Router } from 'express';

const docsDir = path.join(process.cwd(), 'docs');

export const docsRouter = Router();

docsRouter.get('/openapi.yaml', (_req, res) => {
  res.type('application/yaml').sendFile(path.join(docsDir, 'openapi.yaml'));
});

docsRouter.get('/', (_req, res) => {
  res.sendFile(path.join(docsDir, 'index.html'));
});
