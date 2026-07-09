import { Router } from 'express';

/**
 * PowerApps: HITL previo a la etapa de entrega física.
 * El correo al gerente lo orquesta delivery-confirmation (no PowerApps).
 */
export const powerAppsRouter = Router();

powerAppsRouter.get('/health', (_req, res) => {
  res.json({ feature: 'power-apps', status: 'scaffold', next: 'delivery-confirmation' });
});
