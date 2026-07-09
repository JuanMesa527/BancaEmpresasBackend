import { Router } from 'express';

/** Seguimiento agentico de activación y uso vía Fonema.ia */
export const activationFollowUpRouter = Router();

activationFollowUpRouter.get('/health', (_req, res) => {
  res.json({
    feature: 'activation-follow-up',
    status: 'scaffold',
    provider: 'fonema.ia',
  });
});
