import { Router } from 'express';
import { z } from 'zod';
import { registerShipment } from '../application/register-shipment.js';
import { confirmDelivery } from '../application/confirm-delivery.js';
import { getCaseStatus, getConfirmationView } from '../application/get-case-status.js';
import { processDueEmails } from '../application/process-due-emails.js';
import { getDeliveryConfirmationDeps } from '../infrastructure/composition.js';
import type { DeliveryFollowUpFinalizer } from '../../../shared/contracts/delivery-finalizer.js';
import { ValidationError } from '../../../shared/exceptions/app-error.js';
import { verifyCronSecret } from '../../../shared/middlewares/verify-cron-secret.js';

const registerShipmentSchema = z.object({
  caseId: z.string().uuid(),
  cardId: z.string().min(1).max(64),
  companyId: z.string().min(1).max(64),
  cardHolderName: z.string().min(1).max(120),
  cardLastFour: z.string().regex(/^\d{4}$/, 'cardLastFour must be exactly 4 digits'),
  physicalShippedAt: z.string().datetime().optional(),
});

const confirmSchema = z.object({
  token: z.string().min(10).max(2048),
  outcome: z.enum(['delivered_to_holder', 'not_arrived', 'holder_absent', 'return_to_bank']),
});

const tokenParamSchema = z.string().min(10).max(2048);
const caseIdParamSchema = z.string().uuid();

export function createDeliveryConfirmationRouter(finalizer: DeliveryFollowUpFinalizer): Router {
  const router = Router();

  router.post('/shipments', async (req, res) => {
    const parsed = registerShipmentSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0]?.message ?? 'Invalid shipment payload');
    }

    const deps = getDeliveryConfirmationDeps();
    const created = await registerShipment(parsed.data, deps);

    res.status(201).json({
      id: created.id,
      caseId: created.caseId,
      status: created.status,
      emailScheduledAt: created.emailScheduledAt,
    });
  });

  router.get('/confirmations/:token', async (req, res) => {
    const parsed = tokenParamSchema.safeParse(req.params.token);
    if (!parsed.success) {
      throw new ValidationError('Invalid token');
    }

    const deps = getDeliveryConfirmationDeps();
    const view = await getConfirmationView(parsed.data, deps);
    res.json(view);
  });

  router.post('/confirm', async (req, res) => {
    const parsed = confirmSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0]?.message ?? 'Invalid confirmation payload');
    }

    const deps = getDeliveryConfirmationDeps();
    const result = await confirmDelivery(parsed.data, { ...deps, finalizer });
    res.json(result);
  });

  router.get('/cron/process-due', verifyCronSecret, async (_req, res) => {
    const deps = getDeliveryConfirmationDeps();
    const processed = await processDueEmails(deps);
    res.json({ processed });
  });

  router.get('/cases/:caseId', async (req, res) => {
    const parsed = caseIdParamSchema.safeParse(req.params.caseId);
    if (!parsed.success) {
      throw new ValidationError('caseId must be a valid UUID');
    }

    const deps = getDeliveryConfirmationDeps();
    const status = await getCaseStatus(parsed.data, deps.repository);
    res.json(status);
  });

  return router;
}
