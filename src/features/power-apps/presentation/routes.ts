import { Router } from 'express';
import { submitPowerAppHandler } from './power-apps.controller.js';

/**
 * Simulador de Power App: valida solicitud de TC LATAM Business
 * y retorna decisión para el área de operaciones.
 */
export const powerAppsRouter = Router();

powerAppsRouter.get('/health', (_req, res) => {
  res.json({
    feature: 'power-apps',
    status: 'ready',
    endpoints: {
      submit: 'POST /api/power-apps/submit',
    },
  });
});

powerAppsRouter.post('/submit', submitPowerAppHandler);
