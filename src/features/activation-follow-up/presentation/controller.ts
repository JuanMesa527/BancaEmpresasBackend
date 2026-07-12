import type { Request, Response } from 'express';
import { z } from 'zod';
import { ValidationError } from '../../../shared/exceptions/app-error.js';
import type { ActivationFollowUpDeps } from '../infrastructure/composition.js';

const finalizeDeliverySchema = z.object({
  clienteId: z.string().regex(/^\d{4,15}$/, 'clienteId debe ser un NIT numérico'),
  nombre: z.string().trim().min(1).max(160).optional(),
  telefono: z.string().trim().min(7).max(20).optional(),
  correo: z.string().trim().email().max(160).optional(),
});

const clienteIdParamSchema = z.string().regex(/^\d{4,15}$/);

export class ActivationFollowUpController {
  constructor(private readonly deps: ActivationFollowUpDeps) {}

  async finalizeDelivery(req: Request, res: Response): Promise<void> {
    const parsed = finalizeDeliverySchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0]?.message ?? 'Payload inválido');
    }

    const result = await this.deps.finalizeDelivery.execute(parsed.data);
    res.status(result.yaExistia ? 200 : 201).json(result);
  }

  async listCases(_req: Request, res: Response): Promise<void> {
    const casos = await this.deps.listCases.execute();
    res.json({ total: casos.length, casos });
  }

  async registerUsage(req: Request, res: Response): Promise<void> {
    const parsed = clienteIdParamSchema.safeParse(req.params.clienteId);
    if (!parsed.success) {
      throw new ValidationError('clienteId debe ser un NIT numérico');
    }

    const caso = await this.deps.registerUsage.execute(parsed.data);
    res.json({ caso });
  }

  async processReminders(_req: Request, res: Response): Promise<void> {
    const resumen = await this.deps.processReminders.execute();
    res.json({ resumen });
  }
}
