import { Router } from 'express';

/** Envío de correos (Resend) + confirmación de activación */
export const activationEmailRouter = Router();

activationEmailRouter.get('/health', (_req, res) => {
  res.json({ feature: 'activation-email', status: 'scaffold', provider: 'resend' });
});
