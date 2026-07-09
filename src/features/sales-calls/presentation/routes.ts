import { Router } from 'express';

/** Llamadas agenticas de venta vía Fonema.ia */
export const salesCallsRouter = Router();

salesCallsRouter.get('/health', (_req, res) => {
  res.json({ feature: 'sales-calls', status: 'scaffold', provider: 'fonema.ia' });
});
