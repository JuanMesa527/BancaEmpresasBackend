import { Router } from 'express';
import type { FollowUpCallService } from '../../../shared/contracts/follow-up-call.js';
import { verifyCronSecret } from '../../../shared/middlewares/verify-cron-secret.js';
import { getActivationFollowUpDeps } from '../infrastructure/composition.js';
import { ActivationFollowUpController } from './controller.js';

export function createActivationFollowUpRouter(followUpCalls: FollowUpCallService): Router {
  const router = Router();

  let controller: ActivationFollowUpController | null = null;
  const getController = (): ActivationFollowUpController => {
    if (!controller) {
      controller = new ActivationFollowUpController(getActivationFollowUpDeps(followUpCalls));
    }
    return controller;
  };

  router.get('/health', (_req, res) => {
    res.json({ feature: 'activation-follow-up', status: 'ok', provider: 'fonema.ia' });
  });

  router.get('/cases', (req, res) => getController().listCases(req, res));
  router.post('/cases', (req, res) => getController().finalizeDelivery(req, res));
  router.post('/cases/process-reminders', (req, res) =>
    getController().processReminders(req, res),
  );
  router.post('/cases/:clienteId/usage', (req, res) => getController().registerUsage(req, res));

  router.get('/cron/process-reminders', verifyCronSecret, (req, res) =>
    getController().processReminders(req, res),
  );
  router.post('/cron/process-reminders', verifyCronSecret, (req, res) =>
    getController().processReminders(req, res),
  );

  return router;
}
