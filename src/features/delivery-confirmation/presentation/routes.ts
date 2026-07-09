import { Router } from 'express';

/**
 * Confirmación de entrega física de tarjeta al gerente de la empresa.
 * Tras ~3–4 días del envío, se notifica por correo (Resend).
 * El gerente confirma en frontend; si no entregó / ausente / devolver,
 * se reprograma reintento a +1 día.
 */
export const deliveryConfirmationRouter = Router();

deliveryConfirmationRouter.get('/health', (_req, res) => {
  res.json({
    feature: 'delivery-confirmation',
    status: 'scaffold',
    provider: 'resend',
    outcomes: ['delivered_to_holder', 'not_arrived', 'holder_absent', 'return_to_bank'],
  });
});
