import { Router } from 'express';

/**
 * PowerApps: tras aprobación HITL, hace POST hacia activation-email
 * con la confirmación para disparar el correo.
 */
export const powerAppsRouter = Router();

powerAppsRouter.get('/health', (_req, res) => {
  res.json({ feature: 'power-apps', status: 'scaffold', next: 'activation-email' });
});
