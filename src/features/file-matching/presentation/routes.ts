import { Router } from 'express';

/** Cruce de archivos: base potencial × CEC */
export const fileMatchingRouter = Router();

fileMatchingRouter.get('/health', (_req, res) => {
  res.json({ feature: 'file-matching', status: 'scaffold', sources: ['base_potencial', 'cec'] });
});
